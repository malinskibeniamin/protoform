import { create } from '@bufbuild/protobuf';
import { describe, expect, rs } from '@rstest/core';
import { act, render, renderHook, screen } from '@testing-library/react';
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
    const view = renderHook(() => {
      const form = useProtoForm(TransitiveCelConsumerSchema, {
        defaultValues: create(TransitiveCelConsumerSchema, {
          deployment: { environment: DeploymentPolicy_Environment.STAGING, releaseTrack: ReleaseTrack.PREVIEW },
        }),
      });
      return { errors: form.formState.errors, form };
    });
    const invalid = await act<boolean>(() => view.result.current.form.trigger());

    expect(invalid).toBe(false);
    expect(view.result.current.errors.deployment?.message).toBe(
      'Production deployments require the stable release track.'
    );

    const valid = await act<boolean>(() => {
      const { form } = view.result.current;
      form.setValue('deployment', {
        environment: DeploymentPolicy_Environment.PRODUCTION,
        releaseTrack: ReleaseTrack.STABLE,
      });
      return form.trigger();
    });
    expect(valid).toBe(true);
    expect(view.result.current.errors).toEqual({});
  });

  test('blocks CEL runtime failures safely through useProtoForm and recovers', async () => {
    const view = renderHook(() => {
      const form = useProtoForm(InvalidCelRuntimeSchema, {
        defaultValues: create(InvalidCelRuntimeSchema, { value: 0 }),
      });
      return { errors: form.formState.errors, form };
    });
    const invalid = await act<boolean>(() => view.result.current.form.trigger());

    expect(invalid).toBe(false);
    expect(view.result.current.errors.root?.message).toBe('Validation could not be completed.');
    const valid = await act<boolean>(() => {
      const { form } = view.result.current;
      form.setValue('value', 1);
      return form.trigger();
    });
    expect(valid).toBe(true);
    expect(view.result.current.errors).toEqual({});
  });

  test('submits descriptor-aware valid values through AutoForm', async () => {
    const user = userEvent.setup();
    const submission = Promise.withResolvers<unknown>();
    const handleSubmit = submission.resolve;
    render(
      <AutoForm
        defaultValues={{
          deployment: { environment: 20, releaseTrack: 7 },
        }}
        onSubmit={handleSubmit}
        schema={TransitiveCelConsumerSchema}
        withSubmit
      />
    );

    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));

    await expect(submission.promise).resolves.toMatchObject({
      deployment: { environment: 20, releaseTrack: 7 },
    });
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
    const submission = Promise.withResolvers<unknown>();
    const messages: unknown[] = [];
    render(
      <AutoForm
        defaultValues={{ value: 0 }}
        onSubmit={(message) => {
          messages.push(message);
          submission.resolve(message);
        }}
        schema={InvalidCelRuntimeSchema}
        testId="runtime-cel"
        withSubmit
      />
    );

    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));

    expect(await screen.findByText('Validation could not be completed.')).toBeVisible();
    expect(messages).toEqual([]);
    const input = screen.getByRole('spinbutton', { name: 'Value' });
    await user.clear(input);
    await user.type(input, '1');
    await user.click(screen.getByRole('button', { name: SUBMIT_BUTTON }));
    await expect(submission.promise).resolves.toMatchObject({ value: 1 });
    expect(messages).toHaveLength(1);
    expect(screen.queryByText('int divide by zero')).not.toBeInTheDocument();
  });
});
