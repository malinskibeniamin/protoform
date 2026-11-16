import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { expect, test } from '@rstest/core';
import { z } from 'zod';

interface CssCompiler {
  compile: (
    css: string,
    options: { base: string; onDependency: () => void }
  ) => Promise<{ build: (candidates: string[]) => string }>;
}

interface VercelConfig {
  parseAuthFileConfig: (input: unknown) => unknown;
  parseGlobalConfig: (input: unknown) => unknown;
}

interface RoutingUtils {
  convertRewrites: (rewrites: { source: string; destination: string }[]) => { dest?: string; check?: boolean }[];
  pathToRegexp: (caller: string, source: string) => RegExp;
}

interface FileTracer {
  nodeFileTrace: (
    entries: string[],
    options: { base: string }
  ) => Promise<{ fileList: Set<string>; warnings: Set<Error> }>;
}

interface ConfigMatcher {
  isFileIgnored: (path: string) => boolean;
  normalizeSync: () => void;
}

interface ConfigArrays {
  ConfigArray: new (
    configs: { files?: string[]; ignores?: string[] }[],
    options: { basePath: string }
  ) => ConfigMatcher;
}

interface FileLists {
  FileList: new () => {
    include: (pattern: string) => void;
    exclude: (pattern: string) => void;
    toArray: () => string[];
  };
}

const toolingRequire = createRequire(resolve('package.json'));

function loadTool<T>(name: string, members: string[]): T {
  const loaded: unknown = toolingRequire(name);
  return z
    .custom<T>(
      (candidate) =>
        typeof candidate === 'object' &&
        candidate !== null &&
        members.every((member) => typeof Reflect.get(candidate, member) === 'function')
    )
    .parse(loaded);
}

const { compile } = loadTool<CssCompiler>('@tailwindcss/node', ['compile']);
const { parseAuthFileConfig, parseGlobalConfig } = loadTool<VercelConfig>('@vercel/cli-config', [
  'parseAuthFileConfig',
  'parseGlobalConfig',
]);
const { nodeFileTrace } = loadTool<FileTracer>('@vercel/nft', ['nodeFileTrace']);
const { convertRewrites, pathToRegexp } = loadTool<RoutingUtils>('@vercel/routing-utils', [
  'convertRewrites',
  'pathToRegexp',
]);
const { ConfigArray } = loadTool<ConfigArrays>('@eslint/config-array', ['ConfigArray']);
const { FileList } = loadTool<FileLists>('filelist', ['FileList']);

test('compiles prose selectors, excluded children and nested heading modifiers', async () => {
  const { build } = await compile('@import "tailwindcss"; @plugin "@tailwindcss/typography";', {
    base: process.cwd(),
    onDependency: () => undefined,
  });
  const css = build(['prose', 'prose-lg', 'prose-headings:text-red-500']);
  expect(css).toContain('.prose {');
  expect(css).toContain(':where(p):not(:where([class~="not-prose"], [class~="not-prose"] *))');
  expect(css).toContain('.prose-lg {');
  expect(css).toContain(String.raw`.prose-headings\:text-red-500 :is(:where(h1, h2, h3, h4, h5, h6, th)`);
  expect(css).toContain('color: var(--color-red-500)');
});

test('preserves Vercel config passthrough, credential validation and auth-file filtering', () => {
  expect(parseGlobalConfig({ credStorage: 'file', telemetry: { enabled: false }, future: 'kept' })).toEqual({
    credStorage: 'file',
    telemetry: { enabled: false },
    future: 'kept',
  });
  expect(() => parseGlobalConfig({ credStorage: 'invalid' })).toThrow('Invalid value for `credStorage`');
  expect(() => parseGlobalConfig({ telemetry: { enabled: 'invalid' } })).toThrow();
  expect(parseAuthFileConfig({ token: 'fixture-token', tokenSource: 'env', expiresAt: 100 })).toEqual({
    token: 'fixture-token',
    expiresAt: 100,
  });
});

test('retains Vercel v6 optional/repeated rewrite captures rather than adopting router v8 grammar', () => {
  const [rewrite] = convertRewrites([{ source: '/docs/:slug*', destination: '/guide/:slug*' }]);
  expect(rewrite?.dest).toBe('/guide/$1');
  expect(rewrite?.check).toBe(true);
  const expression = pathToRegexp('protoform-override-contract', '/docs/:slug*');
  expect(expression.exec('/docs/a/b')?.[1]).toBe('a/b');
  expect(expression.test('/docs')).toBe(true);
  expect(expression.test('/other/a')).toBe(false);
});

test('traces dynamic deployment assets through glob with symlinks and dependency-directory exclusions', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'protoform-override-trace-'));
  try {
    mkdirSync(join(directory, 'templates', 'node_modules', 'ignored'), { recursive: true });
    writeFileSync(
      join(directory, 'entry.cjs'),
      'module.exports = name => require("fs").readFileSync(require("path").join(__dirname, "templates", name + ".txt"), "utf8");'
    );
    writeFileSync(join(directory, 'templates', 'welcome.txt'), 'Hello');
    writeFileSync(join(directory, 'templates', '.hidden.txt'), 'Hidden');
    writeFileSync(join(directory, 'templates', 'node_modules', 'ignored', 'private.txt'), 'Private');
    symlinkSync('welcome.txt', join(directory, 'templates', 'linked.txt'));
    const result = await nodeFileTrace([join(directory, 'entry.cjs')], { base: directory });
    expect([...result.fileList]).toEqual(
      expect.arrayContaining(['entry.cjs', 'templates/welcome.txt', 'templates/.hidden.txt', 'templates/linked.txt'])
    );
    expect([...result.fileList]).not.toContain('templates/node_modules/ignored/private.txt');
    expect([...result.warnings]).toEqual([]);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('retains ESLint config matching and filelist glob exclusions across Minimatch API families', () => {
  const directory = mkdtempSync(join(tmpdir(), 'protoform-override-globs-'));
  try {
    mkdirSync(join(directory, 'source', 'generated'), { recursive: true });
    writeFileSync(join(directory, 'source', 'main.ts'), '');
    writeFileSync(join(directory, 'source', 'view.tsx'), '');
    writeFileSync(join(directory, 'source', 'skip.js'), '');
    writeFileSync(join(directory, 'source', 'generated', 'skip.ts'), '');
    const configs = new ConfigArray([{ files: ['**/*.{ts,tsx}'] }, { ignores: ['**/generated/**'] }], {
      basePath: directory,
    });
    configs.normalizeSync();
    expect(configs.isFileIgnored(join(directory, 'source', 'main.ts'))).toBe(false);
    expect(configs.isFileIgnored(join(directory, 'source', 'generated', 'skip.ts'))).toBe(true);
    const files = new FileList();
    files.include(join(directory, 'source', '**', '*.{ts,tsx}'));
    files.exclude(join(directory, 'source', 'generated', '**'));
    expect(
      files
        .toArray()
        .map((file) => file.slice(directory.length + 1))
        .sort()
    ).toEqual(['source/main.ts', 'source/view.tsx']);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
