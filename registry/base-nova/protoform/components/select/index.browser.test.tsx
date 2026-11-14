import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { Select, SelectContent, SelectItem, SelectList, SelectTrigger, SelectValue } from '.';

test('closes a popup and recovers trigger focus', async () => {
  await render(
    <Select items={['Active']}>
      <SelectTrigger aria-label="Status">
        <SelectValue placeholder="Choose" />
      </SelectTrigger>
      <SelectContent testId="status-popup">
        <SelectList>
          <SelectItem value="Active">Active</SelectItem>
        </SelectList>
      </SelectContent>
    </Select>
  );
  const trigger = page.getByRole('combobox', { name: 'Status' });
  await trigger.click();
  await expect.element(page.getByRole('option', { name: 'Active' })).toBeVisible();
  await page.getByRole('option', { name: 'Active' }).press('Escape');
  await expect.element(page.getByTestId('status-popup')).toBeHidden();
  await expect.element(trigger).toBeFocused();
  await trigger.click();
  await expect.element(page.getByRole('option', { name: 'Active' })).toBeVisible();
});
