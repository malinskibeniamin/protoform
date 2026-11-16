import { expect } from '@rstest/playwright';
import { reliabilityBaseURL } from './e2e-context';
import { test } from './e2e-test';

test.beforeEach(async ({ page }) => {
  await page.goto(`${reliabilityBaseURL}/hooks.html`);
});

test('installed hooks connect field errors and recover asynchronous paged options', async ({ page }) => {
  const title = page.getByRole('textbox', { name: 'Project title', exact: true });
  await title.fill('Atlas 🌊');
  await expect(title).toHaveAttribute('name', 'project');
  await page.getByRole('button', { name: 'Toggle field error' }).click();
  await expect(title).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('alert')).toHaveText('Choose a longer project title.');
  await expect(page.getByRole('status').filter({ hasText: 'Choose a longer project title.' })).toHaveText(
    'Choose a longer project title.'
  );
  await page.getByRole('button', { name: 'Toggle field error' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(title).not.toHaveAttribute('aria-invalid', 'true');
  await expect(title).toHaveAccessibleDescription('Labels, descriptions, and errors connect through SDK Field.');
  await expect(title).toHaveValue('Atlas 🌊');
  const input = page.getByRole('combobox', { name: 'Search projects' });
  await input.fill('A');
  await expect(page.getByRole('option', { name: 'Apollo', exact: true })).toBeVisible();
  await expect(page.getByText('Loading…', { exact: true })).toHaveCount(0);
  const firstId = await page.getByRole('option', { name: 'Apollo', exact: true }).getAttribute('id');
  const lastId = await page.getByRole('option', { name: 'Atlas', exact: true }).getAttribute('id');
  if (firstId === null || lastId === null) {
    throw new Error('Missing option identity');
  }
  await expect(input).toHaveAttribute('aria-activedescendant', firstId);
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', lastId);
  await input.press('ArrowDown');
  await expect(page.getByRole('option', { name: 'Aurora', exact: true })).toBeVisible();
  await page.getByRole('option', { name: 'Aurora', exact: true }).click();
  await expect(page.getByLabel('Selected project')).toHaveText('Aurora');
  await input.fill('error');
  await expect(page.getByRole('alert')).toContainText('Could not load options.');
  await page.getByRole('button', { name: 'Retry options' }).click();
  await expect(page.getByRole('alert')).toContainText('Could not load options.');
  await input.fill('Be');
  await page.getByRole('option', { name: 'Beacon', exact: true }).click();
  await expect(page.getByLabel('Selected project')).toHaveText('Beacon');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('installed preferences stay opt-in, restore on explicit enablement, and never change global theme', async ({
  page,
}) => {
  const key = 'protoform.sdk-hooks.density';
  expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBeNull();
  await expect(page.getByRole('combobox', { name: 'Example density' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Enable saved preferences' }).click();
  const density = page.getByRole('combobox', { name: 'Example density' });
  await density.click();
  await page.getByRole('option', { name: 'compact', exact: true }).click();
  await expect(page.getByLabel('Saved density')).toHaveText('compact');
  expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBe('compact');
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Example density' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Enable saved preferences' }).click();
  await expect(page.getByLabel('Saved density')).toHaveText('compact');
  expect(await page.evaluate(() => document.documentElement.dataset['demoDensity'])).toBeUndefined();
  await page.getByRole('button', { name: 'Stop preferences' }).click();
  await expect(page.getByRole('combobox', { name: 'Example density' })).toHaveCount(0);
  expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).toBe('compact');
});
