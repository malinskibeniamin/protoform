import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { useState } from 'react';

import { Combobox } from '.';

function CountryPicker() {
  const [value, setValue] = useState('');
  return (
    <>
      <Combobox aria-label="Country" onChange={setValue} options={[{ label: 'Poland', value: 'PL' }]} value={value} />
      <output aria-label="Selected country">{String(value)}</output>
    </>
  );
}

test('keeps browser focus on the input after keyboard selection, clearing, and dismissal', async () => {
  await render(<CountryPicker />);
  const input = page.getByRole('combobox', { name: 'Country' });
  await input.fill('pol');
  await expect.element(input).toHaveAttribute('aria-activedescendant');
  await input.press('Enter');
  await expect.element(page.getByRole('status', { name: 'Selected country' })).toHaveText('PL');
  await expect.element(input).toBeFocused();
  await expect.element(input).toHaveValue('Poland');
  await page.getByRole('button', { name: 'Clear selection' }).click();
  await expect.element(input).toHaveValue('');
  await expect.element(input).toBeFocused();
  await input.fill('missing');
  await expect.element(page.getByText('No options found.')).toBeVisible();
  await input.press('Escape');
  await expect.element(input).toHaveAttribute('aria-expanded', 'false');
  await expect.element(input).toBeFocused();
});
