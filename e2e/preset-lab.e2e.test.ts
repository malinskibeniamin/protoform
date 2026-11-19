import { expect } from '@rstest/playwright';
import { test } from '../scripts/e2e.test-utils';

const presetPath = '/docs/presets';
const note = 'Keep my draft while changing workspaces.';

test('keeps the live preset form through native fullscreen and exit', async ({ page }) => {
  await page.goto(presetPath);
  const workspace = page.getByTestId('preset-workspace');
  const notes = workspace.getByRole('textbox', { name: 'Review notes' });
  await notes.fill(note);

  await workspace.getByRole('button', { name: 'Enter full screen' }).click();
  const exit = workspace.getByRole('button', { name: 'Exit full screen' });
  await expect(exit).toBeVisible();
  expect(await workspace.evaluate((element) => document.fullscreenElement === element)).toBe(true);
  await expect(notes).toHaveValue(note);

  await exit.click();
  await expect(workspace.getByRole('button', { name: 'Enter full screen' })).toBeVisible();
  expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
  await expect(workspace.getByRole('status')).toHaveText('Full screen closed.');
  await expect(notes).toHaveValue(note);
});

test('uses the preset dialog and shows clipboard recovery when browser permissions are denied', async ({ page }) => {
  await page.route(`**${presetPath}`, async (navigation) => {
    const response = await navigation.fetch();
    await navigation.fulfill({
      headers: { ...response.headers(), 'permissions-policy': 'fullscreen=(), clipboard-write=()' },
      response,
    });
  });
  await page.goto(presetPath);
  expect(
    await page.evaluate(() => ({
      clipboardAvailable: typeof navigator.clipboard?.writeText === 'function',
      fullscreenAvailable: typeof document.documentElement.requestFullscreen === 'function',
      fullscreenEnabled: document.fullscreenEnabled,
    }))
  ).toEqual({ clipboardAvailable: true, fullscreenAvailable: true, fullscreenEnabled: false });

  await page.getByRole('button', { name: 'Enter full screen' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  await page.getByRole('button', { name: 'Copy preset code' }).click();
  await expect(page.getByTestId('preset-workspace').getByRole('status')).toHaveText(
    'Could not copy the preset code. Copy it from the code field instead.'
  );
});
