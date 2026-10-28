import { expect } from '@rstest/playwright';
import type { Locator } from 'playwright';
import { test } from '../scripts/e2e-test';

type Box = NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>;

for (const { fieldWidth, checkLayout } of [
  {
    fieldWidth: 532,
    checkLayout: (remove: Box, heading: Box) => {
      expect(remove.y + remove.height).toBeLessThanOrEqual(heading.y + heading.height * 0.06);
    },
  },
  {
    fieldWidth: 900,
    checkLayout: (remove: Box, heading: Box) => {
      expect(remove.x).toBeGreaterThan(heading.x + heading.width);
      expect(remove.y).toBeLessThan(heading.y + heading.height);
    },
  },
]) {
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
    checkLayout(removeBox, headingBox);
    await input.fill('regional-routing');
    await page.getByTestId('autoform-field-children-add').click();
    await expect(page.getByTestId('autoform-field-children-row-1')).toBeVisible();
    await page.getByTestId('autoform-field-children-remove-1').click();
    await expect(input).toHaveValue('regional-routing');
  });
}
