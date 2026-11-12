import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { useState } from 'react';
import { SimpleMultiSelect } from '.';

function Statuses() {
  const [value, setValue] = useState(['Active']);
  return (
    <SimpleMultiSelect aria-label="Statuses" onValueChange={setValue} options={['Active', 'Paused']} value={value} />
  );
}
test('keeps multiple selections when searching and closing the popup', async () => {
  await render(<Statuses />);
  const trigger = page.getByRole('combobox', { name: 'Statuses' });
  await trigger.click();
  await page.getByRole('option', { name: 'Paused' }).click();
  await expect.element(page.getByRole('option', { name: 'Paused' })).toHaveAttribute('aria-selected', 'true');
  await trigger.press('Escape');
  await expect.element(trigger).toHaveText('Active, Paused');
  await trigger.click();
  await expect.element(page.getByRole('option', { name: 'Active' })).toHaveAttribute('aria-selected', 'true');
});
