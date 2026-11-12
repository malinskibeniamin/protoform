import { describe, expect } from '@rstest/core';
import { render, screen } from '@testing-library/react';

import { Popover, PopoverTrigger } from '.';

describe('popoverAnchor', () => {
  test('supports UI SDK render composition without adding a wrapper', () => {
    render(
      <Popover>
        <PopoverTrigger render={<button aria-label="Open nested command" type="button" />}>
          Open nested command
        </PopoverTrigger>
      </Popover>
    );

    expect(screen.getByRole('button', { name: 'Open nested command' })).toHaveAttribute('data-slot', 'popover-trigger');
  });
});
