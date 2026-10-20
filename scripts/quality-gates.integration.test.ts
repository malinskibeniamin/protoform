import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect } from '@rstest/core';
import { z } from 'zod';

const reportSchema = z.object({ diagnostics: z.array(z.object({ code: z.string().optional() })) });

function lint(source: string): { codes: string[]; status: number | null } {
  mkdirSync(resolve('.tmp'), { recursive: true });
  const directory = mkdtempSync(resolve('.tmp/quality-probe-'));
  try {
    const file = join(directory, 'example.ts');
    const config = join(directory, 'tsconfig.json');
    writeFileSync(config, JSON.stringify({ compilerOptions: { strict: true }, include: ['example.ts'] }));
    writeFileSync(file, source);
    const result = spawnSync(
      resolve('node_modules/.bin/oxlint'),
      ['--config', resolve('.oxlintrc.jsonc'), '--tsconfig', config, '--format', 'json', file],
      { encoding: 'utf8' }
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
