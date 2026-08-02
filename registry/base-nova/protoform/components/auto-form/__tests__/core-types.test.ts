import { describe, expect, it } from 'vitest';

import type { ParsedField } from '../core-types';
import { getLabel, getPathInObject, sortFieldsByOrder } from '../field-utils';

describe('sortFieldsByOrder', () => {
  it('returns empty array for undefined input', () => {
    expect(sortFieldsByOrder(undefined)).toEqual([]);
  });

  it('returns fields as-is when no order is set', () => {
    const fields: ParsedField[] = [
      { key: 'b', type: 'string', required: false },
      { key: 'a', type: 'string', required: false },
    ];
    const result = sortFieldsByOrder(fields);
    expect(result.map((f) => f.key)).toEqual(['b', 'a']);
  });

  it('sorts fields by fieldConfig.order ascending', () => {
    const fields: ParsedField[] = [
      { key: 'c', type: 'string', required: false, fieldConfig: { order: 3 } },
      { key: 'a', type: 'string', required: false, fieldConfig: { order: 1 } },
      { key: 'b', type: 'string', required: false, fieldConfig: { order: 2 } },
    ];
    const result = sortFieldsByOrder(fields);
    expect(result.map((f) => f.key)).toEqual(['a', 'b', 'c']);
  });

  it('treats missing order as 0', () => {
    const fields: ParsedField[] = [
      { key: 'second', type: 'string', required: false, fieldConfig: { order: 1 } },
      { key: 'first', type: 'string', required: false },
    ];
    const result = sortFieldsByOrder(fields);
    expect(result.map((f) => f.key)).toEqual(['first', 'second']);
  });

  it('recursively sorts nested schema fields', () => {
    const fields: ParsedField[] = [
      {
        key: 'parent',
        type: 'object',
        required: false,
        schema: [
          { key: 'z', type: 'string', required: false, fieldConfig: { order: 2 } },
          { key: 'a', type: 'string', required: false, fieldConfig: { order: 1 } },
        ],
      },
    ];
    const result = sortFieldsByOrder(fields);
    expect(result[0].schema?.map((f) => f.key)).toEqual(['a', 'z']);
  });
});

describe('getLabel', () => {
  it('returns fieldConfig.label when present', () => {
    const field: ParsedField = {
      key: 'myField',
      type: 'string',
      required: false,
      fieldConfig: { label: 'Custom Label' },
    };
    expect(getLabel(field)).toBe('Custom Label');
  });

  it('falls back to description', () => {
    const field: ParsedField = {
      key: 'myField',
      type: 'string',
      required: false,
      description: 'Field description',
    };
    expect(getLabel(field)).toBe('Field description');
  });

  it('beautifies camelCase key as last resort', () => {
    const field: ParsedField = { key: 'firstName', type: 'string', required: false };
    expect(getLabel(field)).toBe('First Name');
  });

  it('returns empty string for numeric keys', () => {
    const field: ParsedField = { key: '42', type: 'string', required: false };
    expect(getLabel(field)).toBe('');
  });
});

describe('getPathInObject', () => {
  it('traverses a nested object path', () => {
    const obj = { a: { b: { c: 'deep' } } };
    expect(getPathInObject(obj, ['a', 'b', 'c'])).toBe('deep');
  });

  it('returns the root object for empty path', () => {
    const obj = { x: 1 };
    expect(getPathInObject(obj, [])).toBe(obj);
  });

  it('returns undefined for missing keys', () => {
    const obj = { a: { b: 1 } };
    expect(getPathInObject(obj, ['a', 'missing'])).toBeUndefined();
  });

  it('returns undefined when traversing through null', () => {
    const obj = { a: null } as unknown as Record<string, unknown>;
    expect(getPathInObject(obj, ['a', 'b'])).toBeUndefined();
  });

  it('returns undefined when traversing through undefined', () => {
    const obj = { a: undefined } as Record<string, unknown>;
    expect(getPathInObject(obj, ['a', 'b'])).toBeUndefined();
  });
});
