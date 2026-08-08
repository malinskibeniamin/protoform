import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AutoForm as TanStackAutoForm } from '../../auto-form-tanstack';
import { AutoForm as ReactHookAutoForm } from '../index';
import { createMockProvider } from './test-utils';

const deprecated = { deprecated: true };
const schema = createMockProvider(
  [
    {
      fieldConfig: { label: 'Legacy name' },
      hints: deprecated,
      key: 'legacyName',
      required: false,
      type: 'string',
    },
    {
      fieldConfig: { label: 'Profile' },
      key: 'profile',
      required: false,
      schema: [
        {
          fieldConfig: { label: 'Legacy detail' },
          hints: deprecated,
          key: 'legacyDetail',
          required: false,
          type: 'string',
        },
      ],
      type: 'object',
    },
    {
      fieldConfig: { label: 'Contact' },
      key: 'contact',
      required: false,
      schema: [
        {
          fieldConfig: { label: 'Legacy contact' },
          hints: deprecated,
          key: 'legacyContact',
          required: false,
          type: 'string',
        },
        {
          fieldConfig: { label: 'Current contact' },
          key: 'currentContact',
          required: false,
          type: 'string',
        },
      ],
      type: 'oneof',
    },
  ],
  {
    contact: { case: 'legacyContact', value: 'saved@example.com' },
    legacyName: 'saved name',
    profile: { legacyDetail: 'saved detail' },
  }
);

describe.each([
  ['React Hook Form', ReactHookAutoForm],
  ['TanStack Form', TanStackAutoForm],
] as const)('%s deprecated field policy', (_name, AutoForm) => {
  it('shows deprecated fields by default', () => {
    render(<AutoForm schema={schema} />);

    expect(screen.getByRole('textbox', { name: 'Legacy name' })).toBeEnabled();
    expect(screen.getByRole('textbox', { name: 'Legacy detail' })).toBeEnabled();
    expect(screen.getByRole('combobox', { name: 'Contact' })).toBeEnabled();
    expect(screen.getByRole('textbox', { name: 'Legacy contact' })).toBeEnabled();
  });

  it('disables deprecated fields and an active deprecated oneof branch', () => {
    render(<AutoForm deprecatedFields="disable" schema={schema} />);

    expect(screen.getByRole('textbox', { name: 'Legacy name' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Legacy detail' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Contact' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Legacy contact' })).toBeDisabled();
  });

  it('hides deprecated fields and choices while preserving their submitted values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <AutoForm
        deprecatedFields="hide"
        onSubmit={onSubmit}
        schema={schema}
        withSubmit
      />
    );

    expect(screen.queryByRole('textbox', { name: 'Legacy name' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Legacy detail' })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Legacy contact' })).not.toBeInTheDocument();

    const contactSelector = screen.getByRole('combobox', { name: 'Contact' });
    expect(contactSelector).not.toHaveTextContent('Legacy contact');
    fireEvent.click(contactSelector);
    expect(screen.queryByRole('option', { name: 'Legacy contact' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Current contact' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      contact: { case: 'legacyContact', value: 'saved@example.com' },
      legacyName: 'saved name',
      profile: { legacyDetail: 'saved detail' },
    });
  });
});
