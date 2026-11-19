import { BadRequestSchema } from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb.js';
import { Code, ConnectError } from '@connectrpc/connect';
import { Field, Form } from '@formisch/react';
import { expect, rs } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { object, pipe, string, trim } from 'valibot';
import { type EmailContract, EmailContractSchema } from '@/conformance/gen/protoform/conformance/v1/conformance_pb';
import { observeCallback } from '../../components/auto-form/index.test-utils';
import { useProtoForm } from '.';

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
  const onSubmitSignal = observeCallback(onSubmit);

  const user = userEvent.setup();
  render(<NativeForm onSubmit={onSubmitSignal.handleCall} />);
  const email = screen.getByRole('textbox', { name: /Email/u });
  await user.type(email, 'not-an-email');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(email).toHaveAttribute('aria-invalid', 'true'));
  expect(onSubmit).not.toHaveBeenCalled();

  await user.clear(email);
  await user.type(email, ' ada@example.com ');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await onSubmitSignal.after(1);
  expect(onSubmit).toHaveBeenCalledWith(
    { $typeName: 'protoform.conformance.v1.EmailContract', email: 'ada@example.com' },
    ['email']
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
