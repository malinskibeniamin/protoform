import { expect } from '@rstest/playwright';
import { test } from '../scripts/e2e-test';

const catalog = '/docs/blume-examples/registry/base-nova/protoform/demo/ui/shadcn-parity';

test('retains avatar grouping, badge placement, progress spacing, and OTP separator', async ({ page }) => {
  await page.goto(catalog);
  const group = page.locator('[data-slot="avatar-group"]');
  await expect(group).toHaveCSS('flex-direction', 'row');
  await expect(group.locator('[data-slot="avatar-badge"]')).toHaveCSS('position', 'absolute');
  expect(
    await group
      .locator('[data-slot="avatar-group-count"]')
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).borderTopLeftRadius))
  ).toBeGreaterThanOrEqual(16);
  const progress = page.getByRole('region', { name: 'Progress', exact: true });
  const spacing = await progress.evaluate((section) => {
    const label = section.querySelector('[data-slot="progress-label"]')?.getBoundingClientRect();
    const value = section.querySelector('[data-slot="progress-value"]')?.getBoundingClientRect();
    return (value?.left ?? 0) - (label?.right ?? 0);
  });
  expect(spacing).toBeGreaterThan(12);
  await expect(page.locator('[data-slot="otp-input-separator"]')).toContainText('−');
});

test('retains disclosure arrows and checked-menu indicators', async ({ page }) => {
  await page.goto(catalog);
  await page.getByRole('tab', { name: 'Overlays', exact: true }).click();
  const accordion = page.getByRole('button', { name: 'Advanced validation', exact: true });
  await expect(accordion.locator('svg').first()).toBeVisible();
  const triggerBounds = await accordion.boundingBox();
  const iconBounds = await accordion.locator('svg').first().boundingBox();
  expect(
    (triggerBounds?.x ?? 0) + (triggerBounds?.width ?? 0) - (iconBounds?.x ?? 0) - (iconBounds?.width ?? 0)
  ).toBeLessThanOrEqual(4);
  await accordion.click();
  await expect(accordion).toHaveAttribute('aria-expanded', 'true');
  await expect(accordion.locator('svg').last()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Explore catalog' }).locator('svg')).toBeVisible();
  await page.getByRole('button', { name: 'Schema actions', exact: true }).click();
  const check = page.getByRole('menuitemcheckbox', { name: 'Show metadata' });
  await check.click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Schema actions', exact: true }).click();
  await expect(check).toHaveAttribute('aria-checked', 'true');
  await expect(check.locator('svg')).toBeVisible();
});

for (const width of [1280, 390]) {
  test(`keeps sheets against the side and confirmation actions responsive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(catalog);
    await page.getByRole('tab', { name: 'Overlays', exact: true }).click();
    await page.getByRole('button', { name: 'Open field sheet' }).click();
    const sheet = page.getByRole('dialog', { name: 'Field details' });
    await expect(sheet).toBeVisible();
    await expect.poll(async () => (await sheet.boundingBox())?.y).toBe(0);
    await expect
      .poll(async () => {
        const bounds = await sheet.boundingBox();
        return Math.round((bounds?.x ?? 0) + (bounds?.width ?? 0));
      })
      .toBe(width);
    const bounds = await sheet.boundingBox();
    expect(bounds?.height).toBe(900);
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeCloseTo(width, 0);
    expect(bounds?.width).toBeLessThan(width);
    await page.getByRole('button', { name: 'Close field sheet' }).click();
    await expect(sheet).toBeHidden();
    await page.getByRole('button', { name: 'Remove sample record' }).click();
    const backdrop = page.locator('[data-slot="alert-dialog-backdrop"]');
    expect(await backdrop.boundingBox()).toEqual({ x: 0, y: 0, width, height: 900 });
    const footer = page.getByRole('alertdialog').locator('[data-slot="alert-dialog-footer"]');
    await expect(footer).toHaveCSS('flex-direction', width < 640 ? 'column-reverse' : 'row');
  });
}

test('retains readable message spacing and full-width questionnaire choice cards', async ({ page }) => {
  await page.goto(catalog);
  await page.getByRole('tab', { name: 'Messages', exact: true }).click();
  const viewport = page.locator('[data-slot="scroll-area-viewport"][aria-label="Sample event messages"]');
  await expect(viewport.locator('[data-slot="scroll-area-content"]')).toHaveCSS('row-gap', '24px');
  const form = page.getByRole('form', { name: 'Questionnaire' });
  const choice = form.getByRole('radio', { name: 'JSON', exact: true });
  expect((await choice.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await expect(choice).toHaveCSS('border-top-width', '1px');
  await expect(form.getByRole('button', { name: 'Previous' })).toHaveCount(0);
  await choice.click();
  await expect(choice).toBeChecked();
  await expect(choice.locator('[data-slot="radio-indicator"]')).toBeVisible();
});
