import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createMockProvider } from './test-utils';
import { AutoForm } from '../index';

if (!HTMLElement.prototype.hasPointerCapture) {
  Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
    value: () => false,
  });
}

if (!HTMLElement.prototype.setPointerCapture) {
  Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
    value: () => undefined,
  });
}

if (!HTMLElement.prototype.releasePointerCapture) {
  Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
    value: () => undefined,
  });
}

describe('AutoForm – compact array row rendering', () => {
  it('array items in compact mode do not render visible label elements', () => {
    const schema = createMockProvider([
      {
        key: 'tags',
        type: 'array',
        required: false,
        schema: [{ key: '0', type: 'string', required: true }],
      },
    ]);

    render(<AutoForm defaultValues={{ tags: ['alpha', 'beta'] }} schema={schema} testId="compact" withSubmit />);

    // The top-level "tags" field has a visible label, but individual array item
    // fields (tags.0, tags.1) use compact mode and suppress the label entirely.
    const itemFields = screen.getAllByTestId(/compact-field-tags-\d+-control/);
    expect(itemFields).toHaveLength(2);

    // Each item's FieldWrapper should not contain a label element for the item
    for (const input of itemFields) {
      const fieldWrapper = input.closest('[data-slot="field"]');
      expect(fieldWrapper).toBeTruthy();
      const labels = fieldWrapper?.querySelectorAll('[data-slot="field-label"]');
      expect(labels?.length ?? 0).toBe(0);
    }
  });

  it('array items in compact mode do not show help icons', () => {
    const schema = createMockProvider([
      {
        key: 'tags',
        type: 'array',
        required: false,
        schema: [{ key: '0', type: 'string', required: true }],
      },
    ]);

    render(<AutoForm defaultValues={{ tags: ['alpha', 'beta'] }} schema={schema} testId="compact" withSubmit />);

    const helpButtons = screen.queryAllByTestId(/help$/);
    const tagRowHelps = helpButtons.filter((el) => el.getAttribute('data-testid')?.includes('tags'));
    // Top-level "tags" field may have help, but individual rows should not
    const rowHelps = tagRowHelps.filter((el) => {
      const testId = el.getAttribute('data-testid') ?? '';
      return /\.\d+/.test(testId);
    });
    expect(rowHelps).toHaveLength(0);
  });

  it('array items in compact mode still show validation errors on submit', async () => {
    const user = userEvent.setup();
    const schema = createMockProvider(
      [
        {
          key: 'tags',
          type: 'array',
          required: false,
          schema: [{ key: '0', type: 'string', required: true }],
        },
      ],
      {},
      (values) => {
        const tags = (values as Record<string, unknown>).tags as string[] | undefined;
        const errors: { path: (string | number)[]; message: string }[] = [];
        if (tags) {
          for (let i = 0; i < tags.length; i++) {
            if ((tags[i] ?? '').length < 2) {
              errors.push({ path: ['tags', i], message: 'Too short' });
            }
          }
        }
        if (errors.length > 0) {
          return { success: false, errors };
        }
        return { success: true, data: values };
      }
    );

    render(
      <AutoForm
        defaultValues={{ tags: ['ok', 'x'] }}
        formOptions={{ mode: 'all' }}
        schema={schema}
        testId="compact"
        withSubmit
      />
    );

    // Clear the second item to trigger a min-length error
    const secondInput = screen.getByTestId('compact-field-tags-1-control');
    await user.clear(secondInput);
    await user.type(secondInput, 'a');

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/too short/i)).toBeInTheDocument();
    });
  });

  it('delete button is present and removes an item', async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([
      {
        key: 'tags',
        type: 'array',
        required: false,
        schema: [{ key: '0', type: 'string', required: true }],
      },
    ]);

    render(
      <AutoForm defaultValues={{ tags: ['alpha', 'beta', 'gamma'] }} schema={schema} testId="compact" withSubmit />
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove item/i });
    expect(removeButtons.length).toBe(3);

    await user.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /remove item/i })).toHaveLength(2);
    });
  });

  it('fields with customData.hidden are not rendered', () => {
    const schema = createMockProvider([
      { key: 'visible', type: 'string', required: true },
      { key: 'secret', type: 'string', required: true },
    ]);

    render(
      <AutoForm
        defaultValues={{ visible: 'hello', secret: 'world' }}
        fieldConfig={{ secret: { customData: { hidden: true } } }}
        schema={schema}
        testId="hidden"
        withSubmit
      />
    );

    expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('world')).not.toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="auto-form-field-row"]')).toHaveLength(1);
  });

  it('fields with customData.immutable are rendered as disabled', () => {
    const schema = createMockProvider([
      { key: 'editable', type: 'string', required: true },
      { key: 'locked', type: 'string', required: true },
    ]);

    render(
      <AutoForm
        defaultValues={{ editable: 'can edit', locked: 'read only' }}
        fieldConfig={{ locked: { customData: { immutable: true } } }}
        schema={schema}
        testId="immutable"
        withSubmit
      />
    );

    const editableInput = screen.getByDisplayValue('can edit');
    const lockedInput = screen.getByDisplayValue('read only');

    expect(editableInput).not.toBeDisabled();
    expect(lockedInput).toBeDisabled();
  });

  it('objects with customData.collapsible render collapsed by default', async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([
      {
        key: 'advancedSettings',
        type: 'object',
        required: true,
        schema: [{ key: 'retries', type: 'number', required: true }],
      },
    ]);

    render(
      <AutoForm
        defaultValues={{ advancedSettings: { retries: 3 } }}
        fieldConfig={{ advancedSettings: { customData: { collapsible: true } } }}
        schema={schema}
        testId="collapsible"
        withSubmit
      />
    );

    // The retries field should not be visible when collapsed
    expect(screen.queryByDisplayValue('3')).not.toBeInTheDocument();

    // Click the collapsible trigger to expand
    const trigger = screen.getByRole('button', { name: /advanced settings/i });
    await user.click(trigger);

    // After expanding, the retries field should be visible
    await waitFor(() => {
      expect(screen.getByDisplayValue('3')).toBeInTheDocument();
    });
  });
});
