import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import { z } from 'zod';
import { Alert } from '@/components/ui/alert';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';
import { Empty } from '@/components/ui/empty';
import { Group } from '@/components/ui/group';
import { Kbd } from '@/components/ui/kbd';
import { Message } from '@/components/ui/message';
import { Alert as SDKAlert } from '@/components/ui/sdk/alert';
import { AspectRatio as SDKAspectRatio } from '@/components/ui/sdk/aspect-ratio';
import { Card as SDKCard } from '@/components/ui/sdk/card';
import { CopyButton as SDKCopyButton } from '@/components/ui/sdk/copy-button';
import { Empty as SDKEmpty } from '@/components/ui/sdk/empty';
import { Group as SDKGroup } from '@/components/ui/sdk/group';
import { Kbd as SDKKbd } from '@/components/ui/sdk/kbd';
import { Message as SDKMessage } from '@/components/ui/sdk/message';
import { Skeleton as SDKSkeleton } from '@/components/ui/sdk/skeleton';
import { Spinner as SDKSpinner } from '@/components/ui/sdk/spinner';
import { Heading as SDKHeading } from '@/components/ui/sdk/typography';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Heading } from '@/components/ui/typography';

test('foundation-independent controls share their implementation across both public entrypoints', () => {
  for (const [base, sdk] of [
    [Alert, SDKAlert],
    [AspectRatio, SDKAspectRatio],
    [Card, SDKCard],
    [CopyButton, SDKCopyButton],
    [Empty, SDKEmpty],
    [Group, SDKGroup],
    [Kbd, SDKKbd],
    [Message, SDKMessage],
    [Skeleton, SDKSkeleton],
    [Spinner, SDKSpinner],
    [Heading, SDKHeading],
  ]) {
    expect(sdk).toBe(base);
  }
});

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
test('explicit SDK AutoForm bundles UI SDK but not Base UI', () => {
  const files = packagesFor('registry/ui-sdk/protoform/components/auto-form/index.tsx');
  expect(files.some((file) => file.includes('node_modules/@ui-sdk/'))).toBe(true);
  expect(files.some((file) => file.includes('node_modules/@base-ui/'))).toBe(false);
});
test.each([
  ['base-nova', '@base-ui/', '@ui-sdk/'],
  ['ui-sdk', '@ui-sdk/', '@base-ui/'],
])('the complete %s catalog preserves its UI engine isolation', (foundation, own, other) => {
  const root = `registry/${foundation}/protoform/components`;
  const entries = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, entry.name, 'index.tsx'))
    .filter(existsSync);
  expect(entries.length).toBeGreaterThan(0);
  const files = packagesFor(entries);
  expect(files.some((file) => file.includes(`node_modules/${own}`))).toBe(true);
  expect(files.some((file) => file.includes(`node_modules/${other}`))).toBe(false);
});
