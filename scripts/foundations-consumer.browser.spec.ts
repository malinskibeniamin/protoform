import { expect } from '@rstest/playwright';
import { reliabilityBaseURL } from './e2e-context';
import { test } from './e2e-test';
import { verifyUIFoundations } from './ui-foundations-journey';

test('installed Base UI defaults coexist with opt-in SDK controls and agent history', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  await page.goto(`${reliabilityBaseURL}/foundations.html`);
  await verifyUIFoundations(page);
  expect(errors).toEqual([]);
});
