import { expect } from '@rstest/playwright';
import { tanstackBaseURL } from './e2e-context';
import { compareScreenshotBuffers } from './e2e-screenshots';
import { test } from './e2e-test';

test('installed TanStack charts select, update, clear, and recover without Recharts', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  await page.goto(tanstackBaseURL);
  const chart = page.getByRole('img', { name: 'Daily sample requests', exact: true });
  await expect(chart.locator('rect')).toHaveCount(3);
  await expect(chart.locator('rect').first()).toHaveCSS('fill', 'rgb(147, 51, 234)');
  await chart.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Selected request')).toHaveText('Tue: 18');
  await page.keyboard.press('Escape');
  const original = await chart.screenshot({ animations: 'disabled' });
  await page.getByRole('button', { name: 'Update data', exact: true }).click();
  await chart.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Selected request')).toHaveText('Tue: 24');
  await page.keyboard.press('Escape');
  const updated = await chart.screenshot({ animations: 'disabled' });
  expect(compareScreenshotBuffers(original, updated).differentPixels).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Clear data', exact: true }).click();
  await expect(page.getByText('No sample requests.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Selected request')).toHaveText('None');
  await expect(page.getByRole('table')).toHaveCount(0);
  await page.getByRole('button', { name: 'Restore data', exact: true }).click();
  await expect(page.getByRole('table', { name: 'Exact request counts' })).toContainText('18');
  await expect(page.getByLabel('Selected request')).toHaveText('None');
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  await chart.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Selected request')).toHaveText('Tue: 18');
  await page.keyboard.press('Escape');
  await expect
    .poll(
      async () => compareScreenshotBuffers(original, await chart.screenshot({ animations: 'disabled' })).differentPixels
    )
    .toBe(0);
  expect(errors).toEqual([]);
});
