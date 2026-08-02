import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createMockProvider } from './test-utils';
import { AutoForm } from '../index';

describe('AutoForm – onFieldChange callback', () => {
  it('calls onFieldChange when a field value changes', async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const schema = createMockProvider([
      { key: 'name', type: 'string', required: true },
      { key: 'email', type: 'string', required: true },
    ]);

    render(
      <AutoForm
        defaultValues={{ name: 'test', email: '' }}
        onFieldChange={onFieldChange}
        schema={schema}
        testId="fieldchange"
        withSubmit
      />
    );

    const nameInput = screen.getByDisplayValue('test');
    await user.clear(nameInput);
    await user.type(nameInput, 'hello');

    await waitFor(() => {
      expect(onFieldChange).toHaveBeenCalledWith('name', expect.anything(), expect.anything());
    });

    // Verify the latest call includes the new value
    const nameCalls = onFieldChange.mock.calls.filter((args: unknown[]) => args[0] === 'name');
    expect(nameCalls.length).toBeGreaterThan(0);
    const lastCall = nameCalls[nameCalls.length - 1];
    expect(lastCall[1]).toBe('hello');
  });
});
