import { expect, rs, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Slot, Slottable } from '.';

test('preserves fragment siblings while composing a slottable control', async () => {
  const user = userEvent.setup();
  const onClick = rs.fn();
  render(
    <Slot>
      <Fragment key="prefix">
        <span>Leading </span>text
      </Fragment>
      <Slottable>
        <Button onClick={onClick}>Action</Button>
      </Slottable>
    </Slot>
  );
  await user.click(screen.getByRole('button', { name: 'Leading textAction' }));
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button')).toHaveTextContent('Leading textAction');
});
