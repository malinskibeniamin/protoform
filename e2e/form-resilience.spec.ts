import { AxeBuilder } from '@axe-core/playwright';
import { expect } from '@rstest/playwright';
import { test } from '../scripts/e2e-test';

test('underlines invalid JSON and explains the syntax error inline @cross-browser', async ({ page }) => {
  await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/catalog/protobuf-dynamic-json-any');
  const control = page.getByTestId('autoform-field-object-value-control');
  const editor = control.getByRole('textbox');
  await editor.press('ControlOrMeta+A');
  await editor.pressSequentially('{"enabled": tru}');
  await expect(editor).toHaveAttribute('aria-invalid', 'true');
  await expect(control.getByRole('alert')).toContainText('Invalid JSON');
  const syntaxError = control.locator('.cm-lintRange-error').first();
  await expect(syntaxError).toBeVisible();
  await expect(syntaxError).toHaveText('tru');
  await syntaxError.hover();
  await expect(control.locator('.cm-tooltip-lint')).toContainText(/JSON|Unexpected|expected/iu);
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(editor).toHaveText('{"enabled": tru}');
  await editor.press('ControlOrMeta+A');
  await editor.pressSequentially('{"enabled":true,"theme":"recovered"}');
  await expect(editor).toHaveText('{"enabled":true,"theme":"recovered"}');
  await expect(control.locator('.cm-lintRange-error, .cm-lintPoint-error')).toHaveCount(0);
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('"enabled"');
  await expect(page.getByRole('status')).toContainText('recovered');
  await expect(editor).not.toHaveAttribute('aria-invalid', 'true');
});

for (const width of [320, 390]) {
  test(`keeps deeply nested fields editable at ${width}px @cross-browser`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/docs/deeply-nested');
    const cidr = page.locator('input[name="architecture.networks.0.subnets.0.routes.0.destinationCidr"]');
    await expect(cidr).toHaveValue('0.0.0.0/0');
    const metadata = page.getByRole('group', { name: 'Metadata', exact: true });
    const key = metadata.getByPlaceholder('Key', { exact: true });
    const value = metadata.getByPlaceholder('Value', { exact: true });
    const boxes = await Promise.all([cidr, key, value].map((input) => input.boundingBox()));
    for (const box of boxes) {
      expect(box?.width).toBeGreaterThanOrEqual(180);
    }
    await cidr.fill('10.0.0.0/8');
    await value.fill('platform-team');
    await expect(key).toHaveValue('managedBy');
    await expect(value).toHaveValue('platform-team');
    await expect(metadata.getByRole('button', { name: 'Delete key-value pair' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

for (const theme of ['light', 'dark']) {
  test(`makes Copy JSON readable in ${theme} theme @cross-browser`, async ({ page }) => {
    await page.addInitScript((nextTheme) => localStorage.setItem('blume-theme', nextTheme), theme);
    await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/catalog/protobuf-dynamic-json-any');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const copy = page.getByRole('button', { name: 'Copy JSON', exact: true }).first();
    await expect(copy).toBeVisible();
    const contrast = await copy.evaluate((button) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Canvas color conversion unavailable');
      }
      const ancestors: Element[] = [];
      for (let element: Element | null = button; element; element = element.parentElement) {
        ancestors.unshift(element);
      }
      context.fillStyle = 'white';
      context.fillRect(0, 0, 1, 1);
      for (const ancestor of ancestors) {
        context.fillStyle = getComputedStyle(ancestor).backgroundColor;
        context.fillRect(0, 0, 1, 1);
      }
      const luminance = () => {
        const rgb = Array.from(context.getImageData(0, 0, 1, 1).data)
          .slice(0, 3)
          .map((channel) => {
            const value = channel / 255;
            return value <= 4.045e-2 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
          });
        return 0.2126 * (rgb[0] ?? 0) + 0.7152 * (rgb[1] ?? 0) + 0.0722 * (rgb[2] ?? 0);
      };
      const background = luminance();
      context.fillStyle = getComputedStyle(button).color;
      context.fillRect(0, 0, 1, 1);
      const foreground = luminance();
      return (Math.max(background, foreground) + 0.05) / (Math.min(background, foreground) + 0.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
    const results = await new AxeBuilder({ page })
      .include('[data-slot="copy-button"]')
      .withRules(['color-contrast'])
      .analyze();
    expect(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }))).toEqual([]);
    await copy.focus();
    await expect(copy).toBeFocused();
  });
}

test('wraps contract-valid success identifiers on mobile @cross-browser', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/docs/server-error-form');
  await page.getByRole('textbox', { name: 'Display name' }).fill('A'.repeat(40));
  await page.getByRole('textbox', { name: /^Email/u }).fill('audit@example.com');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  const result = page.getByRole('status');
  await expect(result).toContainText(`profiles/${'a'.repeat(40)}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  const description = result.locator('[data-slot="alert-description"]');
  expect(await description.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);

  await page.goto('/docs/complex-example');
  await page.getByRole('textbox', { name: /^Project ID/u }).fill('a'.repeat(30));
  const next = page.getByRole('button', { name: 'Continue', exact: true });
  await next.click();
  await next.click();
  await next.click();
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('status')).toContainText(`environments/${'a'.repeat(30)}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('uses the form container rather than viewport for nested layouts @cross-browser', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/docs/deeply-nested');
  const cidr = page.locator('input[name="architecture.networks.0.subnets.0.routes.0.destinationCidr"]');
  await expect(cidr).toHaveValue('0.0.0.0/0');
  await page.locator('form').evaluate((form) => {
    form.style.width = '320px';
    form.style.maxWidth = '100%';
  });
  expect((await cidr.boundingBox())?.width).toBeGreaterThanOrEqual(180);
  await cidr.fill('10.0.0.0/8');
  await expect(cidr).toHaveValue('10.0.0.0/8');
});
