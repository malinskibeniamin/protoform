import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, test } from '@rstest/core';
import { z } from 'zod';

const TS_EXPECT_ERROR = ['@ts', 'expect', 'error'].join('-');

const lintReport = z.object({ diagnostics: z.array(z.object({ code: z.string() })) });

function lintCodes(source: string, fileName = 'example.ts'): string[] {
  mkdirSync('.tmp', { recursive: true });
  const directory = mkdtempSync(resolve('.tmp/comment-policy-'));
  try {
    const fixture = join(directory, fileName);
    writeFileSync(fixture, source);
    const result = spawnSync(
      resolve('node_modules/.bin/oxlint'),
      ['--no-ignore', '--config', resolve('shadcn-lint.jsonc'), '--format', 'json', fixture],
      { encoding: 'utf8' }
    );
    expect(result.error).toBeUndefined();
    return [...new Set(lintReport.parse(JSON.parse(result.stdout)).diagnostics.map(({ code }) => code))].toSorted();
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
}

describe('comment policy', () => {
  test.each([
    ['line', 'export const value = 1; // explanation\n', 'example.ts'],
    ['block', 'export const /* explanation */ value = 1;\n', 'example.ts'],
    ['JSX', 'export const view = <div>{/* explanation */}</div>;\n', 'example.tsx'],
    ['documentation', '/** Explains the value. */\nexport const value = 1;\n', 'example.ts'],
  ])('rejects %s comments', (_kind, source, fileName) => {
    expect(lintCodes(source, fileName)).toEqual(['protoform(no-comments)']);
  });

  test('permits a shebang', () => {
    expect(lintCodes('#!/usr/bin/env bun\nexport const value = 1;\n')).toEqual([]);
  });

  test('rejects license headers', () => {
    expect(lintCodes('// Copyright 2026 Example, Inc.\nexport const value = 1;\n')).toEqual([
      'eslint(no-warning-comments)',
      'protoform(no-comments)',
    ]);
  });

  test('rejects TypeScript directive comments', () => {
    expect(lintCodes(`// ${TS_EXPECT_ERROR} intentional\nexport const value: string = 1;\n`)).toContain(
      'typescript(ban-ts-comment)'
    );
  });
});
