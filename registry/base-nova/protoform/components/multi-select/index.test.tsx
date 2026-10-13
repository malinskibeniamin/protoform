import { afterEach, expect, test } from '@rstest/core';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { SimpleMultiSelect } from '.';

afterEach(cleanup);

function SelectedStatuses() {
  const [value, setValue] = useState(['active']);
  return (
    <SimpleMultiSelect
      aria-label="Statuses"
      onValueChange={setValue}
      options={[
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
      ]}
      value={value}
    />
  );
}

test('exposes multiple selection independently of keyboard highlight and keeps the popup open', async () => {
  const user = userEvent.setup();
  render(<SelectedStatuses />);
  await user.click(screen.getByLabelText('Statuses'));
  const list = await screen.findByRole('listbox');
  expect(list).toHaveAttribute('aria-multiselectable', 'true');
  expect(screen.getByRole('option', { name: 'Active' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('option', { name: 'Paused' })).toHaveAttribute('aria-selected', 'false');

  await user.click(screen.getByRole('option', { name: 'Paused' }));
  await waitFor(() => expect(screen.getByRole('option', { name: 'Paused' })).toHaveAttribute('aria-selected', 'true'));
  expect(list).toBeVisible();
  await user.click(screen.getByRole('option', { name: 'Active' }));
  await waitFor(() => expect(screen.getByRole('option', { name: 'Active' })).toHaveAttribute('aria-selected', 'false'));
});

test.each([true, false])(
  'enforces the selection limit with searchable=%s while allowing deselection',
  async (searchable) => {
    const user = userEvent.setup();
    render(
      <SimpleMultiSelect
        aria-label="Statuses"
        defaultOpen
        maxCount={1}
        options={['Active', 'Paused']}
        searchable={searchable}
      />
    );
    await user.click(await screen.findByRole('option', { name: 'Active' }));
    expect(screen.getByRole('option', { name: 'Active' })).not.toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('option', { name: 'Paused' })).toHaveAttribute('aria-disabled', 'true');
    await user.click(screen.getByRole('option', { name: 'Active' }));
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Paused' })).not.toHaveAttribute('aria-disabled', 'true')
    );
    await user.click(screen.getByRole('option', { name: 'Paused' }));
    expect(screen.getByRole('option', { name: 'Paused' })).toHaveAttribute('aria-selected', 'true');
  }
);

test('hides empty groups when searching', async () => {
  const user = userEvent.setup();
  render(
    <SimpleMultiSelect
      aria-label="Status"
      options={[
        { key: 'current', heading: 'Current', children: [{ label: 'Active', value: 'active' }] },
        { key: 'past', heading: 'Past', children: [{ label: 'Retired', value: 'retired' }] },
      ]}
    />
  );
  await user.click(screen.getByRole('button', { name: 'Status' }));
  await user.click(await screen.findByRole('combobox', { name: 'Search options' }));
  await user.paste('active');
  await waitFor(() => expect(screen.queryByText('Past')).not.toBeInTheDocument());
  expect(screen.getByRole('option', { name: 'Active' })).toBeVisible();
});

test('shows the supplied empty state without a search input', async () => {
  const user = userEvent.setup();
  render(
    <SimpleMultiSelect aria-label="Statuses" emptyState="No statuses available" options={[]} searchable={false} />
  );
  await user.click(screen.getByLabelText('Statuses'));
  expect(await screen.findByText('No statuses available')).toBeVisible();
});
