import { devices, webkit as browserType } from 'playwright';
import { expect } from '@rstest/playwright';
import { test as base } from '../../../scripts/e2e-test';
import { matchScreenshot } from '../../../scripts/e2e-screenshots';
const device=devices['Desktop Safari'];
const test=base.extend({page:async ({},use)=>{const browser=await browserType.launch(); try{ if(browser.browserType().name()!=='webkit')throw new Error('Incorrect engine'); const context=await browser.newContext({viewport:device.viewport,userAgent:device.userAgent,deviceScaleFactor:device.deviceScaleFactor,hasTouch:device.hasTouch,isMobile:device.isMobile,baseURL:'http://127.0.0.1:55013',locale:'en-US',timezoneId:'UTC'});const page=await context.newPage();await use(page);} finally{await browser.close();}}});
async function screen(target,name){await matchScreenshot(target, `.context/codemirror/form-resilience.visual.spec.ts-snapshots/${name.slice(0,-4)}-webkit-darwin.png`,{update:process.env.PROTOFORM_UPDATE_SCREENSHOTS==='true',timeout:10000});}
import AxeBuilder from '@axe-core/playwright';


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
    await cidr.scrollIntoViewIfNeeded();
    await screen(page,`nested-fields-${width}.png`);
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
            return value <= 0.040_45 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
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
    await screen(copy,`copy-json-${theme}.png`);
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
  await screen(result,'long-profile-success.png');

  await page.goto('/docs/complex-example');
  await page.getByRole('textbox', { name: /^Project ID/u }).fill('a'.repeat(30));
  const next = page.getByRole('button', { name: 'Continue', exact: true });
  await next.click();
  await next.click();
  await next.click();
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('status')).toContainText(`environments/${'a'.repeat(30)}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await screen(page.getByRole('status'),'long-environment-success.png');
});

test('shows malformed JSON feedback without discarding the draft', async ({ page }) => {
  await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/catalog/protobuf-dynamic-json-any');
  const control = page.getByTestId('autoform-field-object-value-control');
  const editor = control.getByRole('textbox');
  await editor.press('ControlOrMeta+A');
  await editor.pressSequentially('{"theme":');
  await editor.blur();
  await expect(editor).toHaveAttribute('aria-invalid', 'true');
  await expect(control.getByRole('alert')).toContainText('Invalid JSON');
  await screen(control,'invalid-json-draft.png');
  await editor.press('ControlOrMeta+A');
  await editor.pressSequentially('{"theme":"recovered"}');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('recovered');
});

test('shows collection-root errors and clears them after correction', async ({ page }) => {
  await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/catalog/protovalidate-all-errors');
  await page.getByRole('textbox', { name: /^Email/u }).fill('audit@example.com');
  const labels = page.getByRole('group', { name: /^Labels/u });
  await labels.getByRole('button', { name: 'Add pair', exact: true }).click();
  await labels.getByRole('textbox', { name: 'Key', exact: true }).fill('team');
  await labels.getByRole('textbox', { name: 'Value', exact: true }).fill('forms');
  const tags = page.getByRole('group', { name: /^Tags/u });
  for (const value of ['tag1', 'tag2', 'tag3']) {
    await tags.getByRole('button', { name: 'Add Tags', exact: true }).click();
    await tags.getByRole('textbox').last().fill(value);
  }
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(tags).toHaveAccessibleDescription('must contain no more than 3 item(s)');
  await screen(tags,'collection-root-error.png');
  await tags.getByRole('button', { name: 'Remove item', exact: true }).last().click();
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('status')).toBeVisible();
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

for (const width of [320, 1280]) {
  test(`keeps bool map controls usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/catalog/protobuf-maps');
    const group = page.getByRole('group', { name: 'Bool Keys', exact: true });
    await group.getByRole('button', { name: 'Add Bool Keys', exact: true }).click();
    await group.getByRole('switch').click();
    await group.getByRole('textbox').fill('enabled');
    await expect(group.getByRole('switch')).toBeChecked();
    await expect(group.getByRole('textbox')).toHaveValue('enabled');
    await screen(group,`bool-map-${width}.png`);
  });
}

test('keeps a zero JSON value visible after submission', async ({ page }) => {
  await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/catalog/protobuf-dynamic-json-any');
  const control = page.getByTestId('autoform-field-scalar-or-nested-value-control');
  const editor = control.getByRole('textbox');
  await editor.press('ControlOrMeta+A');
  await editor.pressSequentially('0');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('"case": "numberValue"');
  await expect(editor).toHaveText('0');
  await screen(control,'zero-json-editor.png');
});

for (const theme of ['light', 'dark']) {
  test(`localizes invalid JSON in ${theme}`, async ({ page }) => {
    await page.addInitScript(theme => localStorage.setItem('blume-theme', theme), theme);
    await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/catalog/protobuf-dynamic-json-any');
    const control = page.getByTestId('autoform-field-object-value-control');
    const editor = control.getByRole('textbox');
    await editor.press('ControlOrMeta+A');
    await editor.pressSequentially('{"enabled": tru}');
    const error = control.locator('.cm-lintRange-error');
    await expect(error).toBeVisible();
    await error.hover();
    await expect(control.locator('.cm-tooltip-lint')).toBeVisible();
    await screen(page,`codemirror-error-${theme}.png`);
    await editor.press('F8');
    await expect(control.locator('.cm-tooltip-lint')).toBeVisible();
    await editor.press('Tab');
    await expect(editor).not.toBeFocused();
  });
}

test('shows all JSON editor consumers with line numbers', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('blume-theme', 'light'));
  await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/catalog/protobuf-dynamic-json-any');
  await expect(page.getByTestId('autoform-field-object-value-control').getByRole('textbox')).toBeVisible();
  await screen(page.locator('form'),'codemirror-json-fields.png');
});

test('explains an empty JSON draft', async ({ page }) => {
  await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/catalog/protobuf-dynamic-json-any');
  const control = page.getByTestId('autoform-field-object-value-control');
  const editor = control.getByRole('textbox');
  await editor.press('ControlOrMeta+A');
  await editor.press('Backspace');
  await expect(control.locator('.cm-lint-marker-error')).toBeVisible();
  await expect(control.getByRole('alert')).toContainText('Invalid JSON');
  await screen(control,'codemirror-empty-draft.png');
});

test('wraps long JSON on mobile without widening the document', async ({ page }) => {
  await page.setViewportSize({width:320,height:844});
  await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/catalog/protobuf-dynamic-json-any');
  const control = page.getByTestId('autoform-field-object-value-control');
  const editor = control.getByRole('textbox');
  await editor.press('ControlOrMeta+A');
  await editor.pressSequentially(JSON.stringify({environment:'a'.repeat(180)}));
  await expect(editor).not.toHaveAttribute('aria-invalid','true');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await screen(control,'codemirror-mobile-long-value.png');
});
