import { expect } from '@rstest/playwright';
import { test } from '../scripts/e2e-test';

const route = '/docs/blume-examples/registry/base-nova/protoform/demo/ui/shadcn-api';

test('composes shadcn APIs and cancels selection without losing the current value', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  await page.goto(route);
  const action = page.getByRole('button', { name: 'Rendered action', exact: true });
  await action.focus();
  await page.keyboard.press('Space');
  await expect(page.getByText('1 actions', { exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Fruit', exact: true }).fill('Apr');
  await page.getByRole('option', { name: 'Apricot', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Legacy fruit' })).toHaveValue('Apricot');
  await page.getByRole('checkbox', { name: 'Cancel selection and disclosure changes' }).check();
  await page.getByRole('combobox', { name: 'Number', exact: true }).click();
  await page.getByRole('option', { name: 'Two', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Number', exact: true })).toContainText('One');
  await expect(page.getByText('Event: item-press: 2. Number: 1.', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Show details', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Show details', exact: true })).toHaveAttribute(
    'aria-expanded',
    'false'
  );
  await page.getByRole('checkbox', { name: 'Cancel selection and disclosure changes' }).uncheck();
  await page.getByRole('button', { name: 'Show details', exact: true }).click();
  await expect(page.getByText('Cancelable Base UI events are preserved.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('supports chips, both toggle contracts, numeric sliders and named popovers', async ({ page }) => {
  await page.goto(route);
  await page.getByRole('combobox', { name: 'Fruit tags' }).fill('Plum');
  await page.getByRole('option', { name: 'Plum', exact: true }).click();
  await page.getByRole('button', { name: 'Remove selection' }).click();
  await expect(page.getByRole('button', { name: 'Remove selection' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Bold', exact: true }).click();
  await expect(page.getByText('Formatting: bold', { exact: true })).toBeVisible();
  await page.getByRole('radio', { name: 'Right', exact: true }).click();
  await expect(page.getByText('Alignment: right', { exact: true })).toBeVisible();
  await page.getByRole('slider', { name: 'Volume', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByText('Volume: 32', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Open API information' }).click();
  const popup = page.getByRole('dialog', { name: 'Composable sections' });
  await expect(popup).toBeVisible();
  await expect(popup).toHaveAccessibleDescription(
    'Title and description are linked to this popup for assistive technology.'
  );
  await page.keyboard.press('Escape');
  await expect(popup).toHaveCount(0);
});

test('keeps the API composition usable at 320 pixels and in dark mode', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 1000 });
  await page.goto(route);
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  const title = await page.getByRole('alert').locator('[data-slot="alert-title"]').boundingBox();
  const action = await page.getByRole('button', { name: 'Reset event' }).boundingBox();
  expect(title).not.toBeNull();
  expect(action).not.toBeNull();
  expect((title?.x ?? 0) + (title?.width ?? 0)).toBeLessThanOrEqual(action?.x ?? 0);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.getByRole('tab', { name: 'Chart colors' }).click();
  await page.getByRole('button', { name: 'Change chart color' }).click();
  await expect(page.getByText('Scoped ChartStyle color')).toBeVisible();
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(320);
});
