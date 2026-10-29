import { afterEach, describe, expect, rs, test } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Input } from '.';

afterEach(cleanup);

test('step controls deliver real input change events to form consumers', async () => {
  const user = userEvent.setup();
  const changes: unknown[] = [];
  render(
    <Input
      aria-label="Quantity"
      defaultValue="0"
      name="quantity"
      onChange={(event) => {
        changes.push({
          currentTarget: event.currentTarget,
          name: event.target.name,
          nativeTarget: event.nativeEvent?.target,
          target: event.target,
          value: event.target.value,
        });
        event.preventDefault();
      }}
      showStepControls
      step={2}
      type="number"
    />
  );
  const input = screen.getByRole('spinbutton', { name: 'Quantity' });
  await user.click(screen.getByRole('button', { name: 'Increase value' }));
  expect(input).toHaveValue(2);
  expect(changes).toEqual([{ currentTarget: input, name: 'quantity', nativeTarget: input, target: input, value: '2' }]);
  await user.click(screen.getByRole('button', { name: 'Decrease value' }));
  expect(input).toHaveValue(0);
  expect(changes).toHaveLength(2);
});

describe('input icon controls', () => {
  test('names the password visibility control and updates its state', async () => {
    const user = userEvent.setup();
    render(<Input aria-label="API token" type="password" />);

    const toggle = screen.getByRole('button', { name: 'Show password' });
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeVisible();
  });

  test('names number step controls', () => {
    render(<Input aria-label="Retries" showStepControls type="number" />);

    expect(screen.getByRole('button', { name: 'Increase value' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Decrease value' })).toBeVisible();
  });
});

function ControlledText({ inputRef }: { inputRef: (node: HTMLInputElement | null) => void }) {
  const [value, setValue] = useState('');
  return <Input aria-label="Search" onChange={(event) => setValue(event.target.value)} ref={inputRef} value={value} />;
}

test('keeps the mounted input ref attached while controlled text changes', async () => {
  const user = userEvent.setup();
  const inputRef = rs.fn<(node: HTMLInputElement | null) => void>();
  render(<ControlledText inputRef={inputRef} />);
  const input = screen.getByRole('textbox', { name: 'Search' });
  await user.type(input, 'post');
  expect(input).toHaveValue('post');
  expect(inputRef.mock.calls).toEqual([[input]]);
});
