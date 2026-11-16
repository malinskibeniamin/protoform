import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect } from '@rstest/core';

describe('strict React tooling', () => {
  test('rejects unsafe and redundant patterns with the configured Biome 2.6 rules', () => {
    mkdirSync('.tmp', { recursive: true });
    const directory = mkdtempSync(resolve('.tmp/biome-rule-probe-'));
    const fixture = resolve(directory, 'probe.test.ts');
    try {
      writeFileSync(
        fixture,
        `
export function isPositive(value: number) {
  if (value > 0) {
    return true;
  }
  return false;
}
export function copyDate(value: Date) {
  return new Date(value.getTime());
}
export function invert(value: number) {
  return value * -1;
}
export function callDirectly() {
  return isPositive.call(null, 1);
}
export function order(values: number[]) {
  return values.toSorted((left, right) => left > right);
}
const {} = {};
`
      );
      const result = spawnSync(
        resolve('node_modules/.bin/biome'),
        ['lint', fixture, '--colors=off', '--vcs-enabled=false', '--max-diagnostics=none'],
        {
          encoding: 'utf8',
        }
      );

      expect(result.error).toBeUndefined();
      expect(result.status).toBe(1);
      const diagnostics = result.stdout + result.stderr;
      for (const rule of [
        'useSimplifiedBooleanReturn',
        'noUselessDateGetTime',
        'useUnaryMinus',
        'noUselessCall',
        'noBooleanSortComparator',
      ]) {
        expect(diagnostics).toContain(`lint/nursery/${rule}`);
      }
      expect(diagnostics).toContain('lint/correctness/noEmptyPattern');

      writeFileSync(
        fixture,
        'export function order(values: number[]) { return values.toSorted((left, right) => left - right); }\n'
      );
      const valid = spawnSync(
        resolve('node_modules/.bin/biome'),
        ['lint', fixture, '--only=nursery/noBooleanSortComparator', '--vcs-enabled=false'],
        { encoding: 'utf8', timeout: 10_000 }
      );
      expect(valid.error).toBeUndefined();
      expect(valid.status).toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  test('enforces Ultracite label associations for shadcn controls', () => {
    mkdirSync('.tmp', { recursive: true });
    const directory = mkdtempSync(resolve('.tmp/ultracite-label-probe-'));
    const fixture = resolve(directory, 'probe.tsx');
    const imports = `
import { Input } from '@/registry/base-nova/protoform/components/input';
import { Label } from '@/registry/base-nova/protoform/components/label';
`;
    const args = ['lint', fixture, '--colors=off', '--vcs-enabled=false'];
    try {
      writeFileSync(
        fixture,
        `${imports}
export function Field() {
  return <><Label>Name</Label><Input aria-label="Name" /></>;
}
`
      );
      const invalid = spawnSync(resolve('node_modules/.bin/biome'), args, { encoding: 'utf8', timeout: 10_000 });
      expect(invalid.error).toBeUndefined();
      expect(invalid.status).toBe(1);
      expect(invalid.stdout + invalid.stderr).toContain('lint/a11y/noLabelWithoutControl');

      writeFileSync(
        fixture,
        `${imports}
export function Field() {
  return <Label>Name<Input aria-label="Name" /></Label>;
}
`
      );
      const valid = spawnSync(resolve('node_modules/.bin/biome'), args, { encoding: 'utf8', timeout: 10_000 });
      expect(valid.error).toBeUndefined();
      expect(valid.stdout + valid.stderr).not.toContain('lint/a11y/noLabelWithoutControl');
      expect(valid.status).toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  test('formats Astro templates with Oxfmt and remains idempotent', () => {
    const formatter = resolve('node_modules/.bin/oxfmt');
    const args = ['--stdin-filepath', 'probe.astro'];
    const result = spawnSync(formatter, args, {
      input: '<main><h1>Protoform</h1></main>',
      encoding: 'utf8',
      timeout: 10_000,
    });

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stdout).toBe('<main>\n  <h1>Protoform</h1>\n</main>\n');

    const repeated = spawnSync(formatter, args, { input: result.stdout, encoding: 'utf8', timeout: 10_000 });
    expect(repeated.error).toBeUndefined();
    expect(repeated.status).toBe(0);
    expect(repeated.stdout).toBe(result.stdout);
  });

  test.each(['node', 'dom', 'conformance'])(
    'executes fail-fast React Compiler in the %s test project',
    (suite) => {
      mkdirSync('.tmp', { recursive: true });
      const directory = mkdtempSync(resolve('.tmp/react-compiler-probe-'));
      const fixture = resolve(directory, 'probe.test.tsx');
      const config = resolve(directory, 'rstest.config.ts');
      const baseConfig = resolve(`rstest.${suite}.config.ts`);
      const run = () =>
        spawnSync(process.execPath, ['scripts/run-tests.ts', suite, '--config', config, '--reporters', 'dot'], {
          encoding: 'utf8',
          timeout: 20_000,
        });
      try {
        writeFileSync(
          config,
          `import base from ${JSON.stringify(baseConfig)};
export default { ...base, include: [${JSON.stringify(fixture)}], performance: { buildCache: false } };
`
        );
        writeFileSync(
          fixture,
          `import { expect, test } from '@rstest/core';
export function Probe({ label }: { label: string }) { return <p>{label}</p>; }
test('valid component', () => { expect(typeof Probe).toBe('function'); });
`
        );
        const valid = run();
        expect(valid.error).toBeUndefined();
        expect(valid.stdout + valid.stderr).toContain('1 passed');
        expect(valid.status).toBe(0);

        writeFileSync(
          fixture,
          `import { expect, test } from '@rstest/core';
let renders = 0;
export function Probe() { renders += 1; return <p>{renders}</p>; }
test('invalid component', () => { expect(typeof Probe).toBe('function'); });
`
        );
        const invalid = run();
        expect(invalid.error).toBeUndefined();
        expect(invalid.status).toBe(1);
        expect(invalid.stdout + invalid.stderr).toContain('[ReactCompiler] Cannot reassign variables declared outside');
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    },
    60_000
  );

  test('rejects invalid authored tests through the primary strict compiler program', () => {
    const directory = mkdtempSync(resolve('scripts/typecheck-probe-'));
    const fixture = resolve(directory, 'probe.test.ts');
    const run = () =>
      spawnSync('bun', ['run', 'typecheck:source', '--incremental', 'false', '--pretty', 'false'], {
        encoding: 'utf8',
        timeout: 20_000,
      });
    try {
      writeFileSync(fixture, 'export const value: string = 123;\n');
      const primary = run();
      expect(primary.error).toBeUndefined();
      expect(primary.status).toBe(2);
      expect(primary.stdout + primary.stderr).toContain('TS2322');

      writeFileSync(fixture, "export const value: string = 'valid';\n");
      const valid = run();
      expect(valid.error).toBeUndefined();
      expect(valid.status, valid.stdout + valid.stderr).toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }, 60_000);
});
