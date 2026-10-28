import { auditLintExceptions, newLintExceptions } from './lint-exceptions';

declare const { expect, test }: typeof import('bun:test');

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

test('does not permit new file-level rule exemptions', () => {
  const baseline = '{ "overrides": [] }';
  const weakened =
    '{ "overrides": [{ "includes": ["components/input.tsx"], "linter": { "rules": { "style": { "noNonNullAssertion": "off" } } } }] }';
  expect(newLintExceptions('biome.jsonc', weakened, baseline)).toHaveLength(1);
  expect(newLintExceptions('biome.jsonc', baseline, weakened)).toEqual([]);
});

test('allows bounded adoption of a previously disabled rule without weakening any protected rule', () => {
  const baseline = '{ "rules": { "typescript/no-unsafe-type-assertion": "off", "no-eval": "error" } }';
  const adopted = `{
    "rules": { "typescript/no-unsafe-type-assertion": "error", "no-eval": "error" },
    "overrides": [{ "files": ["lib/generic-adapter.ts"], "rules": { "typescript/no-unsafe-type-assertion": "off" } }]
  }`;
  expect(newLintExceptions('.oxlintrc.jsonc', adopted, baseline)).toEqual([]);
  expect(newLintExceptions('.oxlintrc.jsonc', adopted, baseline.replace('"off"', '"error"'))).toHaveLength(1);
  expect(
    newLintExceptions(
      '.oxlintrc.jsonc',
      adopted.replace(
        '"rules": { "typescript/no-unsafe-type-assertion": "off" }',
        '"rules": { "typescript/no-unsafe-type-assertion": "off", "no-eval": "off" }'
      ),
      baseline
    )
  ).toHaveLength(1);
});

test.each(['off', 'warn', 'info'])('rejects changing an enforced global rule to %s', (level) => {
  const baseline = '{ "rules": { "no-eval": "error" } }';
  const weakened = `{ "rules": { "no-eval": "${level}" } }`;
  expect(newLintExceptions('.oxlintrc.jsonc', weakened, baseline)).toHaveLength(1);
});

test('permits narrowing an existing waiver but rejects new rules and widened selectors', () => {
  const baseline = `{
    "overrides": [{ "files": ["lib/adapter.ts", "lib/other.ts"], "rules": { "no-eval": "off", "no-console": "off" } }]
  }`;
  const narrowed = '{ "overrides": [{ "files": ["lib/adapter.ts"], "rules": { "no-console": "off" } }] }';
  expect(newLintExceptions('.oxlintrc.jsonc', narrowed, baseline)).toEqual([]);
  expect(newLintExceptions('.oxlintrc.jsonc', narrowed.replace('no-console', 'no-debugger'), baseline)).toHaveLength(1);
  expect(newLintExceptions('.oxlintrc.jsonc', narrowed.replace('lib/adapter.ts', 'lib/*.ts'), baseline)).toHaveLength(
    1
  );
});

test('preserves Biome exemptions across nursery promotions without allowing broader scope', () => {
  const baseline = `{
    "overrides": [{
      "includes": ["components/input.tsx"],
      "linter": { "rules": { "nursery": { "noComponentHookFactories": "off" } } }
    }]
  }`;
  const migrated = baseline.replace('"nursery"', '"correctness"');
  expect(newLintExceptions('biome.jsonc', migrated, baseline)).toEqual([]);
  expect(
    newLintExceptions('biome.jsonc', migrated.replace('components/input.tsx', 'components/**'), baseline)
  ).toHaveLength(1);
  expect(
    newLintExceptions('biome.jsonc', migrated.replace('noComponentHookFactories', 'noJsxNamespace'), baseline)
  ).toHaveLength(1);
});

test('limits approved Biome 2.6 false positives to the exact owner and rule', () => {
  const approved = `{
    "overrides": [{
      "includes": ["registry/base-nova/protoform/components/auto-form/renderers/nested.tsx"],
      "linter": { "rules": { "nursery": { "useReactCompiler": "off" } } }
    }]
  }`;
  const baseline = '{ "overrides": [] }';
  expect(newLintExceptions('biome.jsonc', approved, baseline)).toEqual([]);
  expect(newLintExceptions('biome.jsonc', approved.replace('nested.tsx', '*.tsx'), baseline)).toHaveLength(1);
  expect(
    newLintExceptions('biome.jsonc', approved.replace('useReactCompiler', 'noFloatingPromises'), baseline)
  ).toHaveLength(1);
});

test('does not use global adoption to weaken a previously strict scoped rule', () => {
  const baseline = JSON.stringify({
    rules: { 'typescript/no-unsafe-type-assertion': 'off' },
    overrides: [{ files: ['lib/adapter.ts'], rules: { 'typescript/no-unsafe-type-assertion': 'error' } }],
  });
  const weakened = JSON.stringify({
    rules: { 'typescript/no-unsafe-type-assertion': 'error' },
    overrides: [{ files: ['lib/adapter.ts'], rules: { 'typescript/no-unsafe-type-assertion': 'off' } }],
  });
  expect(newLintExceptions('.oxlintrc.jsonc', weakened, baseline)).toHaveLength(1);
});
