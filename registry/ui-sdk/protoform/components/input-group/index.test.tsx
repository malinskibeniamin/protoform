import { describe, expect } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '.';

describe('inputGroupAddon', () => {
  test('focuses the input without adding a decorative keyboard stop', async () => {
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
    expect(addon).not.toHaveAttribute('role');
    expect(addon).not.toHaveAttribute('tabindex');

    if (!(addon instanceof HTMLElement)) {
      throw new TypeError('Expected an HTML input addon.');
    }
    await user.click(addon);
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus();
  });
});
