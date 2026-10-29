import { AxeBuilder } from '@axe-core/playwright';
import { expect } from '@rstest/playwright';
import type { Page } from 'playwright';
import { test } from '../scripts/e2e-test';

const pageErrors: string[] = [];
const route = '/docs/blume-examples/registry/base-nova/protoform/demo/ui/shadcn-parity';

test.beforeEach(async ({ page }) => {
  pageErrors.length = 0;
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });
  await page.goto(route);
  await expect(page.getByTestId('shadcn-parity-example')).toBeVisible();
});

test.afterEach(() => {
  expect(pageErrors).toEqual([]);
});

test('defaults to TanStack Charts and keeps Recharts as an explicit fallback', async ({ page }) => {
  await page.getByRole('tab', { name: 'Layout', exact: true }).click();
  const backend = page.getByRole('combobox', { name: 'Chart backend' });
  await expect(backend).toContainText('TanStack Charts');
  const chart = page.getByRole('img', { name: 'Sample requests by day', exact: true });
  await chart.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('status', { name: /Tue/u })).toContainText('18');
  await page.keyboard.press('Escape');
  await backend.click();
  await page.getByRole('option', { name: 'Recharts fallback', exact: true }).click();
  await expect(chart).toBeVisible();
  await expect(backend).toContainText('Recharts fallback');
  await backend.click();
  await page.getByRole('option', { name: 'TanStack Charts (recommended)', exact: true }).click();
  await expect(chart).toBeVisible();
  await expect(page.getByText('Static sample: 12, 18 and 9 requests.', { exact: true })).toBeVisible();
});

test('catalog basics support local creation and validated entry @cross-browser', async ({ page }) => {
  const list = page.getByRole('tablist', { name: 'Component categories' });
  expect((await list.boundingBox())?.height).toBeLessThan(100);
  await page.getByRole('button', { name: 'Create sample field' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'A sample field was added.' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset empty state' }).click();
  await expect(page.getByText('No fields yet', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Advance progress' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  await page.getByLabel('Serialization format').selectOption('protobuf');
  await expect(page.getByLabel('Selected format')).toHaveText('Selected: protobuf');
  const code = page.getByLabel('Verification code', { exact: true });
  await code.fill('123456');
  await expect(page.getByLabel('Entered code')).toHaveText('Entered: 123456');
  await code.fill('abcdef');
  await expect(code).toHaveValue('123456');
  await page.getByRole('button', { name: 'Select schema', exact: true }).click();
  await expect(page.getByLabel('Selected schema')).toHaveText('Selected: Profile');
});

test('catalog overlays allow cancellation, recovery and keyboard actions @cross-browser', async ({ page }) => {
  await page.getByRole('tab', { name: 'Overlays', exact: true }).click();
  const remove = page.getByRole('button', { name: 'Remove sample record', exact: true });
  await remove.click();
  const confirm = page.getByRole('alertdialog');
  await expect(confirm).toBeVisible();
  await confirm.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(remove).toBeFocused();
  await remove.click();
  await confirm.getByRole('button', { name: 'Confirm removal' }).click();
  await expect(page.getByText('Sample record removed.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Restore sample' }).click();
  await page.getByRole('button', { name: 'Advanced validation', exact: true }).click();
  await expect(page.getByText('Validation remains owned by your form schema.')).toBeVisible();
  await page.getByRole('region', { name: 'Advanced validation', exact: true }).evaluate(async (panel) => {
    await Promise.all(panel.getAnimations({ subtree: true }).map((animation) => animation.finished));
  });
  await exerciseOverlay(page, 'Open field sheet', 'Field details', 'Close field sheet');
  await exerciseOverlay(page, 'Open form drawer', 'Form preview', 'Close form drawer');
  const actions = page.getByRole('button', { name: 'Schema actions', exact: true });
  await actions.focus();
  await page.keyboard.press('ArrowDown');
  await page.getByRole('menuitemcheckbox', { name: 'Show metadata' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByText('Metadata: shown', { exact: true })).toBeVisible();
  await page.getByText('Right-click for sample field actions', { exact: true }).click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Duplicate field' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sample field duplicated.' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Sample file' }).click();
  await page.getByRole('menuitem', { name: 'New form', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'New sample form created.' })).toBeVisible();
});

test('layout controls preserve editing and resize by keyboard @cross-browser', async ({ page }) => {
  await page.getByRole('tab', { name: 'Layout', exact: true }).click();
  await page.getByRole('button', { name: 'Addresses', exact: true }).click();
  await expect(page.getByText('Selected: Addresses', { exact: true })).toBeVisible();
  const note = page.getByRole('textbox', { name: 'Slide note' });
  await note.fill('Editable note');
  await page.keyboard.press('ArrowLeft');
  const caret = await note.evaluate((element: HTMLInputElement) => element.selectionStart);
  await page.keyboard.press('ArrowRight');
  expect(await note.evaluate((element: HTMLInputElement) => element.selectionStart)).toBe((caret ?? 0) + 1);
  await page.getByRole('button', { name: 'Next slide' }).click();
  await expect(page.getByRole('button', { name: 'Previous slide' })).toBeEnabled();
  await page.getByRole('button', { name: 'Previous slide' }).click();
  await expect(note).toBeVisible();
  const handle = page.getByRole('separator', { name: 'Resize form and preview' });
  await handle.focus();
  const previous = await handle.getAttribute('aria-valuenow');
  await page.keyboard.press('ArrowRight');
  await expect(handle).not.toHaveAttribute('aria-valuenow', previous ?? '');
  await expect(page.getByRole('img', { name: 'Sample requests by day' })).toBeVisible();
});

test('message samples recover and questionnaire validates before completion @cross-browser', async ({ page }) => {
  await page.getByRole('tab', { name: 'Messages', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle attachment sample state' }).click();
  await expect(page.getByText('Example uploaded state', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Append sample event' }).click();
  await page.getByRole('button', { name: 'Scroll to end', exact: true }).click();
  await expect(page.getByText('Sample event 9: request validated.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByText('Which format should the sample use?', { exact: true })).toBeVisible();
  await page.getByRole('radio', { name: 'JSON', exact: true }).check();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByText('Include sample validation?', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Skip', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sample saved: json.' })).toBeVisible();
});

test('composition recipes filter, select, paginate and recover @cross-browser', async ({ page }) => {
  await page.getByRole('tab', { name: 'Recipes', exact: true }).click();
  await page.getByRole('button', { name: 'Choose sample date' }).click();
  await page.getByRole('button', { name: 'Thursday, October 15th, 2026', exact: true }).click();
  await expect(page.getByLabel('Selected sample date')).toContainText('Oct 15, 2026');
  const table = page.getByRole('table', { name: 'Sample records' });
  await page.getByRole('checkbox', { name: 'Select Ada', exact: true }).check();
  await expect(page.getByLabel('Selected record count')).toHaveText('1 selected');
  await page.getByRole('button', { name: 'Next records' }).click();
  await expect(table.getByRole('cell', { name: 'Linus', exact: true })).toBeVisible();
  const filter = page.getByRole('textbox', { name: 'Filter sample records' });
  await filter.fill('Not a sample');
  await expect(table.getByText('No matching records.', { exact: true })).toBeVisible();
  await filter.fill('Grace');
  await expect(table.getByRole('cell', { name: 'Grace', exact: true })).toBeVisible();
  await filter.fill('');
  await page.getByRole('button', { name: 'Name', exact: true }).click();
  await expect(table.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'ascending');
  await page.getByRole('button', { name: 'Visible columns' }).click();
  await page.getByRole('menuitemcheckbox', { name: 'email', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(table.getByRole('columnheader', { name: 'Email', exact: true })).toHaveCount(0);
});

for (const name of ['Basics', 'Overlays', 'Layout', 'Messages', 'Recipes']) {
  let checkScenario: (page: Page) => Promise<void> = () => Promise.resolve();
  if (name === 'Recipes') {
    checkScenario = async (page) => {
      const tableViewport = page.getByRole('region', { name: 'Sample records', exact: true });
      await tableViewport.focus();
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => tableViewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    };
  }
  if (name === 'Messages') {
    checkScenario = async (page) => {
      const message = page.getByText('The schema passed its sample validation.', { exact: true });
      expect((await message.boundingBox())?.width).toBeGreaterThan(150);
      const event = page.getByText('Sample event 1: request validated.', { exact: true });
      await event.scrollIntoViewIfNeeded();
      await expect(event).toBeVisible();
    };
  }
  test(`catalog ${name} fits narrow viewports with accessible controls @cross-browser`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.getByRole('tab', { name, exact: true }).click();
    await expect(page.getByRole('tabpanel', { name, exact: true })).toBeVisible();
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
    const category = {
      Basics: 'foundations',
      Overlays: 'overlays',
      Layout: 'layout',
      Messages: 'messages',
      Recipes: 'recipes',
    }[name];
    await expect(page.getByTestId(`parity-${category}`)).toBeVisible();
    await expect
      .poll(() =>
        page.getByTestId(`parity-${category}`).evaluate((element) => {
          let opacity = 1;
          for (let current: Element | null = element; current !== null; current = current.parentElement) {
            opacity *= Number(getComputedStyle(current).opacity);
          }
          return opacity;
        })
      )
      .toBe(1);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await checkScenario(page);

    const result = await new AxeBuilder({ page }).include('[data-testid="shadcn-parity-example"]').analyze();
    expect(result.violations).toEqual([]);
  });
}

async function exerciseOverlay(page: Page, open: string, title: string, close: string) {
  const trigger = page.getByRole('button', { name: open, exact: true });
  await trigger.click();
  await expect(page.getByRole('dialog', { name: title })).toBeVisible();
  await page.getByRole('button', { name: close, exact: true }).click();
  await expect(trigger).toBeFocused();
}
