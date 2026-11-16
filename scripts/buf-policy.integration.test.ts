import { spawnSync } from 'node:child_process';
import { describe, expect } from '@rstest/core';
import { z } from 'zod';

function runBufLint(input = '.') {
  return spawnSync('bunx', ['buf', 'lint', input, '--error-format=json'], {
    encoding: 'utf8',
  });
}

function runBufBreaking(input: string, against: string) {
  return spawnSync('bunx', ['buf', 'breaking', input, '--against', against, '--error-format=json'], {
    encoding: 'utf8',
  });
}

describe('buf policy', () => {
  test('passes Buf STANDARD including the complete Protovalidate lint rule', () => {
    const result = runBufLint();

    expect(result.status, `${result.stdout}${result.stderr}`).toBe(0);
    expect(`${result.stdout}${result.stderr}`).toBe('');
  });

  test('keeps intentional Protovalidate lint failures in an isolated module', () => {
    const result = runBufLint('conformance/expected-failures');
    const output = `${result.stdout}${result.stderr}`;
    const violations = output
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => z.looseObject({ type: z.string() }).parse(JSON.parse(line)));

    expect(result.status).not.toBe(0);
    expect(violations.length).toBeGreaterThan(0);
    expect(new Set(violations.map((violation) => violation.type))).toEqual(new Set(['PROTOVALIDATE']));
  });

  test('enforces target-branch compatibility and rejects an isolated fixture', () => {
    const result = runBufBreaking(
      'conformance/expected-failures/breaking/candidate',
      'conformance/expected-failures/breaking/baseline'
    );
    const output = `${result.stdout}${result.stderr}`;
    const violations = output
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => z.looseObject({ type: z.string() }).parse(JSON.parse(line)));

    expect(result.status).not.toBe(0);
    expect(violations.map((violation) => violation.type)).toContain('FIELD_SAME_TYPE');
  });
});
