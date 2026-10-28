import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import ts from 'typescript';
import { z } from 'zod';

declare const { expect, test }: typeof import('bun:test');

const object = z.record(z.string(), z.unknown());

test('enforces explicit-any safety in inherited test-file scopes', () => {
  mkdirSync('.tmp', { recursive: true });
  const directory = mkdtempSync(resolve('.tmp/release-test-types-'));
  const fixture = join(directory, 'probe.test.ts');
  const args = ['lint', fixture, '--vcs-enabled=false', '--colors=off', '--max-diagnostics=none'];
  try {
    writeFileSync(fixture, 'export function unsafe(value: any) { return typeof value; }\n');
    const invalid = spawnSync(resolve('node_modules/.bin/biome'), args, { encoding: 'utf8', timeout: 10_000 });
    expect(invalid.error).toBeUndefined();
    expect(invalid.stdout + invalid.stderr).toContain('lint/suspicious/noExplicitAny');
    writeFileSync(fixture, 'export function safe(value: unknown) { return typeof value; }\n');
    const valid = spawnSync(resolve('node_modules/.bin/biome'), args, { encoding: 'utf8', timeout: 10_000 });
    expect(valid.error).toBeUndefined();
    expect(valid.status, valid.stdout + valid.stderr).toBe(0);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

function readConfig(file: string): Record<string, unknown> {
  const value: unknown = ts.parseConfigFileTextToJson(file, readFileSync(file, 'utf8')).config;
  return object.parse(value);
}

test('release rules reject broken async control flow without rejecting terminal side effects', () => {
  mkdirSync('.tmp', { recursive: true });
  const directory = mkdtempSync(resolve('.tmp/release-async-'));
  const fixture = join(directory, 'probe.ts');
  const configPath = join(directory, 'oxlint.json');
  const config = readConfig('.oxlintrc.jsonc');
  const configuredRules = object.parse(config['rules']);
  const targets = ['typescript/return-await', 'promise/always-return', 'typescript/no-unsafe-type-assertion'];
  writeFileSync(
    configPath,
    JSON.stringify({
      plugins: ['typescript', 'promise'],
      categories: { correctness: 'off' },
      options: { typeAware: true },
      rules: Object.fromEntries(targets.map((rule) => [rule, configuredRules[rule]])),
    })
  );
  const args = ['--config', configPath, '--no-ignore', '--format', 'json', fixture];
  try {
    writeFileSync(
      fixture,
      `export async function unsafeReturn() {
  try { return Promise.reject(new Error('failed')); }
  catch (error) { throw new Error('reported', { cause: error }); }
}
export function brokenChain() {
  return Promise.resolve(1).then(() => { Promise.resolve(2); }).then(value => value);
}
export function unsafeCast(value: unknown) { return value as string; }
`
    );
    const invalid = spawnSync(resolve('node_modules/.bin/oxlint'), args, { encoding: 'utf8', timeout: 30_000 });
    expect(invalid.error).toBeUndefined();
    expect(invalid.status).toBe(1);
    expect(invalid.stdout).toContain('typescript(return-await)');
    expect(invalid.stdout).toContain('promise(always-return)');
    expect(invalid.stdout).toContain('typescript(no-unsafe-type-assertion)');

    writeFileSync(
      fixture,
      `export async function safeReturn() {
  try { return await Promise.resolve(1); }
  catch (error) { throw new Error('reported', { cause: error }); }
}
export async function ordinaryReturn() { return Promise.resolve(1); }
export async function ordinaryAwait() { return await Promise.resolve(1); }
export function terminalEffect(report: (value: number) => void) {
  Promise.resolve(1).then(value => { report(value); }).catch(error => { throw error; });
}
export function returnedEffect(report: (value: number) => void) {
  return Promise.resolve(1).then(value => report(value));
}
export function safeNarrow(value: unknown) {
  if (typeof value !== 'string') { throw new TypeError('Expected text'); }
  return value;
}
`
    );
    const valid = spawnSync(resolve('node_modules/.bin/oxlint'), args, { encoding: 'utf8', timeout: 30_000 });
    expect(valid.error).toBeUndefined();
    expect(valid.status, valid.stdout + valid.stderr).toBe(0);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test.each([
  {
    path: 'components/docs/release-probe.astro',
    group: 'nursery',
    rule: 'useAstroClientOnlyDirectiveValue',
    invalid: '<Widget client:only />',
    valid: '<Widget client:only="react" />',
  },
  {
    path: 'scripts/release-probe.test.ts',
    group: 'suspicious',
    rule: 'noConditionalExpect',
    invalid: "test('conditional', () => { if (enabled) { expect(value).toBe(1); } });",
    valid: "test('unconditional', () => { expect(value).toBe(1); });",
  },
  {
    path: 'scripts/release-probe.test.ts',
    group: 'suspicious',
    rule: 'useExpect',
    invalid: "test('empty', () => { runAction(); });",
    valid: "test('helper assertions run', () => { expect.hasAssertions(); expectThroughHelper(); });",
  },
  {
    path: 'registry/base-nova/protoform/components/release-probe.tsx',
    group: 'correctness',
    rule: 'useUniqueElementIds',
    invalid: 'export function Field() { return <input id="name" />; }',
    valid: 'export function Field() { const id = useId(); return <input id={id} />; }',
  },
])(
  '$rule rejects its unsafe fixture and accepts its legitimate counterpart',
  ({ path, group, rule, invalid, valid }) => {
    const directory = mkdtempSync(join(tmpdir(), 'protoform-release-biome-'));
    const fixture = join(directory, path);
    const config = readConfig('biome.jsonc');
    const groups = object.parse(object.parse(config['linter'])['rules']);
    const rules = object.parse(groups[group]);
    const isolatedRules: Record<string, Record<string, unknown>> = Object.fromEntries(
      Object.entries(groups).map(([name, entries]) => [
        name,
        Object.fromEntries(Object.keys(object.parse(entries)).map((entry) => [entry, 'off'])),
      ])
    );
    isolatedRules[group] = { ...isolatedRules[group], [rule]: rules[rule] };
    const overrides = z
      .array(object)
      .parse(config['overrides'])
      .flatMap((override) => {
        const { linter } = override;
        if (linter === undefined) {
          return [];
        }
        const configured = object.parse(object.parse(linter)['rules']);
        const section = configured[group];
        if (section === undefined) {
          return [];
        }
        const value = object.parse(section)[rule];
        return value === undefined
          ? []
          : [{ includes: override['includes'], linter: { rules: { [group]: { [rule]: value } } } }];
      });
    mkdirSync(dirname(fixture), { recursive: true });
    writeFileSync(
      join(directory, 'biome.json'),
      JSON.stringify({
        root: true,
        vcs: { enabled: false },
        html: { experimentalFullSupportEnabled: true },
        linter: { enabled: true, rules: isolatedRules },
        overrides,
      })
    );
    const args = ['lint', fixture, '--config-path', directory, '--colors=off', '--error-on-warnings'];
    try {
      writeFileSync(fixture, invalid);
      const rejected = spawnSync(resolve('node_modules/.bin/biome'), args, { encoding: 'utf8', timeout: 10_000 });
      expect(rejected.error).toBeUndefined();
      expect(rejected.status).toBe(1);
      expect(rejected.stdout + rejected.stderr).toContain(`lint/${group}/${rule}`);
      writeFileSync(fixture, valid);
      const accepted = spawnSync(resolve('node_modules/.bin/biome'), args, { encoding: 'utf8', timeout: 10_000 });
      expect(accepted.error).toBeUndefined();
      expect(accepted.status, accepted.stdout + accepted.stderr).toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }
);

test('bounds assertion exceptions to named bridges and keeps other safety checks active there', () => {
  const directory = mkdtempSync(join(tmpdir(), 'protoform-bridge-policy-'));
  const config = readConfig('.oxlintrc.jsonc');
  const configuredRules = object.parse(config['rules']);
  const bridge = 'registry/base-nova/protoform/lib/protobuf-provider/hook-runtime.ts';
  const leaf = 'registry/base-nova/protoform/components/input/index.tsx';
  const targets = ['typescript/no-unsafe-type-assertion', 'typescript/no-unsafe-assignment'];
  const args = ['--config', 'oxlint.json', '--format', 'json', bridge, leaf];
  try {
    symlinkSync(resolve('node_modules'), join(directory, 'node_modules'), 'dir');
    writeFileSync(join(directory, 'tsconfig.json'), JSON.stringify({ compilerOptions: { strict: true } }));
    writeFileSync(
      join(directory, 'oxlint.json'),
      JSON.stringify({
        plugins: ['typescript'],
        categories: { correctness: 'off' },
        options: { typeAware: true },
        rules: Object.fromEntries(targets.map((rule) => [rule, configuredRules[rule]])),
        overrides: config['overrides'],
      })
    );
    for (const path of [bridge, leaf]) {
      mkdirSync(dirname(join(directory, path)), { recursive: true });
      writeFileSync(join(directory, path), 'export function cast(value: unknown) { return value as string; }');
    }
    const result = spawnSync(resolve('node_modules/.bin/oxlint'), args, {
      cwd: directory,
      encoding: 'utf8',
      timeout: 30_000,
    });
    expect(result.error).toBeUndefined();
    expect(result.stdout, result.stdout + result.stderr).toContain('diagnostics');
    const { diagnostics } = z
      .object({ diagnostics: z.array(z.object({ filename: z.string(), code: z.string() })) })
      .parse(JSON.parse(result.stdout));
    expect(result.status).toBe(1);
    expect(diagnostics).toEqual([{ filename: leaf, code: 'typescript(no-unsafe-type-assertion)' }]);
    writeFileSync(join(directory, bridge), 'export const unsafe: string = JSON.parse("{}");');
    const unsafeBridge = spawnSync(resolve('node_modules/.bin/oxlint'), args, {
      cwd: directory,
      encoding: 'utf8',
      timeout: 30_000,
    });
    expect(unsafeBridge.error).toBeUndefined();
    expect(unsafeBridge.stdout).toContain('typescript(no-unsafe-assignment)');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
