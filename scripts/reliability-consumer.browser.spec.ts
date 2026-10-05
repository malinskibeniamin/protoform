import { expect, test } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:55120' });

test('installed controls retain paginated selections and announce every error', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const title = page.getByRole('textbox', { name: /Title/u });
  const methods = page.getByRole('button', { name: 'Multi-select trigger' });
  await expect(methods).toContainText('post');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(title).toHaveAccessibleDescription(/Enter a title\s+Use at least three characters/u);
  await expect(title).toHaveAttribute('aria-invalid', 'true');
  await expect(methods).toHaveAttribute('aria-invalid', 'true');
  await expect(methods).toHaveAccessibleDescription('Choose at least one method');
  const choice = page.getByRole('combobox', { name: /Choice/u });
  await expect(choice).toHaveAttribute('aria-invalid', 'true');
  await expect(choice).toHaveAccessibleDescription('Choose an option');
  await title.blur();
  await expect(page).toHaveScreenshot('reliability-errors.png');
  await page.getByRole('button', { name: 'Load more' }).click();
  await methods.click();
  await expect(page.getByRole('option', { name: 'POST', exact: true })).toBeVisible();
  await expect(page.getByRole('option', { name: 'GET', exact: true })).toBeVisible();
  await expect(page).toHaveScreenshot('reliability-options.png');
  await page.keyboard.press('Escape');
  await title.fill('Recovered');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByLabel('Submitted values')).toContainText('"methods":["post"]');
  await expect(page.getByText('Enter a title', { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(methods).toContainText('post');
  expect(errors).toEqual([]);
});

for (const version of ['v7', 'v8']) {
  test(`installed ${version} native defaults retain untouched precision after reset`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/native.html');
    const section = page.getByRole('region', { name: `${version} timestamp` });
    const input = section.getByLabel('Created at');
    await expect(input).toHaveValue(/T\d{2}:00:37\.123$/u);
    await section.getByRole('button', { name: 'Inspect timestamp' }).click();
    await expect(section.getByLabel('Timestamp payload')).toContainText('"nanos":123456789');
    await input.fill('2026-10-03T12:01:37.123');
    await section.getByRole('button', { name: 'Inspect timestamp' }).click();
    await expect(section.getByLabel('Timestamp payload')).toContainText('"nanos":123000000');
    await section.getByRole('button', { name: 'Reset record' }).click();
    await expect(input).toHaveValue(/T\d{2}:02:37\.456$/u);
    await section.getByRole('button', { name: 'Inspect timestamp' }).click();
    await expect(section.getByLabel('Timestamp payload')).toContainText('"nanos":456789123');
    await input.blur();
    await expect(section).toHaveScreenshot(`native-defaults-${version}.png`);
    await page.reload();
    await expect(page.getByRole('region', { name: `${version} timestamp` }).getByLabel('Created at')).toHaveValue(
      /T\d{2}:00:37\.123$/u
    );
    expect(errors).toEqual([]);
  });
}
