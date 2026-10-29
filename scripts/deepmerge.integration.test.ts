import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { expect } from '@rstest/core';
import { z } from 'zod';

interface MergeOptions {
  arrayMerge?: (target: unknown[], source: unknown[]) => unknown[];
  clone?: boolean;
}

interface Merge {
  all: (sources: unknown[], options?: MergeOptions) => unknown;
  (target: unknown, source: unknown, options?: MergeOptions): unknown;
}

function loadMerge(consumer: string): Merge {
  const consumerRequire = createRequire(resolve('node_modules', consumer, 'package.json'));
  const entry = consumerRequire.resolve('deepmerge');
  const value: unknown = consumerRequire(entry);
  return z
    .custom<Merge>(
      (candidate) => typeof candidate === 'function' && 'all' in candidate && typeof candidate.all === 'function'
    )
    .parse(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

test.each(['ultracite', 'shadcn', '@shadcn/registry'])(
  '%s cannot inherit injected properties through a null merge target',
  (consumer) => {
    const merge = loadMerge(consumer);
    const input: unknown = JSON.parse('{"session":{"__proto__":{"protoformInjected":true},"label":"kept"}}');
    const result = merge({ session: null }, input);
    if (!isRecord(result)) {
      throw new TypeError('Expected a merged object.');
    }
    const { session } = result;
    if (!isRecord(session)) {
      throw new TypeError('Expected a merged session.');
    }

    expect(session['label']).toBe('kept');
    expect(session['protoformInjected']).toBeUndefined();
    expect(Object.getPrototypeOf(session)).toBe(Object.prototype);
  }
);

test('preserves recursive configuration merging, array concatenation and independent copies', () => {
  const merge = loadMerge('ultracite');
  const target = { files: ['source'], rules: { correctness: { enabled: true } } };
  const source = { files: ['tests'], rules: { style: { enabled: true } } };
  const result = merge(target, source);

  expect(result).toEqual({
    files: ['source', 'tests'],
    rules: { correctness: { enabled: true }, style: { enabled: true } },
  });
  expect(target).toEqual({ files: ['source'], rules: { correctness: { enabled: true } } });
  expect(source).toEqual({ files: ['tests'], rules: { style: { enabled: true } } });
  if (!(isRecord(result) && isRecord(result['rules']))) {
    throw new TypeError('Expected merged configuration rules.');
  }
  expect(result['files']).not.toBe(target.files);
  expect(result['rules']['correctness']).not.toBe(target.rules.correctness);
});

test('preserves the custom array merger used by shadcn config updaters and merge.all', () => {
  const merge = loadMerge('shadcn');
  const options: MergeOptions = { arrayMerge: (_target, source) => source };

  expect(merge({ files: ['old'] }, { files: ['replacement'] }, options)).toEqual({ files: ['replacement'] });
  expect(merge.all([{ left: true }, { files: ['first'] }, { files: ['last'] }], options)).toEqual({
    files: ['last'],
    left: true,
  });
});

test('does not inherit properties from either input when the target has a null prototype', () => {
  const merge = loadMerge('@shadcn/registry');
  const input: unknown = JSON.parse('{"__proto__":{"protoformInjected":true},"label":"kept"}');
  const result = merge(Object.setPrototypeOf({}, null), input);
  const copied = merge(input, {});

  for (const value of [result, copied]) {
    if (!isRecord(value)) {
      throw new TypeError('Expected a merged object.');
    }
    expect(value['label']).toBe('kept');
    expect(value['protoformInjected']).toBeUndefined();
    expect(Object.hasOwn(value, '__proto__')).toBe(false);
    expect(Object.getPrototypeOf(value)).toBe(Object.prototype);
  }
});
