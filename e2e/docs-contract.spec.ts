import { expect } from '@rstest/playwright';
import ts from 'typescript';
import { z } from 'zod';
import { demoCatalog } from '../examples/catalog/demo-catalog';
import { demoHubs, demoRedirects } from '../examples/catalog/demo-docs';
import { docsBaseURL } from '../scripts/e2e-context';
import { test } from '../scripts/e2e-test';
import { measureJavaScriptPayload } from '../scripts/javascript-payload';

const redirectSchema = z.array(z.object({ from: z.string(), status: z.literal(308), to: z.string() }));

test('publishes every permanent legacy redirect without losing its fragment', async ({ request }) => {
  const response = await request.get('/blume-redirects.json');
  expect(response.ok()).toBe(true);
  const redirects = redirectSchema.parse(await response.json());
  expect(redirects).toHaveLength(117);
  expect(new Set(redirects.map((redirect) => redirect.from)).size).toBe(redirects.length);
  const rulesResponse = await request.get('/_redirects');
  expect(rulesResponse.ok()).toBe(true);
  const responseText1 = await rulesResponse.text();
  const rules = responseText1.trim().split('\n');
  for (const redirect of demoRedirects) {
    const from = `/docs${redirect.from}`;
    const to = `/docs${redirect.to}`;
    expect(redirects).toContainEqual({ from, status: 308, to });
    expect(rules).toContain(`${from} ${to} 308`);
  }
  await Promise.all(
    ['.md', '.mdx'].map(async (extension) => {
      const from = `/docs/feature-example-catalog${extension}`;
      const to = `/docs/protobuf-examples${extension}`;
      expect(redirects).toContainEqual({ from, status: 308, to });
      expect(rules).toContain(`${from} ${to} 308`);
      const resolvedValues2 = await request.get(to);
      expect(resolvedValues2.ok()).toBe(true);
    })
  );
});

for (const hub of demoHubs) {
  for (const redirect of demoRedirects) {
    if (!redirect.to.startsWith(`/${hub.slug}#`)) {
      continue;
    }
    test(`opens legacy demo ${redirect.from}`, async ({ page }) => {
      const fragment = new URL(redirect.to, 'https://protoform.pages.dev').hash.slice(1);
      const demo = demoCatalog.find((candidate) => candidate.slug === fragment);
      if (!demo) {
        throw new Error(`No demo found for legacy destination ${redirect.to}`);
      }
      await page.goto(`/docs${redirect.from}`);
      await expect(page).toHaveURL(new RegExp(`/docs/${hub.slug}#${fragment}$`, 'u'));
      await expect(page.getByRole('heading', { exact: true, name: demo.title })).toBeVisible();
    });
  }
}

test('publishes actionable agent guidance without enabling a server', async ({ request }) => {
  const response = await request.get('/llms.txt');
  expect(response.ok()).toBe(true);
  const text = await response.text();
  expect(text).toContain('## Agent guidance');
  expect(text).toContain('Protobuf-ES v2');
  expect(text).toContain('experimental');
  expect(text).toContain('https://protoform.pages.dev/docs/getting-started');
  expect(text).toContain('https://protoform.pages.dev/docs/registry-install');
});

test('publishes a discoverable site skill with canonical documentation links', async ({ request }) => {
  const response = await request.get('/skill.md');
  expect(response.ok()).toBe(true);
  const skill = await response.text();
  expect(skill).toMatch(/^---\nname: protoform\n/u);
  expect(skill).toContain('https://protoform.pages.dev/docs/getting-started.md');
  expect(skill).toContain('https://protoform.pages.dev/docs/registry-install.md');
  expect(skill).toContain('https://protoform.pages.dev/llms.txt');

  const canonicalPath = '/.well-known/agent-skills/protoform/SKILL.md';
  const indexResponse = await request.get('/.well-known/agent-skills/index.json');
  expect(indexResponse.ok()).toBe(true);
  const index = z
    .object({ skills: z.array(z.object({ name: z.string(), type: z.string(), url: z.string() })) })
    .parse(await indexResponse.json());
  expect(index.skills).toContainEqual({ name: 'protoform', type: 'skill-md', url: canonicalPath });
  const canonicalSkill = await request.get(canonicalPath);
  expect(canonicalSkill.ok()).toBe(true);
  expect(await canonicalSkill.text()).toBe(skill);

  const guidance = await request.get('/llms.txt');
  expect(guidance.ok()).toBe(true);
  expect(await guidance.text()).toContain(`https://protoform.pages.dev${canonicalPath}`);
});

test('finds identifiers that appear inside code blocks', async ({ page }) => {
  await page.goto('/docs/getting-started');
  await page.getByRole('button', { exact: true, name: 'Search' }).click();
  await page.getByRole('combobox', { exact: true, name: 'Search docs' }).fill('SignupRequest');
  await expect(page.getByRole('option').filter({ hasText: 'Getting started' }).first()).toBeVisible();
});

test('keeps the selected demo when switching documentation language', async ({ page }) => {
  await page.goto('/docs/protobuf-examples#protobuf-maps');
  await expect(page.getByRole('heading', { exact: true, name: 'Protobuf maps' })).toBeVisible();
  await page.getByRole('banner').getByLabel('Language: English', { exact: true }).click();
  await page.getByRole('link', { exact: true, name: 'Polski' }).click();
  await expect(page).toHaveURL(`${docsBaseURL}/docs/pl/protobuf-examples#protobuf-maps`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
  await expect(page.getByRole('heading', { exact: true, name: 'Protobuf maps' })).toBeVisible();
});

test('keeps locale selection independent of unused translation dictionaries', async ({ page, request }) => {
  await page.goto('/docs/getting-started');
  const script = await page.locator('script[src*="/LanguageSwitcher."]').getAttribute('src');
  if (!script) {
    throw new Error('The language switcher must load its client module.');
  }
  const visited = new Set<string>();
  let bytes = 0;
  const visit = async (url: string): Promise<void> => {
    if (visited.has(url)) {
      return;
    }
    visited.add(url);
    const response = await request.get(url);
    expect(response.ok()).toBe(true);
    const body = await response.body();
    bytes += body.byteLength;
    const source = ts.createSourceFile(url, body.toString(), ts.ScriptTarget.Latest, true);
    const imports = source.statements.flatMap((statement) => {
      if (
        (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) &&
        statement.moduleSpecifier &&
        ts.isStringLiteral(statement.moduleSpecifier)
      ) {
        return [new URL(statement.moduleSpecifier.text, url).href];
      }
      return [];
    });
    await Promise.all(imports.map(visit));
  };
  await visit(new URL(script, docsBaseURL).href);
  expect(bytes).toBeLessThan(8192);
});

for (const entry of [
  { deferredBudget: 1_750_000, initialBudget: 200_000, route: '/docs/getting-started' },
  { deferredBudget: 2_500_000, initialBudget: 210_000, route: '/docs/protobuf-examples' },
]) {
  test(`bounds initial and deferred module graphs for ${entry.route}`, async ({ page, request }) => {
    const documentResponse = await request.get(entry.route);
    expect(documentResponse.ok()).toBe(true);
    const roots = await page.evaluate(
      (html) => {
        const document = new DOMParser().parseFromString(html, 'text/html');
        const initial = [...document.querySelectorAll('script[src], link[rel="modulepreload"]')].flatMap(
          (node) => node.getAttribute('src') ?? node.getAttribute('href') ?? []
        );
        const deferred: string[] = [];
        for (const island of document.querySelectorAll('astro-island')) {
          const target = ['load', 'only'].includes(island.getAttribute('client') ?? '') ? initial : deferred;
          for (const name of ['component-url', 'renderer-url']) {
            const url = island.getAttribute(name);
            if (url) {
              target.push(url);
            }
          }
        }
        const inline = [...document.querySelectorAll('script:not([src])')]
          .filter((node) =>
            ['', 'module', 'text/javascript', 'application/javascript'].includes(node.getAttribute('type') ?? '')
          )
          .map((node) => node.textContent ?? '');
        return { deferred, initial, inline };
      },
      await documentResponse.text()
    );
    const { origin } = new URL(docsBaseURL);
    const inline = roots.inline.map((text, index) => ({
      text,
      url: `${documentResponse.url()}?payload-inline=${index}`,
    }));
    const inlineUrls = new Set(inline.map(({ url }) => url));
    const payload = await measureJavaScriptPayload(
      {
        deferred: [...roots.deferred, '/pagefind/pagefind.js', '/pagefind/pagefind-worker.js'].map(
          (url) => new URL(url, docsBaseURL).href
        ),
        initial: roots.initial.map((url) => new URL(url, docsBaseURL).href),
        inline,
      },
      async (url) => {
        expect(new URL(url).origin, `Unbudgeted external module: ${url}`).toBe(origin);
        const response = await request.get(url);
        expect(response.ok(), `Missing JavaScript module: ${url}`).toBe(true);
        expect(response.headers()['content-type'], `Invalid JavaScript response: ${url}`).toMatch(
          /(?:java|ecma)script/u
        );
        return response.text();
      }
    );
    expect(payload.initialModules.length).toBeGreaterThan(0);
    expect(payload.deferredModules.length).toBeGreaterThan(0);
    expect(new TextEncoder().encode(roots.inline.join('\n')).byteLength).toBeLessThanOrEqual(16_000);
    expect(payload.computedImports.filter(({ module }) => inlineUrls.has(module)).map(({ count }) => count)).toEqual([
      3,
    ]);
    expect(
      payload.computedImports
        .filter(({ module }) => !inlineUrls.has(module))
        .map(({ module, count }) => [/\/_astro\/search-client\.[^/]+\.js$/u.test(new URL(module).pathname), count])
    ).toEqual([[true, 1]]);
    const searchWorkerOwner = new URL('/pagefind/pagefind.js', docsBaseURL).href;
    expect(payload.computedWorkers.filter(({ module }) => module === searchWorkerOwner)).toEqual([
      { count: 1, module: searchWorkerOwner },
    ]);
    expect(
      payload.computedWorkers
        .filter(({ module }) => module !== searchWorkerOwner)
        .map(({ module, count }) => [/\/_astro\/elk-[^/]+\.js$/u.test(new URL(module).pathname), count])
    ).toEqual([[true, 1]]);
    expect(payload.initialGzipBytes).toBeLessThanOrEqual(entry.initialBudget);
    expect(payload.deferredGzipBytes).toBeLessThanOrEqual(entry.deferredBudget);
  });
}

test('publishes complete search assets for every configured language', async ({ request }) => {
  await Promise.all(
    ['pagefind.js', 'wasm.en.pagefind', 'wasm.pl.pagefind', 'wasm.unknown.pagefind'].map(async (asset) => {
      const response = await request.get(`/pagefind/${asset}`);
      expect(response.ok()).toBe(true);
      const responseBody3 = await response.body();
      expect(responseBody3.byteLength, asset).toBeGreaterThan(0);
    })
  );
});

for (const locale of ['en', 'zh', 'zh-TW', 'pl']) {
  for (const hub of demoHubs) {
    test(`serves machine-readable ${hub.slug} for ${locale}`, async ({ request }) => {
      const localePrefix = locale === 'en' ? '' : `${locale}/`;
      const route = `/docs/${localePrefix}${hub.slug}`;
      const response = await request.get(`/api/docs/pages${route}.json`);
      expect(response.ok()).toBe(true);
      const page = z
        .object({ locale: z.string(), markdown: z.string().min(1), route: z.string() })
        .parse(await response.json());
      expect(page.locale).toBe(locale);
      expect(page.route).toBe(route);
      const markdown = await request.get(`${route}.md`);
      expect(markdown.ok()).toBe(true);
      const responseText4 = await markdown.text();
      expect(responseText4.trim().length).toBeGreaterThan(0);
    });
  }
}

for (const previousOverflow of ['', 'clip']) {
  test(`search restores the page scroll state (${previousOverflow || 'default'})`, async ({ page }) => {
    await page.goto('/docs/getting-started');
    await page.evaluate((overflow) => {
      document.documentElement.style.overflow = overflow;
    }, previousOverflow);
    await page.getByRole('button', { exact: true, name: 'Search' }).click();
    await expect(page.getByRole('combobox', { exact: true, name: 'Search docs' })).toBeVisible();
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('combobox', { exact: true, name: 'Search docs' })).toBeHidden();
    await expect(page.locator('html')).toHaveCSS('overflow', previousOverflow || 'visible');
  });
}
