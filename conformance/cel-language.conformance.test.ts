import { describe, expect } from '@rstest/core';
import { compileCelExpression } from '../registry/base-nova/protoform/components/auto-form/cel-runtime.js';

const celTrue = { kind: 'value', value: true };

describe('cel language conformance', () => {
  test('supports CEL syntax, literals, scalar types, operators, and conversions', () => {
    expect(
      compileCelExpression(`
      true && null == null &&
      1 + 2 * 3 == 7 &&
      7u > 1u &&
      1.5 * 2.0 == 3.0 &&
      int('42') == 42 &&
      uint('7') == 7u &&
      double('1.5') == 1.5 &&
      string(42) == '42' &&
      type(1) == int
    `)()
    ).toMatchObject(celTrue);
  });

  test('supports lists, maps, and every standard comprehension macro', () => {
    expect(
      compileCelExpression(`
      [1, 2, 3].all(value, value > 0) &&
      [1, 2, 3].exists(value, value == 2) &&
      [1, 2, 3].exists_one(value, value == 2) &&
      [1, 2, 3].filter(value, value > 1) == [2, 3] &&
      [1, 2].map(value, value * 2) == [2, 4] &&
      'owner' in {'owner': 'ada'} &&
      {'owner': 'ada'}.owner == 'ada'
    `)()
    ).toMatchObject(celTrue);
  });

  test('supports string operations', () => {
    expect(
      compileCelExpression(`
      'protoform'.startsWith('proto') &&
      'protoform'.endsWith('form') &&
      'protoform'.contains('tofo') &&
      'protoform'.matches('^[a-z]+$') &&
      'protoform'.size() == 9
    `)()
    ).toMatchObject(celTrue);
  });

  test('uses RE2 semantics for string matching', () => {
    expect(compileCelExpression("'protoform'.matches('^proto.*$')")()).toMatchObject(celTrue);
    expect(compileCelExpression("'ab'.matches('a(?=b)')")()).toMatchObject({ kind: 'error' });
  });

  test('supports timestamp and duration construction, comparison, and arithmetic', () => {
    expect(
      compileCelExpression(`
      duration('90s') > duration('60s') &&
      timestamp('2025-01-01T00:00:00Z') + duration('3600s') ==
        timestamp('2025-01-01T01:00:00Z') &&
      timestamp('2025-01-01T00:00:00Z').getFullYear() == 2025
    `)()
    ).toMatchObject(celTrue);
  });

  test('propagates errors while preserving logical short circuit behavior', () => {
    expect(compileCelExpression('false && (1 / 0 > 0)')()).toMatchObject({ kind: 'value', value: false });
    expect(compileCelExpression('true || (1 / 0 > 0)')()).toMatchObject(celTrue);
    expect(compileCelExpression('true && (1 / 0 > 0)')()).toMatchObject({ kind: 'error' });
  });

  test('parses once and reuses a planned expression across evaluations', () => {
    const evaluate = compileCelExpression('value * 2');

    expect(evaluate({ value: 2n })).toMatchObject({ kind: 'value', value: 4n });
    expect(evaluate({ value: 7n })).toMatchObject({ kind: 'value', value: 14n });
  });

  test('meets the CEL minimum expression nesting and repetition limits', () => {
    const repeated = Array.from({ length: 32 }, () => 'true').join(' && ');
    expect(compileCelExpression(repeated)()).toMatchObject(celTrue);

    const nested = `${'int('.repeat(12)}1${')'.repeat(12)} == 1`;
    expect(compileCelExpression(nested)()).toMatchObject(celTrue);
  });

  test('returns safe errors instead of throwing for invalid runtime inputs', () => {
    expect(compileCelExpression('1 / 0')()).toMatchObject({ kind: 'error' });
    expect(compileCelExpression('unknown_name')()).toMatchObject({ kind: 'error' });
  });
});
