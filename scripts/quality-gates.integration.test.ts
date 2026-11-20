import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect } from '@rstest/core';
import { z } from 'zod';

const reportSchema = z.object({ diagnostics: z.array(z.object({ code: z.string().optional() })) });

function lint(source: string, extension: 'ts' | 'js' = 'ts'): { codes: string[]; status: number | null } {
  mkdirSync(resolve('.tmp'), { recursive: true });
  const directory = mkdtempSync(resolve('.tmp/quality-probe-'));
  try {
    const file = join(directory, `example.${extension}`);
    const config = join(directory, 'tsconfig.json');
    writeFileSync(
      config,
      JSON.stringify({
        compilerOptions: { strict: true, allowJs: true, checkJs: true, noEmit: true, target: 'ESNext' },
        include: [`example.${extension}`],
      })
    );
    writeFileSync(file, source);
    const result = spawnSync(
      resolve('node_modules/.bin/oxlint'),
      ['--config', resolve('.oxlintrc.jsonc'), '--tsconfig', config, '--format', 'json', file],
      { encoding: 'utf8', env: { ...process.env, OXLINT_TSGOLINT_PATH: resolve('node_modules/.bin/tsrs-lint') } }
    );
    if (result.error) {
      throw result.error;
    }
    return {
      codes: reportSchema
        .parse(JSON.parse(result.stdout))
        .diagnostics.flatMap(({ code }) => (code === undefined ? [] : [code])),
      status: result.status,
    };
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
}

describe('strict quality gates at the CLI', () => {
  test('accepts checked source', () => {
    expect(lint('export const meaningfulName = 1;\n')).toEqual({ codes: [], status: 0 });
  });

  test('rejects copying reducer accumulators in JavaScript', () => {
    const rejected = lint(
      'export const items = [1, 2].reduce((result, value) => result.toSpliced(result.length, 0, value * 2), [0]);',
      'js'
    );
    expect(rejected).toEqual({ codes: ['quality(no-reduce-accumulator-copy)'], status: 1 });

    expect(lint('export const items = [0, 1, 2].map((value) => value * 2);', 'js')).toEqual({ codes: [], status: 0 });
  });

  test('rejects widening and reasserting a known TypeScript value', () => {
    const rejected = lint('const original: unknown = "ready"; export const state = original as string;');
    expect(rejected.status).toBe(1);
    expect(rejected.codes).toContain('quality(no-widen-then-assert)');

    expect(lint('export const state = "ready";')).toEqual({ codes: [], status: 0 });
  });

  test('reports TypeScript compiler errors through the lint command', () => {
    const result = lint('export const value: string = 42;');
    expect(result.status).toBe(1);
    expect(result.codes).toContain('typescript(TS2322)');
  });

  test('rejects discarded promises instead of silently accepting a type-aware flag', () => {
    const result = lint('async function save() { await fetch("https://example.com"); }\nsave();\n');
    expect(result.status).toBe(1);
    expect(result.codes).toContain('typescript(no-floating-promises)');
  });

  test('rejects unsafe data flows from untyped APIs', () => {
    const result = lint('const payload = JSON.parse("{}");\npayload.run();\n');
    expect(result.status).toBe(1);
    expect(result.codes).toEqual(
      expect.arrayContaining(['typescript(no-unsafe-assignment)', 'typescript(no-unsafe-call)'])
    );
  });
});
