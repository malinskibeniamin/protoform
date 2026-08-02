import { describe, expect, test } from 'vitest';

import { safeStringify } from './serialization';

describe('safeStringify', () => {
  test('stringifies objects with indentation', () => {
    expect(safeStringify({ a: 1 })).toBe('{\n  "a": 1\n}');
  });

  test('converts bigint to string', () => {
    expect(safeStringify({ n: BigInt(123) })).toBe('{\n  "n": "123"\n}');
  });

  test('converts Date to ISO string', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    expect(safeStringify({ d: date })).toBe('{\n  "d": "2024-01-01T00:00:00.000Z"\n}');
  });

  test('returns error placeholder for circular references', () => {
    const obj: Record<string, unknown> = {};
    obj.self = obj;
    expect(safeStringify(obj)).toBe('/* serialization error */');
  });
});
