import { expect } from '@rstest/playwright';
import { test } from '../scripts/e2e-test';

for (const width of [390, 320]) {
  test(`sidebar SDK shortcut closes its own mobile modal at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/ui/shadcn-parity');
    await page.getByRole('tab', { name: 'Layout', exact: true }).click();
    const trigger = page.getByTestId('parity-layout').getByRole('button', { name: 'Toggle Sidebar', exact: true });
    await expect(trigger).toHaveAttribute('aria-keyshortcuts');
    await trigger.press('ControlOrMeta+b');
    const sidebar = page.getByRole('dialog', { name: 'Sidebar', exact: true });
    await expect(sidebar).toBeVisible();
    await page.keyboard.press('ControlOrMeta+b');
    await expect(sidebar).not.toBeVisible();
  });
}

test('sidebar SDK shortcut toggles the real desktop consuming layout', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/ui/shadcn-parity');
  await page.getByRole('tab', { name: 'Layout', exact: true }).click();
  const panel = page.getByTestId('parity-layout');
  const trigger = panel.getByRole('button', { name: 'Toggle Sidebar', exact: true });
  const sidebar = panel.locator('[data-slot="sidebar"][data-state]');
  await trigger.press('ControlOrMeta+b');
  await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
  await trigger.press('ControlOrMeta+b');
  await expect(sidebar).toHaveAttribute('data-state', 'expanded');
});
