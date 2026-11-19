import { create, createFileRegistry } from '@bufbuild/protobuf';
import { FieldDescriptorProto_Type, FileDescriptorProtoSchema } from '@bufbuild/protobuf/wkt';
import { afterAll, afterEach, beforeAll, describe, expect, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { Form, type FormSubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SubmitBasicFormRequestSchema } from '@/examples/gen/protoform/examples/v1/forms_pb.js';
import { useProtoForm } from './index.js';

const documentAction = 'http://localhost/api/documents';
const profileAction = 'http://localhost/api/profiles';
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const registry = createFileRegistry(
  create(FileDescriptorProtoSchema, {
    messageType: [
      {
        field: [
          { name: 'title', number: 1, type: FieldDescriptorProto_Type.STRING },
          { name: 'revision', number: 2, type: FieldDescriptorProto_Type.INT64 },
          { name: 'content', number: 3, type: FieldDescriptorProto_Type.BYTES },
        ],
        name: 'FormSubmission',
      },
    ],
    name: 'form_submission.proto',
    package: 'test',
    syntax: 'proto3',
  }),
  () => undefined
);
const descriptor = registry.getMessage('test.FormSubmission');
if (!descriptor) {
  throw new Error('Missing form submission descriptor');
}
const schema = descriptor;

function FormHarness({ onSubmit }: { onSubmit: FormSubmitHandler<Record<string, unknown>> }) {
  const form = useProtoForm(schema, {
    defaultValues: { content: 'AQID', revision: '9007199254740993', title: 'Before' },
  });
  const { name, onBlur: handleBlur, onChange: handleChange, ref } = form.register('title');

  return (
    <Form action={documentAction} control={form.control} encType="application/json" onSubmit={onSubmit}>
      <Input aria-label="Title" name={name} onBlur={handleBlur} onChange={handleChange} ref={ref} />
      <Button disabled={form.formState.isSubmitting} type="submit">
        Save
      </Button>
    </Form>
  );
}

function ValidatedFormHarness() {
  const form = useProtoForm(SubmitBasicFormRequestSchema, {
    defaultValues: { displayName: 'Ada', email: 'invalid', role: 'Engineer' },
  });
  const { errors, isSubmitting, isSubmitSuccessful } = form.formState;
  const { name, onBlur: handleBlur, onChange: handleChange, ref } = form.register('email');

  return (
    <Form action={profileAction} control={form.control} encType="application/json">
      <Input
        aria-invalid={Boolean(errors.email)}
        aria-label="Email"
        name={name}
        onBlur={handleBlur}
        onChange={handleChange}
        ref={ref}
      />
      {errors.email ? <p role="alert">{errors.email.message}</p> : null}
      {errors.root?.['server'] ? <p role="alert">Request failed: {errors.root['server'].type}</p> : null}
      {isSubmitSuccessful ? <p role="status">Saved</p> : null}
      <Button disabled={isSubmitting} type="submit">
        Save
      </Button>
    </Form>
  );
}

describe('useProtoForm with the native Form component', () => {
  test('submits JSON-safe form values without protobuf metadata or lossy scalar conversion', async () => {
    const user = userEvent.setup();
    const received = Promise.withResolvers<Request>();
    server.use(
      http.post(documentAction, ({ request }) => {
        received.resolve(request);
        return new HttpResponse(null, { status: 204 });
      })
    );
    const onSubmit = rs.fn<FormSubmitHandler<Record<string, unknown>>>();
    render(<FormHarness onSubmit={onSubmit} />);

    await user.clear(screen.getByRole('textbox', { name: 'Title' }));
    await user.paste('After');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const data = { content: 'AQID', revision: '9007199254740993', title: 'After' };
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ data, formDataJson: JSON.stringify(data) }));
    const sent = await received.promise;
    await expect(sent.json()).resolves.toEqual(data);
    const submission = onSubmit.mock.calls[0]?.[0];
    expect(submission?.formData.get('revision')).toBe('9007199254740993');
    expect(submission?.formData.get('content')).toBe('AQID');
    expect(submission?.formData.has('$typeName')).toBe(false);
  });

  test('blocks invalid values and recovers from a failed request on the next valid submission', async () => {
    const user = userEvent.setup();
    const requests: Request[] = [];
    server.use(
      http.post(profileAction, ({ request }) => {
        requests.push(request);
        return new HttpResponse(null, { status: requests.length === 1 ? 503 : 204 });
      })
    );
    render(<ValidatedFormHarness />);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true'));
    expect(requests).toHaveLength(0);

    await user.clear(screen.getByRole('textbox', { name: 'Email' }));
    await user.paste('ada@example.com');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Request failed: 503');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Saved');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(requests).toHaveLength(2);
    await expect(requests[1]?.json()).resolves.toMatchObject({ email: 'ada@example.com' });
  });
});
