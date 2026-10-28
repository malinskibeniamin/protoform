import { headingLevelForDepth } from './layout-context';

declare const { expect, test }: typeof import('bun:test');

test.each([
  [0, 2],
  [1, 3],
  [2, 4],
  [3, 5],
  [99, 5],
  [-1, 2],
  [1.5, 3],
  [Number.NaN, 2],
] as const)('maps form depth %s to valid heading level %s', (depth, expected) => {
  expect(headingLevelForDepth(depth)).toBe(expected);
});
