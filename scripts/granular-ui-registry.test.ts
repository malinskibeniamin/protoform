import { readFileSync } from 'node:fs';
import { registrySchema } from 'shadcn/schema';
import { generateGranularUiItems } from './granular-ui-registry';

declare const { describe, expect, test }: typeof import('bun:test');

const registry = registrySchema.parse(JSON.parse(readFileSync('registry.json', 'utf8')));
const generated = () => generateGranularUiItems(registry.items, (path) => readFileSync(path, 'utf8'));

describe('granular UI installation contracts', () => {
  test('installs the Data Table demo and source dependency closure without unrelated capabilities', () => {
    const demo = generated().find((item) => item.name === 'protoform-ui-data-table-demo');
    expect(demo).toBeDefined();
    expect(demo?.files?.map((file) => file.target)).toContain('~/components/ui/examples/data-table.tsx');
    expect(demo?.files?.map((file) => file.target)).toContain('~/components/ui/table/index.tsx');
    expect(demo?.dependencies).toContain('@tanstack/react-table@9.3.1');
    const dependencies = demo?.dependencies ?? [];
    for (const dependency of dependencies) {
      expect(dependency).not.toMatch(
        /^(recharts|react-day-picker|embla-carousel-react|input-otp|@codemirror|@tanstack\/react-router|react-hook-form)/u
      );
    }
    expect(demo?.registryDependencies).toEqual(['@protoform/protoform-license']);
  });

  test('preserves aggregate file targets, types, dependencies and creates one opt-in item per public UI entrypoint', () => {
    const before = structuredClone(registry.items);
    const items = generated();
    expect(registry.items).toEqual(before);
    for (const entry of ['calendar', 'carousel', 'input-otp', 'json-field', 'chart', 'chart-tanstack', 'resizable']) {
      expect(items.some((item) => item.name === `protoform-ui-${entry}`)).toBe(true);
    }
    const carousel = items.find((item) => item.name === 'protoform-ui-carousel');
    expect(carousel?.dependencies).toContain('embla-carousel-react@8.6.0');
    expect(carousel?.dependencies).not.toContain('@tanstack/react-table@9.3.1');
    expect(carousel?.files).toContainEqual({
      path: 'registry/base-nova/protoform/components/carousel/index.tsx',
      target: '~/components/ui/carousel/index.tsx',
      type: 'registry:ui',
    });
    expect(carousel?.files?.some((file) => file.target === '~/LICENSES/shadcn-MIT.txt')).toBe(true);
  });
  test('keeps router integration opt-in and includes lazy editor, chart, and consumer type dependencies', () => {
    const items = generated();
    const typography = items.find((item) => item.name === 'protoform-ui-typography');
    const routed = items.find((item) => item.name === 'protoform-ui-typography-tanstack-link');
    expect(typography?.dependencies?.some((dep) => dep.startsWith('@tanstack/react-router@'))).toBe(false);
    expect(routed?.dependencies).toContain('@tanstack/react-router@^1.170.46');
    expect(routed?.files?.map((file) => file.target)).toContain('~/components/ui/typography/index.tsx');
    expect(routed?.files?.map((file) => file.target)).toContain('~/components/ui/typography/tanstack-link.tsx');
    const editor = items.find((item) => item.name === 'protoform-ui-json-field');
    expect(editor?.files?.map((file) => file.target)).toContain('~/components/ui/json-field/json-code-editor.tsx');
    expect(editor?.dependencies).toContain('@codemirror/view@^6.43.15');
    const chart = items.find((item) => item.name === 'protoform-ui-chart-tanstack');
    expect(chart?.dependencies).toContain('@tanstack/charts@1.5.0');
    expect(chart?.files?.map((file) => file.target)).toContain('~/components/ui/chart-tanstack/chart-module.tsx');
    expect(items.find((item) => item.name === 'protoform-ui-sidebar')?.devDependencies).toContain(
      '@types/js-cookie@3.0.6'
    );
  });
});
