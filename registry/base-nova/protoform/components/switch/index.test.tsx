import { expect, rs, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '.';

test('supports keyboard activation when rendering the standard non-button switch', async () => {
  const user = userEvent.setup();
  const onCheckedChange = rs.fn();
  render(<Switch aria-label="Notifications" onCheckedChange={onCheckedChange} render={<span />} />);
  await user.tab();
  await user.keyboard(' ');
  expect(screen.getByRole('switch', { name: 'Notifications' })).toBeChecked();
  expect(onCheckedChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'none' }));
});
