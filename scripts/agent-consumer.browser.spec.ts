import { expect } from '@rstest/playwright';
import { reliabilityBaseURL } from './e2e-context';
import { test } from './e2e-test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const registrations: string[] = [];
    Reflect.set(window, 'agentTestRegistrations', registrations);
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: {
        registerTool(tool: { name: string }) {
          registrations.push(tool.name);
        },
      },
    });
  });
  await page.goto(`${reliabilityBaseURL}/agent.html`);
});

test('installed bridge stays opt-in, discovers controls and choices, and honors secret and hidden marks', async ({
  page,
}) => {
  await expect(page.getByRole('status', { name: 'Agent status' })).toHaveText('Agent access is off.');
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Fill sample' })).toBeDisabled();
  await page.getByRole('button', { name: 'Enable local agent', exact: true }).click();
  await page.getByRole('button', { name: 'Inspect UI', exact: true }).click();
  const result = page.getByLabel('Tool result').locator('pre');
  await expect(result).toContainText('Project name');
  await expect(result).toContainText('Record title');
  await expect(result).toContainText('Review confidence');
  await expect(result).toContainText('[redacted]');
  await expect(result).not.toContainText('demo-secret');
  await expect(result).not.toContainText('Private note');
  await expect(result).not.toContainText('human-only-note');
  const snapshot: unknown = JSON.parse((await result.textContent()) ?? '');
  expect(snapshot).toContainEqual(expect.objectContaining({ label: 'Review confidence', actions: ['setValue'] }));
  await page.getByRole('button', { name: 'Find regions', exact: true }).click();
  await expect(result).toContainText('North America');
  await page.getByRole('button', { name: 'Fill sample', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Atlas');
  await expect(page.getByRole('textbox', { name: 'Record title' })).toHaveValue('Agent draft');
  await expect(page.getByRole('combobox', { name: 'Region', exact: true })).toContainText('North America');
  await expect(page.getByRole('switch', { name: 'Weekly digest' })).toBeChecked();
  await expect(page.getByRole('radio', { name: '4 of 5 stars' })).toBeChecked();
  await expect(page.getByRole('status', { name: 'Agent status' })).toHaveText('Agent ready.');
  await page.getByRole('button', { name: 'Try refused value' }).click();
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Atlas');
  await page.getByRole('button', { name: 'Fill secret', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Access token', exact: true })).toHaveValue('replacement-token');
  await expect(result).not.toContainText('replacement-token');
  await expect(page.getByLabel('Change history').locator('pre')).not.toContainText('replacement-token');
  await page.getByRole('button', { name: 'Inspect tool schemas' }).click();
  await expect(result).toContainText('inputSchema');
  await expect(result).toContainText('snapshot');
  await expect(result).toContainText('query');
  expect(await page.evaluate((): unknown => Reflect.get(window, 'agentTestRegistrations'))).toEqual([]);
});

test('human confirmation gates real form validation and saves, while async changes retain their source', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Enable local agent', exact: true }).click();
  await page.getByRole('textbox', { name: 'Record title' }).clear();
  await page.getByRole('button', { name: 'Ask agent to save' }).click();
  const dialog = page.getByRole('dialog', { name: 'Approve agent action' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Approve action', exact: true }).click();
  await expect(page.getByText('Use at least three characters', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Saved local record')).toHaveText('Not saved');
  await page.getByRole('textbox', { name: 'Record title' }).fill('Approved record');
  await page.getByRole('button', { name: 'Ask agent to save' }).click();
  await dialog.getByRole('button', { name: 'Reject action', exact: true }).click();
  await expect(page.getByLabel('Saved local record')).toHaveText('Not saved');
  await page.getByRole('button', { name: 'Ask agent to save' }).click();
  await dialog.getByRole('button', { name: 'Approve action', exact: true }).click();
  await expect(page.getByLabel('Saved local record')).toContainText('Approved record');
  await page.getByRole('button', { name: 'Run async action' }).click();
  await expect(page.getByRole('textbox', { name: 'Async status' })).toHaveValue('Refreshed');
  const entries: unknown = JSON.parse((await page.getByLabel('Change history').locator('pre').textContent()) ?? '');
  expect(entries).toContainEqual(
    expect.objectContaining({ label: 'Async status', source: 'agent', value: 'Refreshed' })
  );
  await page.getByRole('button', { name: 'Undo agent edits' }).click();
  await expect(page.getByRole('textbox', { name: 'Async status' })).toHaveValue('Ready');
  await expect(page.getByLabel('Saved local record')).toContainText('Approved record');
});

test('core-composed rating works from the keyboard and history preserves subsequent human edits', async ({ page }) => {
  await page.getByRole('button', { name: 'Enable local agent', exact: true }).click();
  const rating = page.getByRole('radiogroup', { name: 'Review confidence' });
  await rating.getByRole('radio', { name: '2 of 5 stars' }).press('ArrowRight');
  await expect(rating.getByRole('radio', { name: '3 of 5 stars' })).toBeChecked();
  await rating.getByRole('radio', { name: '3 of 5 stars' }).press('Home');
  await expect(rating.getByRole('radio', { name: '1 of 5 stars' })).toBeChecked();
  await page.getByRole('button', { name: 'Fill sample', exact: true }).click();
  await page.getByRole('button', { name: 'Seek to start' }).click();
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Apollo');
  await page.getByRole('button', { name: 'Replay history' }).click();
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Atlas');
  await page.getByRole('button', { name: 'Preview suggestion' }).click();
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Preview name');
  await page.getByRole('button', { name: 'Revert preview' }).click();
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Atlas');
  await page.getByRole('textbox', { name: 'Project name' }).fill('Human choice');
  await page.getByRole('button', { name: 'Undo agent edits' }).click();
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Human choice');
  await expect(page.getByLabel('Observed activity').locator('pre')).toContainText('source');
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
});

test('disabling a pending confirmation aborts it and repeated sessions do not revive stale actions', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Enable local agent', exact: true }).click();
  await page.getByRole('button', { name: 'Ask agent to save' }).click();
  await expect(page.getByRole('dialog', { name: 'Approve agent action' })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Stop agent', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByLabel('Tool result').locator('pre')).toHaveText('Agent access is off.');
  await page.getByRole('button', { name: 'Enable local agent', exact: true }).click();
  await page.getByRole('button', { name: 'Fill sample', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveValue('Atlas');
  await page.getByRole('button', { name: 'Disable agent', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Project name' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Fill sample' })).toBeDisabled();
  expect(await page.evaluate((): unknown => Reflect.get(window, 'agentTestRegistrations'))).toEqual([]);
});
