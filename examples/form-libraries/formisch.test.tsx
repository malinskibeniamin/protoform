import { BadRequestSchema } from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb.js';
import { Code, ConnectError } from '@connectrpc/connect';
import { Field, Form, getInput } from '@formisch/react';
import { expect, rs } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { object, pipe, string, trim } from 'valibot';
import {
  CollectionMatrixSchema,
  type EmailContract,
  EmailContractSchema,
} from '../../conformance/gen/protoform/conformance/v1/conformance_pb';
import { AutoForm } from '../../registry/base-nova/protoform/components/auto-form-formisch';
import { useProtoForm } from '../../registry/base-nova/protoform/hooks/use-proto-form-formisch';
import { OneofFormSchema } from '../gen/protoform/examples/v1/oneof_form_pb';

const emailInput = object({ email: pipe(string(), trim()) });

function NativeForm({ onSubmit }: { onSubmit: (message: EmailContract, paths: string[]) => void | Promise<void> }) {
  const form = useProtoForm(EmailContractSchema, { initialInput: { email: '' }, schema: emailInput });
  return (
    <Form
      of={form}
      onSubmit={async (message) => {
        try {
          await onSubmit(message, form.createUpdateMask().paths);
        } catch (error) {
          const result = form.setServerErrors(error);
          if (!result.handled || result.unmapped.length > 0) {
            throw error;
          }
        }
      }}
    >
      <Field of={form} path={['email']}>
        {(field) => {
          const { onBlur: handleBlur, onChange: handleChange, onFocus: handleFocus } = field.props;
          return (
            <>
              <label>
                Email
                <input
                  aria-invalid={field.errors !== null}
                  name={field.props.name}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  ref={field.props.ref}
                  value={field.input ?? ''}
                />
              </label>
              {field.errors?.join(' ')}
            </>
          );
        }}
      </Field>
      <button type="submit">Save</button>
    </Form>
  );
}

test('native Formisch reports protobuf field issues and submits a typed message after correction', async () => {
  const onSubmit = rs.fn();

  const user = userEvent.setup();
  render(<NativeForm onSubmit={onSubmit} />);
  const email = screen.getByRole('textbox', { name: /Email/u });
  await user.type(email, 'not-an-email');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(email).toHaveAttribute('aria-invalid', 'true'));
  expect(onSubmit).not.toHaveBeenCalled();

  await user.clear(email);
  await user.type(email, ' ada@example.com ');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith(
      { $typeName: 'protoform.conformance.v1.EmailContract', email: 'ada@example.com' },
      ['email']
    )
  );
});

test('native Formisch routes a Connect field violation to its control and recovers after editing', async () => {
  function save(message: EmailContract) {
    if (message.email === 'ada@blocked.example') {
      throw new ConnectError('Review your email.', Code.InvalidArgument, undefined, [
        {
          desc: BadRequestSchema,
          value: { fieldViolations: [{ description: 'Use an approved email domain.', field: 'email' }] },
        },
      ]);
    }
  }

  const user = userEvent.setup();
  render(<NativeForm onSubmit={save} />);
  const email = screen.getByRole('textbox', { name: 'Email' });
  await user.type(email, 'ada@blocked.example');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Use an approved email domain.')).toBeVisible();
  expect(email).toHaveAttribute('aria-invalid', 'true');

  await user.clear(email);
  await user.type(email, 'ada@example.com');
  await waitFor(() => expect(email).toHaveAttribute('aria-invalid', 'false'));
});

test('descriptor-driven Formisch blocks invalid submission and submits corrected protobuf values', async () => {
  const onSubmit = rs.fn();
  const user = userEvent.setup();
  render(<AutoForm onSubmit={onSubmit} schema={EmailContractSchema} withSubmit />);
  const email = screen.getByRole('textbox', { name: /Email/u });

  fireEvent.submit(screen.getByTestId('autoform'));
  await waitFor(() => expect(email).toHaveAttribute('aria-invalid', 'true'));
  expect(onSubmit).not.toHaveBeenCalled();

  await user.type(email, 'ada@example.com');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith(
      {
        $typeName: 'protoform.conformance.v1.EmailContract',
        email: 'ada@example.com',
      },
      expect.any(Object),
      expect.objectContaining({ updateMask: { $typeName: 'google.protobuf.FieldMask', paths: ['email'] } })
    )
  );
});

test('generated repeated message controls keep the remaining row when an earlier row is removed', async () => {
  const onSubmit = rs.fn();
  const user = userEvent.setup();
  render(
    <AutoForm
      defaultValues={{ children: [{ name: 'first' }, { name: 'second' }] }}
      onSubmit={(message, store) => {
        onSubmit(message, getInput(store)['children']);
      }}
      schema={CollectionMatrixSchema}
      withSubmit
    />
  );

  const first = screen.getByTestId('autoform-field-children-0-name-control');
  const second = screen.getByTestId('autoform-field-children-1-name-control');
  expect(first).toHaveValue('first');
  await user.clear(second);
  await user.type(second, 'kept');
  await user.click(screen.getByTestId('autoform-field-children-remove-0'));
  expect(screen.getByTestId('autoform-field-children-0-name-control')).toHaveValue('kept');
  fireEvent.submit(screen.getByTestId('autoform'));

  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ children: [expect.objectContaining({ name: 'kept' })] }),
      [{ name: 'kept' }]
    )
  );
});

async function selectContact(label: string) {
  fireEvent.click(screen.getByRole('combobox', { name: 'Contact' }));
  const option = await screen.findByRole('option', { name: label });
  fireEvent.pointerEnter(option, { pointerType: 'touch' });
  fireEvent.pointerDown(option, { pointerType: 'touch' });
  fireEvent.click(option);
}

test('generated oneof changes submit only the selected branch', async () => {
  const onSubmit = rs.fn();
  const user = userEvent.setup();
  render(<AutoForm onSubmit={onSubmit} schema={OneofFormSchema} withSubmit />);

  await selectContact('Email');
  await user.type(screen.getByRole('textbox', { name: 'Email' }), 'old@example.com');
  await selectContact('Phone');
  const phone = screen.getByRole('textbox', { name: 'Phone' });
  expect(phone).toHaveValue('');
  await user.type(phone, '555-0123');
  fireEvent.submit(screen.getByTestId('autoform'));

  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ contact: { case: 'phone', value: '555-0123' } }),
      expect.any(Object),
      expect.objectContaining({ updateMask: { $typeName: 'google.protobuf.FieldMask', paths: ['phone'] } })
    )
  );
});
