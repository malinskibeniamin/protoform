import { once } from 'node:events';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { describe, expect } from '@rstest/core';
import type { Window as HappyDOMWindow } from 'happy-dom';

declare const window: HappyDOMWindow;

const repositoryDirectory = new URL('../', import.meta.url);
const domConfigs = ['rstest.dom.config.ts', 'rstest.conformance.config.ts'] as const;
const rstestScripts = [
  'test:browser',
  'test:browser:update',
  'test:browser:watch',
  'test:conformance',
  'test:integration',
  'test:integration:smoke',
  'test:integration:watch',
] as const;

describe('simulated DOM test environment', () => {
  test('blocks implicit stylesheet and iframe requests without disabling explicit fetch', async () => {
    const requests: string[] = [];
    const server = createServer((request, response) => {
      requests.push(request.url ?? '/');
      response.writeHead(200, {
        'Content-Type': request.url === '/fixture.css' ? 'text/css' : 'text/html',
      });
      response.end(request.url === '/fixture.css' ? 'html { color: inherit; }' : 'Fixture endpoint');
    });
    await once(server.listen(0, '127.0.0.1'), 'listening');
    const fixture = document.createElement('div');

    try {
      const address = server.address();
      if (address === null || typeof address === 'string') {
        throw new Error('Fixture server did not bind a TCP port');
      }
      const origin = `http://127.0.0.1:${address.port}`;
      const response = await fetch(`${origin}/probe`);
      expect(await response.text()).toBe('Fixture endpoint');

      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = `${origin}/fixture.css`;
      const frame = document.createElement('iframe');
      frame.src = `${origin}/fixture.html`;
      fixture.append(stylesheet, frame);
      document.body.append(fixture);
      await window.happyDOM.waitUntilComplete();

      expect(requests).toEqual(['/probe']);
    } finally {
      fixture.remove();
      server.closeAllConnections();
      await server[Symbol.asyncDispose]();
    }
  });

  test('uses Rstest 0.12.4 with happy-dom and no Vitest wiring', () => {
    for (const config of domConfigs) {
      expect(readFileSync(new URL(config, repositoryDirectory), 'utf8')).toContain("name: 'happy-dom'");
    }

    const manifest = JSON.parse(readFileSync(new URL('package.json', repositoryDirectory), 'utf8')) as {
      devDependencies?: Record<string, string>;
      scripts?: Record<string, string>;
    };

    expect(manifest.devDependencies?.['@rstest/browser']).toBe('0.12.4');
    expect(manifest.devDependencies?.['@rstest/browser-react']).toBe('0.12.4');
    expect(manifest.devDependencies?.['@rstest/core']).toBe('0.12.4');
    expect(manifest.devDependencies?.['happy-dom']).toBeDefined();
    expect(manifest.devDependencies?.['undici']).toBe('8.12.2');
    expect(manifest.devDependencies?.['@rstest/playwright']).toBe('0.12.4');
    expect(manifest.devDependencies?.['@playwright/test']).toBeUndefined();
    expect(manifest.scripts?.['test:unit']).toBe('bun test --parallel=4');
    expect(manifest.scripts?.['test:unit:ci']).toBe('bun test --parallel=1 --dots');
    expect(manifest.scripts?.['test:unit:watch']).toBe('bun test --watch --parallel=4');
    expect(manifest.devDependencies?.['jsdom']).toBeUndefined();
    expect(manifest.devDependencies?.['vitest']).toBeUndefined();
    expect(Object.values(manifest.scripts ?? {}).join('\n')).not.toContain('vitest');
    for (const script of rstestScripts) {
      expect(manifest.scripts?.[script]).toMatch(/^node scripts\/run-tests\.ts /u);
      expect(manifest.scripts?.[script]).not.toContain('rstest');
    }
    expect(existsSync(new URL('scripts/run-tests.ts', repositoryDirectory))).toBe(true);
    expect(existsSync(new URL('vitest.unit.config.ts', repositoryDirectory))).toBe(false);
    expect(existsSync(new URL('vitest.integration.config.ts', repositoryDirectory))).toBe(false);
    expect(existsSync(new URL('vitest.conformance.config.ts', repositoryDirectory))).toBe(false);
    expect(existsSync(new URL('vitest.browser.config.ts', repositoryDirectory))).toBe(false);

    const lockfile = readFileSync(new URL('bun.lock', repositoryDirectory), 'utf8');
    expect(lockfile).not.toContain('\n    "jsdom": [');
  });
});
