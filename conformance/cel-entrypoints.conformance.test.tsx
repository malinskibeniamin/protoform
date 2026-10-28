import { create } from '@bufbuild/protobuf';
import { describe, expect, rs } from '@rstest/core';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AutoForm } from '../registry/base-nova/protoform/components/auto-form/index.js';
import { useProtoForm } from '../registry/base-nova/protoform/hooks/use-proto-form/index.js';
import { InvalidCelRuntimeSchema } from './gen/protoform/conformance/v1/expected_failures_pb.js';
import { TransitiveCelConsumerSchema } from './gen/protoform/conformance/v1/transitive_cel_pb.js';
import { DeploymentPolicy_Environment } from './gen/protoform/fixtures/deployment/v1/policy_pb.js';
import { ReleaseTrack } from './gen/protoform/fixtures/shared/v1/release_pb.js';

const SUBMIT_BUTTON = /submit/iu;

describe('descriptor-aware CEL entrypoints', () => {
  test('resolves transitive imported and nested enum symbols through useProtoForm', async () => {
    const valid = renderHook(() =>
      useProtoForm(TransitiveCelConsumerSchema, {
        defaultValues: create(TransitiveCelConsumerSchema, {
          deployment: { environment: DeploymentPolicy_Environment.PRODUCTION, releaseTrack: ReleaseTrack.STABLE },
        }),
      })
    );
    const invalid = renderHook(() =>
      useProtoForm(TransitiveCelConsumerSchema, {
        defaultValues: create(TransitiveCelConsumerSchema, {
          deployment: { environment: DeploymentPolicy_Environment.STAGING, releaseTrack: ReleaseTrack.PREVIEW },
        }),
      })
    );
    let validResult = false;
    let invalidResult = true;

    await act(async () => {
      validResult = await valid.result.current.trigger();
      invalidResult = await invalid.result.current.trigger();
    });

    expect(validResult).toBe(true);
    expect(invalidResult).toBe(false);
    await waitFor(() => {
      expect(invalid.result.current.formState.errors.deployment?.message).toBe(
        'Production deployments require the stable release track.'
      );
    });
  });

  test('blocks CEL runtime failures safely through useProtoForm and recovers', async () => {
    const form = renderHook(() =>
      useProtoForm(InvalidCelRuntimeSchema, {
        defaultValues: create(InvalidCelRuntimeSchema, { value: 0 }),
      })
    );
    let result = true;

    await act(async () => {
      result = await form.result.current.trigger();
    });

    expect(result).toBe(false);
    expect(form.result.current.formState.errors.root?.message).toBe('Validation could not be completed.');
    await act(async () => {
      form.result.current.setValue('value', 1);
      result = await form.result.current.trigger();
    });
    expect(result).toBe(true);
    expect(form.result.current.formState.errors).toEqual({});
  });

  test('submits descriptor-aware valid values through AutoForm', async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    render(
      <AutoForm
        defaultValues={{
          deployment: { environment: 20, releaseTrack: 7 },
        }}
        onSubmit={onSubmit}
        schema={TransitiveCelConsumerSchema}
        withSubmit
      />
    );

    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  test('renders the declared CEL message at its form path through AutoForm', async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    render(
      <AutoForm
        defaultValues={{
          deployment: { environment: 10, releaseTrack: 9 },
        }}
        onSubmit={onSubmit}
        schema={TransitiveCelConsumerSchema}
        testId="transitive-cel"
        withSubmit
      />
    );

    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));

    expect(await screen.findByTestId('transitive-cel-field-deployment-error')).toHaveTextContent(
      'Production deployments require the stable release track.'
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('blocks CEL runtime failures safely through AutoForm and recovers', async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    render(
      <AutoForm
        defaultValues={{ value: 0 }}
        onSubmit={onSubmit}
        schema={InvalidCelRuntimeSchema}
        testId="runtime-cel"
        withSubmit
      />
    );

    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));

    await waitFor(() => expect(screen.getByText('Validation could not be completed.')).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
    const input = screen.getByRole('spinbutton', { name: 'Value' });
    await user.clear(input);
    await user.type(input, '1');
    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ value: 1 });
    expect(screen.queryByText('int divide by zero')).not.toBeInTheDocument();
  });
});
