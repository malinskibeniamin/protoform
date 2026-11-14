import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@rstest/core';
import type { CheckboxGroupOptions, checkboxGroup } from '@ui-sdk/core/checkbox';
import type { ToggleGroupOptions, toggleGroup } from '@ui-sdk/core/toggle';
import type { Combobox as SDKCombobox } from '@ui-sdk/react/combobox';
import type { Select as SDKSelect } from '@ui-sdk/react/select';
import { expectTypeOf } from 'expect-type';
import { z } from 'zod';
import type { CheckboxGroup } from './base-nova/protoform/components/checkbox';
import type { Combobox } from './base-nova/protoform/components/combobox';
import type { RadioGroup } from './base-nova/protoform/components/radio-group';
import type { Select } from './base-nova/protoform/components/select';
import type { Tabs } from './base-nova/protoform/components/tabs';
import type { ToggleGroup } from './base-nova/protoform/components/toggle';

test('preserves the native generic roots instead of emulating their old API', () => {
  expectTypeOf<typeof Select>().toEqualTypeOf<typeof SDKSelect>();
  expectTypeOf<typeof Combobox>().toEqualTypeOf<typeof SDKCombobox>();
  type RadioProps = Parameters<typeof RadioGroup<'standard' | 'express'>>[0];
  expectTypeOf<RadioProps['value']>().toEqualTypeOf<'standard' | 'express' | null | undefined>();
  expectTypeOf<Parameters<NonNullable<RadioProps['onValueChange']>>[0]>().toEqualTypeOf<
    'standard' | 'express' | null
  >();
  type CheckboxProps = Parameters<typeof CheckboxGroup<'email' | 'sms'>>[0];
  expectTypeOf<Parameters<NonNullable<CheckboxProps['onValueChange']>>[0]>().toEqualTypeOf<('email' | 'sms')[]>();
  type ToggleProps = Parameters<typeof ToggleGroup<'grid' | 'list'>>[0];
  expectTypeOf<Parameters<NonNullable<ToggleProps['onValueChange']>>[0]>().toEqualTypeOf<('grid' | 'list')[]>();
  type TabProps = Parameters<typeof Tabs<'profile' | 'settings'>>[0];
  expectTypeOf<TabProps['value']>().toEqualTypeOf<'profile' | 'settings' | null | undefined>();
  expectTypeOf<Parameters<NonNullable<TabProps['onValueChange']>>[0]>().toEqualTypeOf<'profile' | 'settings' | null>();
});
test('ships pinned SDK packages and no superseded behavior packages', () => {
  const manifest = z
    .object({ dependencies: z.record(z.string(), z.string()) })
    .parse(JSON.parse(readFileSync('package.json', 'utf8')));
  for (const name of ['@ui-sdk/core', '@ui-sdk/react']) {
    expect(manifest.dependencies[name]).toBe('0.1.0-beta.2');
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

test('records the public primitive hook generic group boundary without widening callbacks', () => {
  expectTypeOf<CheckboxGroupOptions<'email' | 'sms'>>().not.toExtend<
    ReturnType<typeof checkboxGroup>['types']['options']
  >();
  expectTypeOf<ToggleGroupOptions<'grid' | 'list'>>().not.toExtend<
    ReturnType<typeof toggleGroup>['types']['options']
  >();
});
