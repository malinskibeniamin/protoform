import { findForbiddenDirectives } from './check-no-suppressions';

declare const { describe, expect, test }: typeof import('bun:test');

const forbiddenDirectiveCases = [
  ['biome', 'ignore'].join('-'),
  ['eslint', 'disable'].join('-'),
  ['oxlint', 'disable'].join('-'),
  ['prettier', 'ignore'].join('-'),
  ['oxfmt', 'ignore'].join('-'),
  ['react-doctor', 'disable'].join('-'),
  ['@ts', 'expect-error'].join('-'),
  ['@ts', 'ignore'].join('-'),
  ['@ts', 'nocheck'].join('-'),
];

describe('inline suppression policy', () => {
  test.each(forbiddenDirectiveCases)('rejects %s', (directive) => {
    expect(findForbiddenDirectives(`// ${directive}`)).toEqual([directive]);
  });

  test('rejects case-insensitive compiler bypasses', () => {
    expect(findForbiddenDirectives(`/* ${['@TS', 'NOCHECK'].join('-')} */`)).not.toEqual([]);
  });

  test('rejects inline rule configuration', () => {
    expect(findForbiddenDirectives('/* eslint no-alert: off */')).not.toEqual([]);
  });

  test('does not treat documented string values as directives', () => {
    expect(findForbiddenDirectives(`const name = '${['biome', 'ignore'].join('-')}';`)).toEqual([]);
  });

  test('rejects directives after interpolated templates', () => {
    const directive = ['@ts', 'ignore'].join('-');
    expect(findForbiddenDirectives(`const text = \`hello \${true}\`; // ${directive}`)).toEqual([directive]);
  });

  test('accepts ordinary comments', () => {
    expect(findForbiddenDirectives('// Explain why this branch exists.')).toEqual([]);
  });
});
