import { create } from '@bufbuild/protobuf';
import { describe, expect, rs, test } from '@rstest/core';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { getDemoSchema } from '@/registry/base-nova/protoform/demo/runtime/demo-schemas';
import { AutoForm, shadcnUIComponents } from '..';
import { createMockProvider } from './test-utils';

function ConsumerInput({ testId, ...props }: React.ComponentProps<'input'> & { testId?: string }) {
  return <input data-testid={testId} {...props} />;
}

function ConsumerTextarea({
  testId,
  resize: _resize,
  ...props
}: React.ComponentProps<'textarea'> & {
  testId?: string;
  resize?: string;
}) {
  return <textarea data-testid={testId} {...props} />;
}

const components = {
  ...shadcnUIComponents,
  Input: ConsumerInput,
  InputGroupInput: ConsumerInput,
  Textarea: ConsumerTextarea,
};

describe('autoForm accessible errors', () => {
  test.each([
    { tags: ['forms', 'one', 'two', 'three'], message: 'must contain no more than 3 item(s)' },
    { tags: ['forms', 'forms'], message: 'repeated value must contain unique items' },
  ])('announces collection validation and clears it after correction: $message', async ({ tags, message }) => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    const demo = getDemoSchema('validation');
    render(
      <AutoForm
        defaultValues={create(demo.schema, { ...demo.defaultValues, labels: { team: 'forms' }, tags })}
        onSubmit={onSubmit}
        schema={demo.schema}
        withSubmit
      />
    );
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText(message)).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
    const group = screen.getByRole('group', { name: /^Tags/u });
    expect(group).toHaveAccessibleDescription(message);
    expect(group).toHaveAttribute('aria-invalid', 'true');
    const remove = within(group).getAllByRole('button', { name: 'Remove item' }).at(-1);
    if (!remove) {
      throw new Error('Expected a removable tag.');
    }
    await user.click(remove);
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(group).not.toHaveAccessibleDescription();
    expect(group).not.toHaveAttribute('aria-invalid', 'true');
  });

  test.each(['email', 'textarea'])('links %s consumer inputs to validation errors', async (fieldType) => {
    const user = userEvent.setup();
    const schema = createMockProvider([{ key: 'value', required: false, type: 'string' }], {}, (values) =>
      values['value']
        ? { data: values, success: true }
        : {
            errors: [{ message: 'Enter a value', path: ['value'] }],
            success: false,
          }
    );
    render(<AutoForm components={components} fieldConfig={{ value: { fieldType } }} schema={schema} withSubmit />);
    const input = screen.getByRole('textbox', { name: 'Value' });
    expect(input).not.toHaveAccessibleDescription();
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(input).toHaveAccessibleDescription('Enter a value'));
    expect(input).toHaveAttribute('aria-invalid', 'true');
    await user.type(input, 'valid@example.com');
    await waitFor(() => expect(input).not.toHaveAccessibleDescription());
    expect(input).not.toHaveAttribute('aria-describedby');
  });
});

test('keeps every same-field error and links selection controls to their errors', async () => {
  const user = userEvent.setup();
  const schema = createMockProvider(
    [
      { key: 'title', required: true, type: 'string' },
      {
        key: 'choice',
        required: true,
        type: 'select',
        options: [
          ['one', 'One'],
          ['two', 'Two'],
          ['three', 'Three'],
          ['four', 'Four'],
        ],
      },
      {
        key: 'choices',
        required: false,
        type: 'array',
        schema: [
          {
            key: 'value',
            required: false,
            type: 'select',
            options: [
              ['one', 'One'],
              ['two', 'Two'],
            ],
          },
        ],
      },
    ],
    {},
    () => ({
      success: false,
      errors: [
        { path: ['title'], message: 'Enter a title' },
        { path: ['title'], message: 'Use at least three characters' },
        { path: ['choice'], message: 'Choose an option' },
        { path: ['choices'], message: 'Choose more options' },
      ],
    })
  );
  render(<AutoForm schema={schema} withSubmit />);
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: /Title/u })).toHaveAccessibleDescription(
      /Enter a title\s+Use at least three characters/u
    )
  );
  expect(screen.getByText('Enter a title', { exact: true }).tagName).toBe('LI');
  expect(screen.getByText('Use at least three characters', { exact: true }).tagName).toBe('LI');
  const select = screen.getByRole('combobox', { name: 'Choice' });
  const multi = screen.getByRole('button', { name: 'Multi-select trigger' });
  expect(select).toHaveAttribute('aria-invalid', 'true');
  expect(select).toHaveAccessibleDescription('Choose an option');
  expect(multi).toHaveAttribute('aria-invalid', 'true');
  expect(multi).toHaveAccessibleDescription('Choose more options');
});
