import { getInput } from '@formisch/react';
import { expect, rs } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollectionMatrixSchema, EmailContractSchema } from '@/conformance/gen/protoform/conformance/v1/conformance_pb';
import { OneofFormSchema } from '@/examples/gen/protoform/examples/v1/oneof_form_pb';
import { observeCallback } from '../auto-form/index.test-utils';
import { AutoForm } from '.';

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
  const onSubmitSignal = observeCallback(onSubmit);
  const user = userEvent.setup();
  render(<AutoForm onSubmit={onSubmitSignal.handleCall} schema={OneofFormSchema} withSubmit />);

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
