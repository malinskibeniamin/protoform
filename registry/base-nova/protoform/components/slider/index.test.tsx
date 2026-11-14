import { expect, rs, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectTypeOf } from 'expect-type';
import { useState } from 'react';

import { Slider } from '.';

test('uses one thumb for a numeric value and preserves its callback shape', async () => {
  const user = userEvent.setup();
  const onChange = rs.fn();
  render(
    <Slider
      aria-label="Volume"
      defaultValue={30}
      onValueChange={(value, details) => {
        expectTypeOf(value).toEqualTypeOf<number | number[]>();
        onChange(value, details.reason);
      }}
    />
  );
  expect(screen.getAllByRole('slider')).toHaveLength(1);
  const thumb = screen.getByRole('slider', { name: 'Volume' });
  await user.tab();
  expect(thumb).toHaveFocus();
  await user.keyboard('{ArrowRight}');
  expect(onChange).toHaveBeenCalledWith(31, 'step-key');
});

function ControlledVolume() {
  const [value, setValue] = useState(30);
  return (
    <Slider
      aria-label="Controlled volume"
      onValueChange={(next) => setValue(typeof next === 'number' ? next : (next[0] ?? 0))}
      value={value}
    />
  );
}

test('keeps the controlled thumb focused across consecutive keyboard changes', async () => {
  const user = userEvent.setup();
  render(<ControlledVolume />);
  const thumb = screen.getByRole('slider', { name: 'Controlled volume' });
  await user.tab();
  await user.keyboard('{ArrowRight}{ArrowRight}');
  expect(screen.getByRole('slider', { name: 'Controlled volume' })).toHaveValue('32');
  expect(thumb).toHaveFocus();
});
