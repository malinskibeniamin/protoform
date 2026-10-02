import { expect, test } from '@rstest/core';
import { auditLintExceptions } from './lint-exceptions';

test('rejects a stale file selector in a TypeScript config', () => {
  const source = `export default defineConfig({ ignore: { overrides: [
    { files: ['registry/base-nova/protoform/components/missing.tsx'], rules: ['react-doctor/example'] }
  ] } });`;
  expect(
    auditLintExceptions('doctor.config.ts', source, ['registry/base-nova/protoform/components/present.tsx']).map(
      ({ message }) => message
    )
  ).toEqual([
    'Selector "registry/base-nova/protoform/components/missing.tsx" matches no source files. Remove or correct the stale exception.',
  ]);
});

test('accepts a bounded scoped exception in JSONC', () => {
  const source = `{
    // Comments are valid JSONC.
    "overrides": [{
      "includes": ["registry/**/components/multi-select/index.tsx"],
      "linter": { "rules": { "a11y": { "useSemanticElements": "off" } } }
    }]
  }`;
  expect(
    auditLintExceptions('biome.jsonc', source, ['registry/base-nova/protoform/components/multi-select/index.tsx'])
  ).toEqual([]);
});

test('does not mistake a stricter override for an exception', () => {
  expect(
    auditLintExceptions(
      'biome.jsonc',
      '{ "overrides": [{ "includes": ["**"], "linter": { "rules": { "suspicious": { "noExplicitAny": "error" } } } }] }',
      ['registry/example.ts']
    )
  ).toEqual([]);
});

test('rejects a repository-wide weakening', () => {
  const source = `{ "overrides": [
    { "files": ["registry/**"], "rules": { "protoform/no-comments": "off" } }
  ] }`;
  expect(
    auditLintExceptions('shadcn-lint.jsonc', source, ['registry/example.ts']).map(({ message }) => message)
  ).toEqual(['Exception must name a bounded owner, not all source.']);
});

test.each(['warn', 'info'])('rejects a repository-wide %s severity downgrade', (severity) => {
  const source = `{ "overrides": [
    { "includes": ["**/*.ts"], "linter": { "rules": { "complexity": { "noVoid": "${severity}" } } } }
  ] }`;
  expect(
    auditLintExceptions('biome.jsonc', source, ['registry/base-nova/protoform/lib/core/index.ts']).map(
      ({ message }) => message
    )
  ).toContain('Exception must name a bounded owner, not all source.');
});

test.each([
  'registry/**',
  './registry/base-nova/**/*.{ts,tsx}',
  'registry/base-nova/protoform/**',
  'registry/base-nova/protoform/*/*.tsx',
  '**/*.tsx',
])('rejects broad structural selectors: %s', (pattern) => {
  const source = `export default { overrides: [
    { files: ['${pattern}'], rules: { 'shadcn/no-restyle': 'off' } }
  ] };`;
  expect(
    auditLintExceptions('doctor.config.ts', source, [
      'registry/base-nova/protoform/components/card/index.tsx',
      'registry/base-nova/protoform/lib/core/index.ts',
    ]).some(({ message }) => message.includes('bounded owner'))
  ).toBe(true);
});

test('allows a named owner rather than the entire registry', () => {
  const source = `export default { overrides: [
    { files: ['registry/base-nova/protoform/components/**'], rules: ['react-doctor/no-barrel-import'] }
  ] };`;
  expect(
    auditLintExceptions('doctor.config.ts', source, ['registry/base-nova/protoform/components/card/index.tsx'])
  ).toEqual([]);
});

test('rejects a glob exception that no longer matches any file', () => {
  const source = `{ "overrides": [
    { "files": ["registry/**/components/retired/*.tsx"], "rules": { "protoform/no-comments": "off" } }
  ] }`;
  expect(
    auditLintExceptions('shadcn-lint.jsonc', source, ['registry/base-nova/protoform/components/card/index.tsx']).map(
      ({ message }) => message
    )
  ).toEqual(['Exception scope matches no source files. Remove or correct its selectors.']);
});

test('reports the line of the offending override', () => {
  const source = `{\n  "overrides": [\n    { "files": ["missing.ts"], "rules": { "protoform/no-comments": "off" } }\n  ]\n}`;
  expect(auditLintExceptions('shadcn-lint.jsonc', source, []).map(({ line }) => line)).toEqual([3]);
});
