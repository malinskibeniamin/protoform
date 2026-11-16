import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { Tabs, TabsList, TabsTrigger } from './index';

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

describe('tabsList equal layout', () => {
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

  test('resolves shadcn style callbacks together with column metadata', () => {
    render(
      <Tabs defaultValue="one">
        {React.createElement(
          TabsList,
          {
            'aria-label': 'State styles',
            className: (state) => (state.orientation === 'horizontal' ? 'horizontal-list' : 'vertical-list'),
            columns: 2,
            style: (state) => ({ opacity: state.orientation === 'horizontal' ? 1 : 0.5 }),
          },
          <TabsTrigger value="one">One</TabsTrigger>
        )}
      </Tabs>
    );
    expect(screen.getByRole('tablist', { name: 'State styles' })).toHaveClass('horizontal-list');
    expect(screen.getByRole('tablist', { name: 'State styles' })).toHaveStyle({ opacity: '1', '--tabs-columns': '2' });
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
