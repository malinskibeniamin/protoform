import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Checkbox } from '.';

test('keeps the Protoform uncontrolled indeterminate convenience value editable', async () => {
  const user = userEvent.setup();
  render(<Checkbox aria-label="Select records" defaultChecked="indeterminate" />);
  const checkbox = screen.getByRole('checkbox', { name: 'Select records' });
  expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
  await user.click(checkbox);
  expect(checkbox).toHaveAttribute('aria-checked', 'true');
});

test('honors canceled changes, native events and Base UI state classes', async () => {
  const user = userEvent.setup();
  const onChange = rs.fn();
  const animationEvents: string[] = [];
  render(
    React.createElement(Checkbox, {
      'aria-label': 'Consent',
      className: (state) => (state.checked ? 'selected' : 'unselected'),
      onAnimationStart: (event) => {
        animationEvents.push(event.type);
      },
      onCheckedChange: (checked, details) => {
        onChange(checked);
        details.cancel();
      },
    })
  );
  const checkbox = screen.getByRole('checkbox', { name: 'Consent' });
  await user.click(checkbox);
  expect(onChange).toHaveBeenCalledWith(true);
  expect(checkbox).toHaveAttribute('aria-checked', 'false');
  expect(checkbox).toHaveClass('unselected');
  fireEvent.animationStart(checkbox);
  expect(animationEvents).toEqual(['animationstart']);
});
