import { create, createFileRegistry } from '@bufbuild/protobuf';
import { FieldDescriptorProto_Type, FileDescriptorProtoSchema } from '@bufbuild/protobuf/wkt';
import { afterEach, describe, expect, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, type FormSubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SubmitBasicFormRequestSchema } from '@/examples/gen/protoform/examples/v1/forms_pb.js';
import { useProtoForm } from './index.js';

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
    <Form action="/api/documents" control={form.control} encType="application/json" onSubmit={onSubmit}>
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
    <Form action="/api/profiles" control={form.control}>
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
  afterEach(() => {
    rs.restoreAllMocks();
  });

  test('submits JSON-safe form values without protobuf metadata or lossy scalar conversion', async () => {
    const user = userEvent.setup();
    const fetch = rs.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
    const onSubmit = rs.fn<FormSubmitHandler<Record<string, unknown>>>();
    render(<FormHarness onSubmit={onSubmit} />);

    await user.clear(screen.getByRole('textbox', { name: 'Title' }));
    await user.paste('After');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const data = { content: 'AQID', revision: '9007199254740993', title: 'After' };
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ data, formDataJson: JSON.stringify(data) }));
    expect(fetch).toHaveBeenCalledWith(
      '/api/documents',
      expect.objectContaining({ body: JSON.stringify(data), method: 'post' })
    );
    const submission = onSubmit.mock.calls[0]?.[0];
    expect(submission?.formData.get('revision')).toBe('9007199254740993');
    expect(submission?.formData.get('content')).toBe('AQID');
    expect(submission?.formData.has('$typeName')).toBe(false);
  });

  test('blocks invalid values and recovers from a failed request on the next valid submission', async () => {
    const user = userEvent.setup();
    const fetch = rs
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    render(<ValidatedFormHarness />);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true'));
    expect(fetch).not.toHaveBeenCalled();

    await user.clear(screen.getByRole('textbox', { name: 'Email' }));
    await user.paste('ada@example.com');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Request failed: 503');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Saved');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1]?.[1]?.body).toBeInstanceOf(FormData);
  });
});
