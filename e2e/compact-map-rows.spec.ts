import { expect } from '@rstest/playwright';
import { test } from '../scripts/e2e-test';

for (const width of [320, 390, 1100]) {
  test(`keeps scalar map keys, values, and removal in one row at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/catalog/protobuf-maps');
    await page.getByTestId('autoform-field-bool-keys-add').click();
    const key = page.getByTestId('autoform-field-bool-keys-0-key-control');
    const value = page.getByTestId('autoform-field-bool-keys-0-value-control');
    const remove = page.getByTestId('autoform-field-bool-keys-remove-0');
    await value.fill('enabled');
    await value.scrollIntoViewIfNeeded();

    const [keyBox, valueBox, removeBox] = await Promise.all(
      [key, value, remove].map((control) => control.boundingBox())
    );
    if (!(keyBox && valueBox && removeBox)) {
      throw new Error('Map controls must have visible bounds');
    }
    expect(Math.abs(keyBox.y + keyBox.height / 2 - valueBox.y - valueBox.height / 2)).toBeLessThanOrEqual(
      valueBox.height * 0.06
    );
    expect(Math.abs(removeBox.y + removeBox.height / 2 - valueBox.y - valueBox.height / 2)).toBeLessThanOrEqual(
      valueBox.height * 0.06
    );
    expect(valueBox.x).toBeGreaterThanOrEqual(keyBox.x + keyBox.width);
    expect(removeBox.x).toBeGreaterThanOrEqual(valueBox.x + valueBox.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

    await value.fill('production-europe-west');
    await expect(value).toHaveValue('production-europe-west');
    await remove.click();
    await expect(value).toHaveCount(0);
    await page.getByTestId('autoform-field-bool-keys-add').click();
    await expect(value).toBeVisible();
  });
}
