import { expect } from '@rstest/playwright';
import { test } from '../scripts/e2e-test';

for (const fieldWidth of [532, 900]) {
  test(`sizes collection chrome to its ${fieldWidth}px field inside a 900px form`, async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('/docs/blume-examples/registry/base-nova/protoform/demo/catalog/protobuf-nested-collections');
    const field = page.getByTestId('autoform-field-children');
    const row = page.getByTestId('autoform-field-children-row-0');
    const input = page.getByTestId('autoform-field-children-0-name-control');
    await expect(input).toHaveValue('primary');
    await field.evaluate((element, width) => {
      const form = element.closest('form');
      if (!form) {
        throw new Error('Expected the collection inside a form');
      }
      form.style.width = '900px';
      element.style.width = `${width}px`;
    }, fieldWidth);
    await row.scrollIntoViewIfNeeded();
    const remove = page.getByTestId('autoform-field-children-remove-0');
    const heading = row.getByRole('heading', { name: 'Children 1' });
    const [removeBox, headingBox] = await Promise.all([remove.boundingBox(), heading.boundingBox()]);
    if (!(removeBox && headingBox)) {
      throw new Error('Collection heading and remove action must be visible');
    }
    if (fieldWidth === 532) {
      expect(removeBox.y + removeBox.height).toBeLessThanOrEqual(headingBox.y + headingBox.height * 0.06);
    } else {
      expect(removeBox.x).toBeGreaterThan(headingBox.x + headingBox.width);
      expect(removeBox.y).toBeLessThan(headingBox.y + headingBox.height);
    }
    await input.fill('regional-routing');
    await page.getByTestId('autoform-field-children-add').click();
    await expect(page.getByTestId('autoform-field-children-row-1')).toBeVisible();
    await page.getByTestId('autoform-field-children-remove-1').click();
    await expect(input).toHaveValue('regional-routing');
  });
}
