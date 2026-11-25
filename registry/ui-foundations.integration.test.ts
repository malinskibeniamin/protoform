import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { z } from 'zod';

const metadata = z.object({ inputs: z.record(z.string(), z.unknown()) });
function packagesFor(entry: string | string[]) {
  const directory = mkdtempSync(join(tmpdir(), 'protoform-ui-isolation-'));
  try {
    const meta = join(directory, 'metadata.json');
    execFileSync(
      'bun',
      ['build', ...[entry].flat(), '--target=browser', `--outdir=${join(directory, 'output')}`, `--metafile=${meta}`],
      { stdio: 'pipe' }
    );
    return Object.keys(metadata.parse(JSON.parse(readFileSync(meta, 'utf8'))).inputs);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
test.each([
  'registry/base-nova/protoform/lib/core/index.ts',
  'registry/base-nova/protoform/components/auto-form/host.tsx',
])('headless entrypoint %s bundles neither UI engine', (entry) => {
  const files = packagesFor(entry);
  expect(files.some((file) => file.includes('node_modules/@base-ui/'))).toBe(false);
  expect(files.some((file) => file.includes('node_modules/@ui-sdk/'))).toBe(false);
});
test('default AutoForm bundles Base UI but not UI SDK', () => {
  const files = packagesFor('registry/base-nova/protoform/components/auto-form/index.tsx');
  expect(files.some((file) => file.includes('node_modules/@base-ui/'))).toBe(true);
  expect(files.some((file) => file.includes('node_modules/@ui-sdk/'))).toBe(false);
});
test('the entire standard control catalog bundles no SDK runtime', () => {
  const root = 'registry/base-nova/protoform/components';
  const entries = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'auto-form')
    .map((entry) => join(root, entry.name, 'index.tsx'))
    .filter((entry) => existsSync(entry));
  expect(entries.length).toBeGreaterThan(50);
  const files = packagesFor(entries);
  expect(files.some((file) => file.includes('node_modules/@base-ui/'))).toBe(true);
  expect(files.some((file) => file.includes('node_modules/@ui-sdk/'))).toBe(false);
});
test('the SDK enhancement namespace contains no parallel replacements for canonical controls', () => {
  const base = 'registry/base-nova/protoform/components';
  const sdk = 'registry/ui-sdk/protoform/components';
  const enhancements = readdirSync(sdk, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  expect(enhancements.map((entry) => entry.name).sort()).toStrictEqual([
    'async-option-combobox',
    'number-text',
    'preferences',
    'rating',
  ]);
  for (const entry of enhancements) {
    expect(existsSync(join(base, entry.name))).toBe(false);
  }
});

test('there is no alternate SDK AutoForm or full-catalog registry bundle', () => {
  const manifest = z
    .object({ items: z.array(z.object({ name: z.string() })) })
    .parse(JSON.parse(readFileSync('registry.json', 'utf8')));
  expect(manifest.items.map((item: { name: string }) => item.name)).not.toContain('protoform-ui-sdk');
  expect(manifest.items.map((item: { name: string }) => item.name)).not.toContain('protoform-ui-sdk-tanstack');
  expect(manifest.items.map((item: { name: string }) => item.name)).not.toContain('protoform-ui-sdk-host');
  expect(existsSync('registry/base-nova/protoform/components/auto-form/sdk-components.ts')).toBe(false);
});
