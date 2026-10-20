import { safeStringify } from './serialization';

declare const { describe, expect, test }: typeof import('bun:test');

describe('safeStringify', () => {
  test('indents output, serializes bigint and Date values, and returns a placeholder for circular references', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    expect(safeStringify({ d: date, n: 123n })).toBe('{\n  "d": "2024-01-01T00:00:00.000Z",\n  "n": "123"\n}');

    const obj: Record<string, unknown> = {};
    obj['self'] = obj;
    expect(safeStringify(obj)).toBe('/* serialization error */');
  });
});
