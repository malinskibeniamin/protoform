import { expect } from '@rstest/playwright';
import { test } from '../scripts/e2e-test';

for (const width of [1280, 390, 320]) {
  for (const theme of ['light', 'dark']) {
    test(`built agent workbench stays usable at ${width}px in ${theme} mode`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((value) => localStorage.setItem('blume-theme', value), theme);
      await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/ui/agent-workbench');
      await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveCount(0);
      await page.getByRole('button', { name: 'Enable local agent', exact: true }).click();
      await page.getByRole('button', { name: 'Fill sample', exact: true }).click();
      await expect(page.getByRole('textbox', { name: 'Record title' })).toHaveValue('Agent draft');
      await expect(page.getByRole('status', { name: 'Agent status' })).toHaveText('Agent ready.');
      await page.getByRole('button', { name: 'Inspect UI', exact: true }).click();
      const result = page.getByLabel('Tool result').locator('pre');
      await expect(result).toContainText('Project name');
      await expect(result).toContainText('[redacted]');
      await expect(result).not.toContainText('demo-secret');
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.getByRole('button', { name: 'Ask agent to save' }).click();
      const dialog = page.getByRole('dialog', { name: 'Approve agent action' });
      await expect(dialog).toBeVisible();
      const bounds = await dialog.boundingBox();
      expect(bounds?.x).toBeGreaterThanOrEqual(0);
      expect((bounds?.x ?? width) + (bounds?.width ?? width)).toBeLessThanOrEqual(width);
      await dialog.getByRole('button', { name: 'Reject action', exact: true }).click();
      await expect(page.getByLabel('Saved local record')).toHaveText('Not saved');
      expect(errors).toEqual([]);
    });
  }
}
