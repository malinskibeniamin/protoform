import { execFileSync } from 'node:child_process';
import { describe, expect } from '@rstest/playwright';
import { test, withLocale } from '../scripts/e2e-test';

test("links to each page's actual GitHub source and shows its update date", async ({ page }) => {
  await page.goto('/docs/getting-started');
  const edit = page.getByRole('link', { exact: true, name: 'Edit on GitHub' });
  await expect(edit).toHaveAttribute(
    'href',
    'https://github.com/malinskibeniamin/protoform/edit/main/content/docs/(start-here)/getting-started.mdx'
  );
  await expect(page.getByText(/^Last updated on /u)).toBeVisible();

  const header = page.getByRole('banner');
  await header.getByLabel('Language: English', { exact: true }).click();
  await header.getByRole('link', { exact: true, name: 'Polski' }).click();
  await expect(page).toHaveURL(/\/docs\/pl\/getting-started$/u);
  const polishEdit = page.getByRole('link', { name: 'GitHub' }).filter({ hasText: 'Edytuj' });
  await expect(polishEdit).toHaveAttribute(
    'href',
    'https://github.com/malinskibeniamin/protoform/edit/main/content/docs/pl/(start-here)/getting-started.mdx'
  );
});

test('exports the current page as PDF and a readable EPUB without a server', async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => Reflect.set(window, '__protoformPrinted', true);
  });
  await page.goto('/docs/getting-started');
  await expect(page.locator('[data-blume-page-actions]')).toHaveScreenshot('key-free-page-actions.png');
  await page.getByText('Export', { exact: true }).click();
  await page.getByRole('button', { exact: true, name: 'Export to PDF' }).click();
  await expect.poll(() => page.evaluate((): unknown => Reflect.get(window, '__protoformPrinted'))).toBe(true);

  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { exact: true, name: 'Export to EPUB' }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe('docs-getting-started.epub');
  const path = await download.path();
  if (!path) {
    throw new Error('EPUB download has no local file');
  }
  expect(execFileSync('unzip', ['-p', path, 'mimetype'], { encoding: 'utf8' })).toBe('application/epub+zip');
  const chapters = execFileSync('unzip', ['-p', path, '*.xhtml'], { encoding: 'utf8' });
  expect(chapters).toContain('Getting started');
  expect(chapters).toContain('SignupRequest');
});

for (const locale of ['en', 'zh', 'zh-TW', 'pl']) {
  test(`omits page narration in ${locale} even when browser voices are available @cross-browser`, async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'speechSynthesis', {
        value: {
          addEventListener: () => undefined,
          cancel: () => undefined,
          getVoices: () =>
            ['en-US', 'zh-CN', 'zh-TW', 'pl-PL'].map((lang) => ({
              default: lang === 'en-US',
              lang,
              localService: true,
              name: lang,
              voiceURI: lang,
            })),
          removeEventListener: () => undefined,
        },
      });
    });

    await page.goto(`/docs/${locale === 'en' ? '' : `${locale}/`}getting-started`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /Listen to this page/u })).toHaveCount(0);
    await expect(page.locator('[data-blume-narration-player]')).toHaveCount(0);
    await expect(page.locator('[data-blume-page-actions]')).toBeVisible();
  });
}

describe('browser-language routing', () => {
  const polishTest = withLocale('pl-PL');

  polishTest('routes first visits but remembers an explicit language choice @cross-browser', async ({ page }) => {
    await page.goto('/docs?reader=first#intro');
    await expect(page).toHaveURL(/\/docs\/pl\?reader=first#intro$/u);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
    const header = page.getByRole('banner');
    await header.getByLabel('Język: Polski', { exact: true }).click();
    await header.getByRole('link', { exact: true, name: 'English' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.goto('/docs');
    await expect(page).toHaveURL(/\/docs$/u);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  polishTest('does not reroute a deep link with no translated API reference', async ({ page }) => {
    await page.goto('/docs/reference');
    await expect(page).toHaveURL(/\/docs\/reference$/u);
    await expect(page.getByRole('heading', { name: 'Protoform bookstore Connect API' })).toBeVisible();
    await expect(page.locator("[aria-label^='Language:']")).toHaveCount(0);
  });
});

test('generates all 18 API sample languages and updates samples from the request form @cross-browser', async ({
  page,
}) => {
  await page.goto('/docs/reference');
  await page.getByRole('link').filter({ hasText: 'Create a book' }).first().click();
  await expect(page.getByRole('heading', { name: 'Create a book' })).toBeVisible();
  const request = page
    .locator('blume-panel-tabs')
    .filter({ has: page.getByRole('tablist', { exact: true, name: 'Request' }) });
  await expect(request.getByRole('tab')).toHaveText([
    'cURL',
    'TypeScript',
    'JavaScript',
    'Node.js',
    'Python',
    'Go',
    'Rust',
    'Java',
    'PHP',
    'Ruby',
    'PowerShell',
    'Swift',
    'C#',
    '.NET',
    'C',
    'C++',
    'Kotlin',
    'Dart',
  ]);
  const samples = request.getByRole('tabpanel', { includeHidden: true });
  await expect(samples).toHaveCount(18);
  await Promise.all((await samples.all()).map((sample) => expect(sample).toContainText('CreateBook')));
  const [client] = await Promise.all([
    page.waitForResponse((response) => new URL(response.url()).pathname.includes('playground-client')),
    page.getByText('Try it', { exact: true }).click(),
  ]);
  await page.addScriptTag({ type: 'module', url: client.url() });
  await page
    .getByRole('textbox', { name: 'Request body' })
    .fill('{"bookId":"optional-samples","book":{"title":"No key required"}}');
  await expect(request.getByRole('tabpanel')).toContainText('optional-samples');
  await request.getByRole('tab', { exact: true, name: 'TypeScript' }).click();
  await expect(request.getByRole('tabpanel')).toContainText('optional-samples');
  await expect(request.getByRole('tabpanel')).toContainText('No key required');
});
