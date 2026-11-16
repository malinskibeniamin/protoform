import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { expect, test } from '@rstest/core';
import { useState } from 'react';
import { KeyValueField } from '@/components/ui/key-value-field';
import { KeyValueField as SDKKeyValueField } from '@/components/ui/sdk/key-value-field';

function EditablePairs({ sdk }: { sdk: boolean }) {
  const [pairs, setPairs] = useState([{ key: 'x-env', value: 'dev' }]);
  const Field = sdk ? SDKKeyValueField : KeyValueField;
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

test.each([
  ['Base UI', false],
  ['SDK', true],
])('%s key/value editors focus added rows and recover focus after removal', async (_foundation, sdk) => {
  await render(<EditablePairs sdk={sdk} />);
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
