import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { expectTypeOf } from 'expect-type';

import { Tabs, TabsList, type TabsListProps, TabsTrigger } from './index';

function Example({ columns }: { columns: number }) {
  return (
    <Tabs defaultValue="first">
      <TabsList aria-label="Sections" columns={columns} layout="equal">
        <TabsTrigger value="first">First</TabsTrigger>
        <TabsTrigger value="second">Second</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

describe('TabsList equal layout', () => {
  test('preserves data attributes for non-string tab values', () => {
    render(
      <Tabs defaultValue>
        <TabsList aria-label="Boolean values">
          <TabsTrigger value>Enabled</TabsTrigger>
          <TabsTrigger value={false}>Disabled</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByRole('tab', { name: 'Enabled' })).toHaveAttribute('data-value', 'true');
  });

  test('only accepts the style objects the component can merge', () => {
    expectTypeOf<Extract<NonNullable<TabsListProps['style']>, (...args: never[]) => unknown>>().toEqualTypeOf<never>();
  });

  test('applies the requested column count and updates it', () => {
    const { rerender } = render(<Example columns={2} />);

    expect(screen.getByRole('tablist', { name: 'Sections' })).toHaveStyle({
      '--tabs-columns': '2',
    });

    rerender(<Example columns={3} />);

    expect(screen.getByRole('tablist', { name: 'Sections' })).toHaveStyle({
      '--tabs-columns': '3',
    });
  });
});
