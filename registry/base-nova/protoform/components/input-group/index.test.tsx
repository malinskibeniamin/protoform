import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '.';

describe('InputGroupAddon', () => {
  it('focuses the input without adding a decorative keyboard stop', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <InputGroup>
        <InputGroupInput aria-label="Email" />
        <InputGroupAddon>
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    );

    const addon = container.querySelector('[data-slot="input-group-addon"]');
    expect(addon).toHaveAttribute('role', 'group');
    expect(addon).not.toHaveAttribute('tabindex');

    await user.click(addon as HTMLElement);
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus();
  });
});
