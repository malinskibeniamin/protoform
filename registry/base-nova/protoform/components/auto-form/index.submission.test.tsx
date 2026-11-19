import type { MessageShape } from '@bufbuild/protobuf';
import { afterAll, afterEach, beforeAll, describe, expect, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { Button } from '@/components/ui/button';
import { SubmitBasicFormRequestSchema } from '@/examples/gen/protoform/examples/v1/forms_pb.js';
import { AutoForm } from '.';
import { Form } from './field-wrapper';

const actionUrl = 'http://localhost/api/profiles';
const validDefaults = { displayName: 'Ada', email: 'ada@example.com', role: 'Engineer' };
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function ConsumerForm(props: React.ComponentProps<typeof Form>) {
  return <Form {...props} data-consumer-form="true" />;
}

describe('autoForm native submission', () => {
  test('sends the selected method, headers and JSON without protobuf internals', async () => {
    const received = Promise.withResolvers<Request>();
    const native = Promise.withResolvers<Record<string, unknown>>();
    const saved = Promise.withResolvers<Response>();
    server.use(
      http.put(actionUrl, ({ request }) => {
        received.resolve(request);
        return new HttpResponse(null, { status: 409 });
      })
    );
    const user = userEvent.setup();
    const onSubmit = rs.fn<(message: MessageShape<typeof SubmitBasicFormRequestSchema>) => void>();

    render(
      <AutoForm
        defaultValues={validDefaults}
        formProps={{
          action: actionUrl,
          encType: 'application/json',
          headers: { Authorization: 'Bearer example' },
          id: 'profile-form',
          method: 'put',
          onSubmit: ({ data }) => native.resolve(data),
          onSuccess: ({ response }) => saved.resolve(response),
          validateStatus: (status) => status === 409,
        }}
        onSubmit={onSubmit}
        schema={SubmitBasicFormRequestSchema}
        uiComponents={{ Form: ConsumerForm }}
        withSubmit
      />
    );
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    const sent = await received.promise;
    expect(sent.headers.get('authorization')).toBe('Bearer example');
    expect(sent.headers.get('content-type')).toBe('application/json');
    await expect(sent.json()).resolves.toEqual(validDefaults);
    expect(await native.promise).toEqual(validDefaults);
    const accepted = await saved.promise;
    expect(accepted.status).toBe(409);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ $typeName: 'protoform.examples.v1.SubmitBasicFormRequest', displayName: 'Ada' }),
      expect.anything(),
      expect.anything()
    );
    expect(screen.getByTestId('autoform')).toHaveAttribute('id', 'profile-form');
    expect(screen.getByTestId('autoform')).not.toHaveAttribute('headers');
    expect(screen.getByTestId('autoform')).toHaveAttribute('data-consumer-form', 'true');
  });

  test.each([
    { failure: 'HTTP', response: () => new HttpResponse(null, { status: 503 }), message: 'Submission failed.' },
    { failure: 'network', response: () => HttpResponse.error(), message: 'Failed to fetch' },
  ])('renders $failure request failures and allows a successful retry', async ({ response, message }) => {
    server.use(
      http.post(actionUrl, response, { once: true }),
      http.post(actionUrl, () => new HttpResponse(null, { status: 204 }))
    );
    const saved = Promise.withResolvers<Response>();
    const onError = rs.fn();
    const user = userEvent.setup();

    render(
      <AutoForm
        defaultValues={validDefaults}
        formProps={{ action: actionUrl, onError, onSuccess: ({ response: result }) => saved.resolve(result) }}
        schema={SubmitBasicFormRequestSchema}
        withSubmit
      />
    );
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText(message)).toBeVisible();
    expect(onError).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    const retried = await saved.promise;
    expect(retried.status).toBe(204);
    expect(onError).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test.each([
    { blockedBy: 'provider validation', email: 'invalid', message: /valid email address/iu },
    { blockedBy: 'a reported field error', email: validDefaults.email, message: 'Email is already registered' },
    { blockedBy: 'a rejected callback', email: validDefaults.email, message: 'Preparation failed' },
  ])('makes no request when blocked by $blockedBy', async ({ blockedBy, email, message }) => {
    const fetch = rs.spyOn(globalThis, 'fetch');
    const user = userEvent.setup();

    try {
      render(
        <AutoForm
          defaultValues={{ ...validDefaults, email }}
          formProps={{ action: actionUrl }}
          onSubmit={(_message, form) => {
            if (blockedBy === 'a rejected callback') {
              return Promise.reject(new Error('Preparation failed'));
            }
            form.setError('email', { message: 'Email is already registered', type: 'server' });
            return Promise.resolve();
          }}
          schema={SubmitBasicFormRequestSchema}
          withSubmit
        />
      );
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      expect(await screen.findByText(message)).toBeVisible();
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      fetch.mockRestore();
    }
  });

  test('passes form data to function actions without incompatible native attributes', async () => {
    const received = Promise.withResolvers<FormData>();
    const user = userEvent.setup();

    render(
      <AutoForm
        defaultValues={validDefaults}
        formProps={{ action: received.resolve, encType: 'application/json', method: 'put' }}
        schema={SubmitBasicFormRequestSchema}
        withSubmit
      />
    );
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    const data = await received.promise;
    expect(data.get('email')).toBe('ada@example.com');
    expect(data.has('$typeName')).toBe(false);
    expect(screen.getByTestId('autoform')).not.toHaveAttribute('method');
    expect(screen.getByTestId('autoform')).not.toHaveAttribute('enctype');
  });

  test('ignores duplicate external submissions while the native request is pending', async () => {
    const pending = Promise.withResolvers<undefined>();
    const received = Promise.withResolvers<Request>();
    const first = Promise.withResolvers<Response>();
    const second = Promise.withResolvers<Response>();
    let requests = 0;
    server.use(
      http.post(actionUrl, async ({ request }) => {
        requests += 1;
        received.resolve(request);
        await pending.promise;
        return new HttpResponse(null, { status: 204 });
      })
    );
    const user = userEvent.setup();
    render(
      <>
        <AutoForm
          defaultValues={validDefaults}
          formProps={{
            action: actionUrl,
            id: 'profile-form',
            onSuccess: ({ response }) => (requests === 1 ? first : second).resolve(response),
          }}
          schema={SubmitBasicFormRequestSchema}
          withSubmit
        />
        <Button form="profile-form" type="submit">
          Save externally
        </Button>
      </>
    );
    const button = screen.getByRole('button', { name: 'Save externally' });
    try {
      await user.dblClick(button);
      await received.promise;
      expect(requests).toBe(1);
      expect(screen.getByRole('button', { name: 'Submitting…' })).toBeDisabled();
    } finally {
      pending.resolve(undefined);
    }
    const initial = await first.promise;
    expect(initial.status).toBe(204);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
    await user.click(button);
    const next = await second.promise;
    expect(next.status).toBe(204);
    expect(requests).toBe(2);
  });
});
