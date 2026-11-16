import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { z } from 'zod';

const metadata = z.object({ inputs: z.record(z.string(), z.unknown()) });
function packagesFor(entry: string) {
  const directory = mkdtempSync(join(tmpdir(), 'protoform-ui-isolation-'));
  try {
    const meta = join(directory, 'metadata.json');
    execFileSync(
      'bun',
      ['build', entry, '--target=browser', `--outfile=${join(directory, 'entry.js')}`, `--metafile=${meta}`],
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
test('explicit SDK AutoForm bundles UI SDK but not Base UI', () => {
  const files = packagesFor('registry/ui-sdk/protoform/components/auto-form/index.tsx');
  expect(files.some((file) => file.includes('node_modules/@ui-sdk/'))).toBe(true);
  expect(files.some((file) => file.includes('node_modules/@base-ui/'))).toBe(false);
});
