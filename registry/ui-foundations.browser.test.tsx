import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { useState } from 'react';
import { KeyValueField } from '@/components/ui/key-value-field';

function EditablePairs() {
  const [pairs, setPairs] = useState([{ key: 'x-env', value: 'dev' }]);
  const Field = KeyValueField;
  return (
    <Field
      keyFieldProps={{ 'aria-label': 'Header name' }}
      label="Headers"
      onChange={setPairs}
      value={pairs}
      valueFieldProps={{ 'aria-label': 'Header value' }}
    />
  );
}

test('key/value editors focus added rows and recover focus after removal', async () => {
  await render(<EditablePairs />);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  const names = page.getByRole('textbox', { name: 'Header name', exact: true });
  await expect.element(names.nth(1)).toBeFocused();
  await names.nth(1).fill('x-owner');
  await page.getByRole('textbox', { name: 'Header value', exact: true }).nth(1).fill('Ops');
  await page.getByRole('button', { name: 'Delete key-value pair', exact: true }).nth(1).click();
  await expect.element(names.nth(0)).toBeFocused();
  await expect.element(names.nth(0)).toHaveValue('x-env');
  await page.getByRole('button', { name: 'Delete key-value pair', exact: true }).click();
  await expect.element(page.getByRole('button', { name: 'Add', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Add', exact: true }).press('Enter');
  await expect.element(names.nth(0)).toBeFocused();
  await expect.element(names.nth(0)).toHaveValue('');
});
