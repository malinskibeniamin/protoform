import { describe, expect, test } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
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

describe('AutoForm accessible errors', () => {
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
