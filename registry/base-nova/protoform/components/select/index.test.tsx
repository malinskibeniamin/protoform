import { expect, rs, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectTypeOf } from 'expect-type';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '.';

test('infers numeric values and forwards the cancelable shadcn change event', async () => {
  const user = userEvent.setup();
  const onValueChange = rs.fn();
  render(
    <Select
      defaultValue={1}
      items={[
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 },
      ]}
      onValueChange={(value, details) => {
        expectTypeOf(value).toEqualTypeOf<number | null>();
        onValueChange(value, details.reason);
        details.cancel();
      }}
    >
      <SelectTrigger aria-label="Number">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={1}>One</SelectItem>
        <SelectItem value={2}>Two</SelectItem>
      </SelectContent>
    </Select>
  );
  await user.click(screen.getByRole('combobox', { name: 'Number' }));
  await user.click(await screen.findByRole('option', { name: 'Two' }));
  expect(onValueChange).toHaveBeenCalledWith(2, 'item-press');
  expect(screen.getByRole('combobox', { name: 'Number' })).toHaveTextContent('One');
});
