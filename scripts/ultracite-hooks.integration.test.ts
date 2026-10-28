import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect } from '@rstest/core';

const cli = resolve('node_modules/ultracite/dist/index.js');
const unformatted = 'export const value={name:"untouched"};\n';

describe('ultracite edit hooks', () => {
  let directory = '';

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'protoform-ultracite-hook-'));
    symlinkSync(resolve('node_modules'), resolve(directory, 'node_modules'), 'dir');
    writeFileSync(resolve(directory, 'biome.json'), JSON.stringify({ linter: { enabled: false } }));
    writeFileSync(resolve(directory, 'untouched.ts'), unformatted);
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  test.each([
    ['missing path', JSON.stringify({ tool_name: 'Edit', tool_input: {} })],
    ['unknown payload', JSON.stringify({ edited: { file: 'untouched.ts' } })],
    ['invalid JSON', 'not JSON'],
    ['empty stdin', ''],
    ['unreadable path', JSON.stringify({ tool_name: 'Edit', tool_input: { file_path: 'missing.ts' } })],
  ])('leaves unrelated files alone for %s', (_label, input) => {
    const result = spawnSync(process.execPath, [cli, 'fix', '--hook'], {
      cwd: directory,
      input,
      encoding: 'utf8',
      timeout: 10_000,
    });

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(readFileSync(resolve(directory, 'untouched.ts'), 'utf8')).toBe(unformatted);
  });

  test('formats only the readable path named by an edit payload', () => {
    const edited = resolve(directory, 'edited.ts');
    writeFileSync(edited, unformatted);
    const valid = spawnSync(process.execPath, [cli, 'fix', '--hook'], {
      cwd: directory,
      input: JSON.stringify({ tool_name: 'Edit', tool_input: { file_path: edited } }),
      encoding: 'utf8',
      timeout: 10_000,
    });

    expect(valid.error).toBeUndefined();
    expect(valid.status).toBe(0);
    expect(readFileSync(edited, 'utf8')).not.toBe(unformatted);
    expect(readFileSync(resolve(directory, 'untouched.ts'), 'utf8')).toBe(unformatted);
  });
});
