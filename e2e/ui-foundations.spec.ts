import { expect } from '@rstest/playwright';
import { test } from '../scripts/e2e-test';
import { verifyUIFoundations } from '../scripts/ui-foundations-journey';

for (const width of [1280, 390, 320]) {
  for (const theme of ['light', 'dark']) {
    test(`Base UI defaults and isolated SDK enhancements at ${width}px in ${theme}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((value) => localStorage.setItem('blume-theme', value), theme);
      await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/ui/foundations');
      await verifyUIFoundations(page);
      expect(errors).toEqual([]);
    });
  }
}
