import { afterEach, expect, test } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/react';
import { Item, ItemGroup, ItemSeparator } from '.';

afterEach(cleanup);

test('keeps separators inside valid list children without announcing an extra item', () => {
  render(
    <ItemGroup aria-label="Schemas">
      <Item>Profiles</Item>
      <ItemSeparator />
      <Item>Addresses</Item>
    </ItemGroup>
  );
  const list = screen.getByRole('list', { name: 'Schemas' });
  expect([...list.children].every((child) => child.tagName === 'LI')).toBe(true);
  expect(screen.getAllByRole('listitem')).toHaveLength(2);
});
