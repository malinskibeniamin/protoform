import { expect } from '@rstest/playwright';
import { reliabilityBaseURL } from './e2e-context';
import { test } from './e2e-test';

test.beforeEach(async ({ page }) => {
  await page.goto(`${reliabilityBaseURL}/ui-regression.html`);
});

test('toggle sizes and outline groups survive installation and form adaptation', async ({ page }) => {
  const small = page.getByRole('button', { name: 'Small toggle' });
  const large = page.getByRole('button', { name: 'Large toggle' });
  await expect.soft(small).toHaveCSS('height', '32px');
  await expect.soft(large).toHaveCSS('height', '40px');
  await expect.soft(small).toHaveCSS('border-top-width', '1px');
  const email = page.getByRole('button', { name: 'Email', exact: true });
  await expect.soft(email).toHaveCSS('border-top-width', '1px');
  await expect(email).toHaveAttribute('aria-pressed', 'true');
  await email.focus();
  await page.keyboard.press('ArrowRight');
  const sms = page.getByRole('button', { name: 'SMS', exact: true });
  await expect(sms).toBeFocused();
  await page.keyboard.press('Space');
  await page.getByRole('switch').click();
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByLabel('Toggle form values')).toContainText('"delivery":"sms"');
  await expect(page.getByLabel('Toggle form values')).toContainText('"enabled":true');
});

test('vertical and composed sliders keep visible tracks and correctly positioned thumbs', async ({ page }) => {
  await Promise.all(
    ['Vertical level', 'Vertical range'].map(async (label) => {
      const slider = page
        .locator('[data-slot="slider"]')
        .filter({ has: page.getByRole('slider', { name: new RegExp(label, 'u') }) });
      const track = slider.locator('[data-slot="slider-track"]');
      const bounds = await track.boundingBox();
      expect.soft(bounds?.height).toBeGreaterThan(150);
      expect.soft(bounds?.width).toBe(6);
      const centered = await track.evaluate((rail) => {
        const railBounds = rail.getBoundingClientRect();
        return [...rail.querySelectorAll('[data-slot="slider-thumb"]')].every((thumb) => {
          const thumbBounds = thumb.getBoundingClientRect();
          return (
            Math.abs(thumbBounds.x + thumbBounds.width / 2 - railBounds.x - railBounds.width / 2) <= 1 &&
            thumbBounds.y >= railBounds.y &&
            thumbBounds.bottom <= railBounds.bottom
          );
        });
      });
      expect.soft(centered).toBe(true);
    })
  );
  const level = page.getByRole('slider', { name: 'Vertical level', exact: true });
  await level.press('ArrowUp');
  await expect(level).toHaveValue('26');
  const composed = page.getByRole('slider', { name: 'Composed level', exact: true });
  const track = page.locator('[data-slot="slider-track"]').filter({ has: composed });
  await expect.soft(track).toHaveCSS('height', '6px');
  await expect.soft(track).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await composed.press('End');
  await expect(composed).toHaveValue('100');
});

test('vertical resize handles span the panels and remain keyboard operable', async ({ page }) => {
  const handle = page.getByRole('separator', { name: 'Resize panels' });
  await expect(handle).toHaveAttribute('aria-orientation', 'horizontal');
  const bounds = await handle.boundingBox();
  expect.soft(bounds?.width).toBeGreaterThan(200);
  expect.soft(bounds?.height).toBe(4);
  await handle.press('ArrowDown');
  await expect(handle).toHaveAttribute('aria-valuenow', '51');
});

test('disabled and pending router links cannot navigate through composed button handlers', async ({ page }) => {
  const disabled = page.getByRole('link', { name: 'Disabled route' });
  await expect.soft(disabled).toHaveCSS('opacity', '0.5');
  await disabled.evaluate((link: HTMLAnchorElement) => link.click());
  await expect(page.getByLabel('Route navigations')).toHaveText('0');
  await page.getByRole('link', { name: 'Enabled route' }).click();
  await expect(page.getByLabel('Route navigations')).toHaveText('1');
  const pending = page.getByRole('link', { name: 'Pending route' });
  await pending.click();
  await expect(pending).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByLabel('Route navigations')).toHaveText('2');
  await pending.evaluate((link: HTMLAnchorElement) => link.click());
  await expect(page.getByLabel('Route navigations')).toHaveText('2');
  await page.getByRole('button', { name: 'Finish action' }).click();
  await expect(pending).not.toHaveAttribute('aria-busy', 'true');
});

test('a separate confirmation stays interactive above an open editor', async ({ page }) => {
  await page.getByRole('button', { name: 'Open editor', exact: true }).click();
  await page.getByRole('button', { name: 'Request confirmation' }).click();
  const confirm = page.getByRole('button', { name: 'Confirm record' });
  await expect(confirm).toBeFocused();
  await confirm.press('Enter');
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await expect(page.getByLabel('Confirmation result')).toHaveText('Confirmed');
  await page.getByRole('button', { name: 'Close editor' }).click();
  await expect(page.getByRole('button', { name: 'Open editor', exact: true })).toBeFocused();
});

test('sidebar sheets honor consumer theme colors and restore focus', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Open sidebar' });
  await trigger.click();
  const panel = page.getByRole('dialog', { name: 'Workspace navigation' });
  await expect.soft(panel).toHaveCSS('background-color', 'rgb(24, 40, 70)');
  await expect.soft(panel).toHaveCSS('color', 'rgb(240, 245, 255)');
  await expect
    .soft(page.getByRole('heading', { name: 'Workspace navigation' }))
    .toHaveCSS('color', 'rgb(240, 245, 255)');
  await expect.soft(panel.getByRole('button', { name: 'Close', exact: true })).toHaveCSS('color', 'rgb(240, 245, 255)');
  await expect
    .poll(() => panel.evaluate((element) => Math.abs(element.getBoundingClientRect().right - window.innerWidth)))
    .toBeLessThanOrEqual(1);
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
