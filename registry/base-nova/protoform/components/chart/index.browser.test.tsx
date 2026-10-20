import './browser-fixture.css';

import { afterEach, expect, rs, test } from '@rstest/core';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type { CSSProperties } from 'react';

import { ChartContainer, ChartStyle, ChartTooltipContent } from '.';

afterEach(cleanup);

test('passes the complete tooltip payload to a custom formatter', async () => {
  const payload = [{ graphicalItemId: 'requests', name: 'requests', value: 5, payload: { fill: '#111111' } }];
  const formatter = rs.fn(() => 'Formatted requests');
  render(
    <ChartContainer className="h-50 w-80" config={{ requests: { label: 'Requests', color: '#111111' } }}>
      <ChartTooltipContent active formatter={formatter} payload={payload} />
    </ChartContainer>
  );
  expect(await screen.findByText('Formatted requests')).toBeVisible();
  expect(formatter).toHaveBeenCalledWith(5, 'requests', payload[0], 0, payload);
});

test('keeps a numeric zero series label visible', async () => {
  const payload = [{ graphicalItemId: 'requests', name: 'requests', value: 5 }];
  render(
    <ChartContainer className="h-50 w-80" config={{ requests: { label: 0, color: '#111111' } }}>
      <ChartTooltipContent active formatter={() => 'Five requests'} payload={payload} />
    </ChartContainer>
  );
  expect(await screen.findByText('0')).toBeVisible();
});

test('scopes dynamic colors without injecting caller stylesheet markup', async () => {
  const { container } = render(
    <ChartContainer className="h-50 w-80" config={{ requests: { theme: { light: 'red', dark: 'blue' } } }}>
      <ChartTooltipContent active payload={[{ graphicalItemId: 'requests', name: 'requests', value: 5 }]} />
    </ChartContainer>
  );
  expect(await screen.findByText('5')).toBeVisible();
  expect(container.querySelector('style')).toBeNull();
  const target = container.querySelector<HTMLElement>('[data-chart]');
  if (target === null) {
    throw new Error('Missing chart target');
  }
  expect(getComputedStyle(target).getPropertyValue('--color-requests')).toBe('light-dark(red, blue)');
});

test('supports the public ChartStyle helper and cleans up replaced colors', () => {
  const { rerender } = render(
    <>
      <div data-chart="external:chart" data-testid="external-chart" />
      <div data-chart="external:chart" data-testid="external-chart-copy" />
      <ChartStyle config={{ requests: { theme: { light: 'red', dark: 'blue' } } }} id="external:chart" />
    </>
  );
  const target = screen.getByTestId('external-chart');
  expect(getComputedStyle(target).getPropertyValue('--color-requests')).toBe('light-dark(red, blue)');
  expect(getComputedStyle(screen.getByTestId('external-chart-copy')).getPropertyValue('--color-requests')).toBe(
    'light-dark(red, blue)'
  );
  rerender(
    <>
      <div data-chart="external:chart" data-testid="external-chart" />
      <ChartStyle config={{ responses: { color: 'green' } }} id="external:chart" />
    </>
  );
  expect(getComputedStyle(target).getPropertyValue('--color-requests')).toBe('');
  expect(getComputedStyle(target).getPropertyValue('--color-responses')).toBe('green');
  rerender(<div data-chart="external:chart" data-testid="external-chart" />);
  expect(getComputedStyle(target).getPropertyValue('--color-responses')).toBe('');
});

test('applies ChartStyle to matching targets mounted later and restores retargeted elements', async () => {
  const config = { requests: { color: 'red' } };
  const { rerender } = render(<ChartStyle config={config} id="late-chart" />);
  rerender(
    <>
      <ChartStyle config={config} id="late-chart" />
      <div data-chart="late-chart" data-testid="late-target" />
    </>
  );
  const target = screen.getByTestId('late-target');
  await waitFor(() => expect(getComputedStyle(target).getPropertyValue('--color-requests')).toBe('red'));
  target.dataset['chart'] = 'another-chart';
  await waitFor(() => expect(getComputedStyle(target).getPropertyValue('--color-requests')).toBe(''));
});

test('preserves caller inline chart colors over configuration and during cleanup', () => {
  const initialStyle = { '--color-requests': 'var(--primary)' } as CSSProperties;
  const updatedStyle = { '--color-requests': 'var(--muted-foreground)' } as CSSProperties;
  const { rerender, unmount } = render(
    <>
      <div data-chart="inline-chart" data-testid="inline-target" style={initialStyle} />
      <ChartStyle config={{ requests: { color: 'red' } }} id="inline-chart" />
    </>
  );
  const target = screen.getByTestId('inline-target');
  expect(target.style.getPropertyValue('--color-requests')).toBe('var(--primary)');
  rerender(
    <>
      <div data-chart="inline-chart" data-testid="inline-target" style={updatedStyle} />
      <ChartStyle config={{ requests: { color: 'purple' } }} id="inline-chart" />
    </>
  );
  expect(target.style.getPropertyValue('--color-requests')).toBe('var(--muted-foreground)');
  unmount();
  expect(target.style.getPropertyValue('--color-requests')).toBe('var(--muted-foreground)');
});

test('reapplies removed overrides and leaves later caller declarations intact on unmount', async () => {
  const config = { requests: { color: 'red' } };
  const { rerender } = render(
    <>
      <div data-chart="owned-chart" data-testid="owned-target" />
      <ChartStyle config={config} id="owned-chart" />
    </>
  );
  const target = screen.getByTestId('owned-target');
  target.style.removeProperty('--color-requests');
  await waitFor(() => expect(target.style.getPropertyValue('--color-requests')).toBe('red'));
  target.style.setProperty('--color-requests', 'var(--primary)');
  rerender(<div data-chart="owned-chart" data-testid="owned-target" />);
  expect(target.style.getPropertyValue('--color-requests')).toBe('var(--primary)');
});
