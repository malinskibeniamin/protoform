import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectTypeOf } from 'expect-type';
import type { ComponentProps } from 'react';

import { ToggleGroup, ToggleGroupItem } from '.';

test('supports shadcn multiple selection and cancelable change details', async () => {
  const user = userEvent.setup();
  const onValueChange = rs.fn((value: string[], details: { cancel: () => void }) => {
    expect(value).toEqual(['bold']);
    details.cancel();
  });
  render(
    <ToggleGroup multiple onValueChange={onValueChange} spacing={0}>
      <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
    </ToggleGroup>
  );
  await user.click(screen.getByRole('button', { name: 'Bold' }));
  expect(onValueChange).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'false');
});

test('keeps the Protoform single-value API for string selections', async () => {
  const user = userEvent.setup();
  const onValueChange = rs.fn();
  render(
    <ToggleGroup defaultValue="left" onValueChange={onValueChange} type="single">
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
  );
  await user.click(screen.getByRole('radio', { name: 'Right' }));
  expect(onValueChange).toHaveBeenCalledWith('right');
});

test('supports standalone shadcn items, render props and native events', async () => {
  const user = userEvent.setup();
  const animations: string[] = [];
  const onPressedChange = rs.fn();
  render(
    <ToggleGroupItem
      aria-label="Standalone emphasis"
      onAnimationStart={(event) => {
        animations.push(event.type);
      }}
      onPressedChange={onPressedChange}
    >
      Emphasis
    </ToggleGroupItem>
  );
  const button = screen.getByRole('button', { name: 'Standalone emphasis' });
  await user.click(button);
  expect(onPressedChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'none' }));
  fireEvent.animationStart(button);
  expect(animations).toEqual(['animationstart']);
});

test('requires a discriminator for the legacy uncontrolled string callback', () => {
  expectTypeOf<{ onValueChange: (value: string) => void }>().not.toExtend<ComponentProps<typeof ToggleGroup>>();
});
