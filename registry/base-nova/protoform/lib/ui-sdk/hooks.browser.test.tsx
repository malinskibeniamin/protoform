import { page } from '@rstest/browser';
import { act, render } from '@rstest/browser-react';
import { expect, rs, test } from '@rstest/core';
import { createLocalStorage, createPreference } from '@ui-sdk/core';
import { useState } from 'react';
import type { ComboboxOption } from '@/components/ui/combobox';
import { AsyncOptionCombobox, type AsyncOptionComboboxProps } from '@/components/ui/sdk/async-option-combobox';
import { PreferenceSelect } from '@/components/ui/sdk/preferences';

function AsyncExample({ load }: { load: AsyncOptionComboboxProps['load'] }) {
  const [value, setValue] = useState('');
  return <AsyncOptionCombobox aria-label="Remote project" debounce={0} load={load} onChange={setValue} value={value} />;
}
test('async options cancel stale loads, recover from errors and keep real selection usable', async () => {
  const stale = Promise.withResolvers<ComboboxOption[]>();
  const latest = Promise.withResolvers<ComboboxOption[]>();
  const signals: AbortSignal[] = [];
  const load = rs.fn((query: string, context: { signal: AbortSignal; page: number }) => {
    signals.push(context.signal);
    return query === 'old' ? stale.promise : latest.promise;
  });
  await render(<AsyncExample load={load} />);
  const input = page.getByRole('combobox', { name: 'Remote project' });
  await input.fill('old');
  await expect.poll(() => load.mock.calls.length).toBe(1);
  await input.fill('new');
  await expect.poll(() => load.mock.calls.length).toBe(2);
  expect(signals[0]?.aborted).toBe(true);
  await act(async () => {
    latest.resolve([{ value: 'new', label: 'New project' }]);
    await latest.promise;
  });
  await expect.element(page.getByRole('option', { name: 'New project' })).toBeVisible();
  await act(async () => {
    stale.resolve([{ value: 'old', label: 'Old project' }]);
    await stale.promise;
  });
  await expect.element(page.getByRole('option', { name: 'Old project' })).not.toBeVisible();
  await page.getByRole('option', { name: 'New project' }).click();
  await expect.element(input).toHaveValue('New project');
});
test('async options expose a real failed-load retry', async () => {
  const load = rs
    .fn<() => Promise<ComboboxOption[]>>()
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValue([{ value: 'ok', label: 'Recovered project' }]);
  await render(<AsyncExample load={load} />);
  await page.getByRole('combobox', { name: 'Remote project' }).fill('recovery');
  await expect.element(page.getByRole('alert')).toHaveText('Could not load options.');
  await page.getByRole('button', { name: 'Retry options' }).click();
  await expect.poll(() => load.mock.calls.length).toBe(2);
  await page.getByRole('combobox', { name: 'Remote project' }).press('ArrowDown');
  await expect.element(page.getByRole('option', { name: 'Recovered project' })).toBeVisible();
  expect(load).toHaveBeenCalledTimes(2);
});
test('preference selection restores only explicitly supplied storage and honors cancellation', async () => {
  const key = 'protoform-hooks-test';
  localStorage.setItem(key, 'compact');
  const allow = rs.fn<() => boolean>().mockReturnValue(false);
  const preference = createPreference({
    values: ['comfortable', 'compact'],
    defaultValue: 'comfortable',
    attribute: 'data-density',
    storage: createLocalStorage(key),
    onValueChange: (_value, details) => {
      if (details.reason !== 'restore' && !allow()) {
        details.cancel();
      }
    },
  });
  try {
    await render(<PreferenceSelect label="Density" preference={preference} />);
    const trigger = page.getByRole('combobox', { name: 'Density' });
    await expect.element(trigger).toHaveText('compact');
    await trigger.click();
    await page.getByRole('option', { name: 'comfortable', exact: true }).click();
    expect(preference.get().value).toBe('compact');
    expect(localStorage.getItem(key)).toBe('compact');
    allow.mockReturnValue(true);
    await trigger.click();
    await page.getByRole('option', { name: 'comfortable', exact: true }).click();
    await expect.element(trigger).toHaveText('comfortable');
    expect(localStorage.getItem(key)).toBe('comfortable');
  } finally {
    localStorage.removeItem(key);
  }
});

test('async option pagination appends results and unmount aborts an active load', async () => {
  const pending = Promise.withResolvers<ComboboxOption[]>();
  const signals: AbortSignal[] = [];
  const load = rs.fn((query: string, context: { signal: AbortSignal; page: number }) => {
    signals.push(context.signal);
    return query === 'pending'
      ? pending.promise
      : Promise.resolve({
          items: [{ value: String(context.page), label: `Project ${context.page}` }],
          hasMore: context.page === 0,
        });
  });
  const view = await render(<AsyncExample load={load} />);
  const input = page.getByRole('combobox', { name: 'Remote project' });
  await input.fill('pages');
  await expect.element(page.getByRole('option', { name: 'Project 0' })).toBeVisible();
  await input.press('Tab');
  await expect.element(page.getByRole('button', { name: 'Load more options' })).toBeFocused();
  await page.getByRole('button', { name: 'Load more options' }).press('Enter');
  await expect
    .poll(() => load.mock.calls.map(([query, context]) => [query, context.page]))
    .toStrictEqual([
      ['pages', 0],
      ['pages', 1],
    ]);
  await input.press('ArrowDown');
  await expect.element(page.getByRole('option', { name: 'Project 0' })).toBeVisible();
  await expect.element(page.getByRole('option', { name: 'Project 1' })).toBeVisible();
  await input.fill('pending');
  await expect.poll(() => load.mock.calls.length).toBe(3);
  await act(async () => {
    await view.unmount();
  });
  expect(signals[2]?.aborted).toBe(true);
  pending.resolve([]);
});
