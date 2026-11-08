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
});
