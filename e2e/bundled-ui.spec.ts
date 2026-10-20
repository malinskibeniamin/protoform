import { expect } from '@rstest/playwright';
import { test } from '../scripts/e2e-test';

const route = '/docs/blume-examples/registry/base-nova/protoform/demo/ui/code-and-trace';

test('bundled code block copies source and trace output opens by keyboard @cross-browser', async ({ page }) => {
  await page.addInitScript(() => {
    let copied = '';
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: (value: string) => {
          copied = value;
          return Promise.resolve();
        },
        readText: () => Promise.resolve(copied),
      },
    });
  });
  await page.goto(route);
  await page.getByRole('button', { name: 'Copy', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Copied', exact: true })).toBeVisible();
  expect(JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))).toMatchObject({
    book: { title: 'A guide to reliable forms' },
  });
  const trigger = page.getByRole('button', { name: 'CreateBook failed' });
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByLabel('Failure details')).toContainText('INVALID_ARGUMENT');
});

test('bundled code and trace fit a narrow container @cross-browser', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(route);
  await expect(page.getByLabel('Request JSON')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  const source = page.getByRole('region', { name: 'Request JSON' });
  await expect(source).toHaveAttribute('tabindex', '0');
  await source.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => source.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  const wrap = page.getByRole('button', { name: 'Wrap lines' });
  await wrap.click();
  await expect(wrap).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'CreateBook failed' }).click();
  await expect(page.getByLabel('Failure details')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('clipboard failure stays visible and does not claim copied @cross-browser', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: () => Promise.reject(new Error('Clipboard denied')),
      },
    })
  );
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(route);
  await page.getByRole('button', { name: 'Copy', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await expect(page.getByRole('alert')).toHaveText('Could not copy code. Try again.');
  await expect(page.getByRole('button', { name: 'Copied', exact: true })).toHaveCount(0);
});
