import { expect } from '@rstest/playwright';
import { verifyAgentWorkbench } from '../scripts/agent-workbench-journey';
import { test } from '../scripts/e2e-test';

for (const width of [1280, 390, 320]) {
  for (const theme of ['light', 'dark']) {
    test(`built agent enhancement stays usable at ${width}px in ${theme} mode`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((value) => localStorage.setItem('blume-theme', value), theme);
      await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/ui/agent-workbench');
      await verifyAgentWorkbench(page);
      expect(errors).toStrictEqual([]);
    });
  }
}
