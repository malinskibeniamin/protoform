import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import DataTableExample from './data-table';

test('table header selection can select and then clear the complete page', async () => {
  await render(<DataTableExample />);
  const header = page.getByRole('checkbox', { name: 'Select page records', exact: true });
  await header.click();
  await expect.element(page.getByLabel('Selected record count')).toHaveText('2 selected');
  await expect.element(header).toHaveAttribute('aria-checked', 'true');
  await header.click();
  await expect.element(page.getByLabel('Selected record count')).toHaveText('0 selected');
  await expect.element(header).toHaveAttribute('aria-checked', 'false');
});
