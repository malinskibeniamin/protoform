import type { MessageShape } from '@bufbuild/protobuf';
import { afterEach, describe, expect, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';
import { SubmitBasicFormRequestSchema } from '@/examples/gen/protoform/examples/v1/forms_pb.js';
import { AutoForm } from '..';
import { Form } from '../field-wrapper';
import { createMockProvider } from './test-utils';

const validDefaults = { displayName: 'Ada', email: 'ada@example.com', role: 'Engineer' };

function ConsumerForm(props: React.ComponentProps<typeof Form>) {
  return <Form {...props} data-consumer-form="true" />;
}

describe('autoForm native submission', () => {
  afterEach(() => {
    rs.restoreAllMocks();
  });

  test('sends form values through native submission props while preserving the protobuf callback', async () => {
    const user = userEvent.setup();
    const response = new Response(null, { status: 409 });
    const fetch = rs.spyOn(globalThis, 'fetch').mockResolvedValue(response);
    const onSuccess = rs.fn();
    const onNativeSubmit = rs.fn();
    const onSubmit = rs.fn<(message: MessageShape<typeof SubmitBasicFormRequestSchema>) => void>();
    render(
      <AutoForm
        defaultValues={validDefaults}
        formProps={{
          action: '/api/profiles',
          encType: 'application/json',
          headers: { Authorization: 'Bearer example' },
          id: 'profile-form',
          method: 'put',
          onSubmit: onNativeSubmit,
          onSuccess,
          validateStatus: (status) => status === 409,
        }}
        onSubmit={onSubmit}
        schema={SubmitBasicFormRequestSchema}
        uiComponents={{ Form: ConsumerForm }}
        withSubmit
      />
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith(
      '/api/profiles',
      expect.objectContaining({
        body: JSON.stringify({ displayName: 'Ada', email: 'ada@example.com', role: 'Engineer' }),
        headers: { Authorization: 'Bearer example', 'Content-Type': 'application/json' },
        method: 'put',
      })
    );
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ $typeName: 'protoform.examples.v1.SubmitBasicFormRequest', displayName: 'Ada' }),
      expect.anything(),
      expect.anything()
    );
    expect(onSuccess).toHaveBeenCalledWith({ response });
    expect(onNativeSubmit).toHaveBeenCalledWith(expect.objectContaining({ data: validDefaults }));
    expect(screen.getByTestId('autoform')).toHaveAttribute('id', 'profile-form');
    expect(screen.getByTestId('autoform')).not.toHaveAttribute('headers');
    expect(screen.getByTestId('autoform')).toHaveAttribute('data-consumer-form', 'true');
  });

  test.each(['HTTP', 'network'] as const)(
    'renders %s request failures and allows a successful retry',
    async (failure) => {
      const user = userEvent.setup();
      const fetch = rs.spyOn(globalThis, 'fetch');
      if (failure === 'HTTP') {
        fetch.mockResolvedValueOnce(new Response(null, { status: 503 }));
      } else {
        fetch.mockRejectedValueOnce(new Error('Offline'));
      }
      fetch.mockResolvedValueOnce(new Response(null, { status: 204 }));
      const onError = rs.fn();
      const onSuccess = rs.fn();
      render(
        <AutoForm
          defaultValues={validDefaults}
          formProps={{ action: '/api/profiles', onError, onSuccess }}
          schema={SubmitBasicFormRequestSchema}
          withSubmit
        />
      );

      await user.click(screen.getByRole('button', { name: 'Submit' }));
      expect(await screen.findByText(failure === 'HTTP' ? 'Submission failed.' : 'Offline')).toBeVisible();
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'Submit' }));
      await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(fetch).toHaveBeenCalledTimes(2);
    }
  );

  test('does not send requests for failed provider validation or a rejected protobuf callback', async () => {
    const user = userEvent.setup();
    const fetch = rs.spyOn(globalThis, 'fetch');
    const provider = createMockProvider([{ key: 'name', required: true, type: 'string' }], { name: 'Ada' }, () => ({
      errors: [{ message: 'Name is reserved', path: ['name'] }],
      success: false,
    }));
    const view = render(<AutoForm formProps={{ action: '/api/profiles' }} schema={provider} withSubmit />);
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Name is reserved')).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();

    view.unmount();
    render(
      <AutoForm
        defaultValues={validDefaults}
        formProps={{ action: '/api/profiles' }}
        onSubmit={() => Promise.reject(new Error('Preparation failed'))}
        schema={SubmitBasicFormRequestSchema}
        withSubmit
      />
    );
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Preparation failed')).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('passes form data to function actions without incompatible native attributes', async () => {
    const user = userEvent.setup();
    const action = rs.fn<(data: FormData) => Promise<void>>().mockResolvedValue(undefined);
    render(
      <AutoForm
        defaultValues={validDefaults}
        formProps={{ action, encType: 'application/json', method: 'put' }}
        schema={SubmitBasicFormRequestSchema}
        withSubmit
      />
    );
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect(action.mock.calls[0]?.[0].get('email')).toBe('ada@example.com');
    expect(action.mock.calls[0]?.[0].has('$typeName')).toBe(false);
    expect(screen.getByTestId('autoform')).not.toHaveAttribute('method');
    expect(screen.getByTestId('autoform')).not.toHaveAttribute('enctype');
  });

  test('does not send a request when a submission callback reports a field error without throwing', async () => {
    const user = userEvent.setup();
    const fetch = rs.spyOn(globalThis, 'fetch');
    render(
      <AutoForm
        defaultValues={validDefaults}
        formProps={{ action: '/api/profiles' }}
        onSubmit={(_message, form) => {
          form.setError('email', { message: 'Email is already registered', type: 'server' });
        }}
        schema={SubmitBasicFormRequestSchema}
        withSubmit
      />
    );
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Email is already registered')).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('ignores duplicate external submissions while the native request is pending', async () => {
    const user = userEvent.setup();
    const pending = Promise.withResolvers<Response>();
    const fetch = rs
      .spyOn(globalThis, 'fetch')
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValue(new Response(null, { status: 204 }));
    const onSuccess = rs.fn();
    render(
      <>
        <AutoForm
          defaultValues={validDefaults}
          formProps={{ action: '/api/profiles', id: 'profile-form', onSuccess }}
          schema={SubmitBasicFormRequestSchema}
          withSubmit
        />
        <Button form="profile-form" type="submit">
          Save externally
        </Button>
      </>
    );
    await user.dblClick(screen.getByRole('button', { name: 'Save externally' }));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Submitting…' })).toBeDisabled();
    pending.resolve(new Response(null, { status: 204 }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    await user.click(screen.getByRole('button', { name: 'Save externally' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(2));
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
