import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import type { Combobox as SDKCombobox } from '@ui-sdk/react/combobox';
import type { Select as SDKSelect } from '@ui-sdk/react/select';
import type { Tabs as SDKTabs } from '@ui-sdk/react/tabs';
import { expectTypeOf } from 'expect-type';
import { z } from 'zod';
import type { Combobox } from './base-nova/protoform/components/combobox';
import type { Select } from './base-nova/protoform/components/select';
import type { Tabs } from './base-nova/protoform/components/tabs';

test('preserves the native generic roots instead of emulating their old API', () => {
  expectTypeOf<typeof Select>().toEqualTypeOf<typeof SDKSelect>();
  expectTypeOf<typeof Combobox>().toEqualTypeOf<typeof SDKCombobox>();
  expectTypeOf<typeof Tabs>().toEqualTypeOf<typeof SDKTabs>();
});
test('ships pinned SDK packages and no superseded behavior packages', () => {
  const manifest = z
    .object({ dependencies: z.record(z.string(), z.string()) })
    .parse(JSON.parse(readFileSync('package.json', 'utf8')));
  for (const name of ['@ui-sdk/core', '@ui-sdk/react']) {
    expect(manifest.dependencies[name]).toBe('0.1.0-beta.1');
  }
  for (const name of [
    '@base-ui/react',
    '@shadcn/react',
    'cmdk',
    'embla-carousel-react',
    'input-otp',
    'react-day-picker',
    'react-resizable-panels',
  ]) {
    expect(manifest.dependencies).not.toHaveProperty(name);
  }
  const root = 'registry/base-nova/protoform';
  const sourceFiles = readdirSync(root, { recursive: true }).filter(
    (file): file is string => typeof file === 'string' && /\.(?:ts|tsx)$/u.test(file)
  );
  for (const path of sourceFiles) {
    const text = readFileSync(join(root, path), 'utf8');
    expect(text, path).not.toMatch(
      /from ['"](?:@base-ui\/react|@shadcn\/react|cmdk|embla-carousel-react|input-otp|react-day-picker|react-resizable-panels)(?:\/|['"])/u
    );
  }
});
test('agent bridge does not register tools or create a bridge at import', () => {
  const source = readFileSync('registry/base-nova/protoform/lib/ui-sdk/agent.ts', 'utf8');
  expect(source).not.toContain('registerTools');
  expect(source).not.toMatch(/createAgent\(/u);
});
