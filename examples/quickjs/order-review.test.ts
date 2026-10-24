import { evaluateQuickJs } from '../../registry/base-nova/protoform/lib/quickjs/evaluator';
import { orderReviewRule } from './order-review';

declare const { expect, test }: typeof import('bun:test');

test.each([
  { lines: [{ sku: 'BOOK-1', quantity: 0 }], stock: [{ key: 'BOOK-1', value: 4 }] },
  { lines: [{ sku: 'BOOK-1', quantity: -1 }], stock: [{ key: 'BOOK-1', value: 4 }] },
  { lines: [{ sku: 'BOOK-1', quantity: 1.5 }], stock: [{ key: 'BOOK-1', value: 4 }] },
  { lines: [{ sku: 'BOOK-1', quantity: 1 }], stock: [{ key: 'BOOK-1', value: -1 }] },
  { lines: [{ sku: 'invalid sku', quantity: 1 }], stock: [{ key: 'invalid sku', value: 4 }] },
  {
    lines: [{ sku: 'BOOK-1', quantity: 1 }],
    stock: [
      { key: 'BOOK-1', value: 3 },
      { key: 'BOOK-1', value: 4 },
    ],
  },
  {
    lines: [
      { sku: 'BOOK-1', quantity: Number.MAX_SAFE_INTEGER },
      { sku: 'BOOK-1', quantity: 1 },
    ],
    stock: [{ key: 'BOOK-1', value: Number.MAX_SAFE_INTEGER }],
  },
])('rejects malformed or ambiguous order quantities and inventory %j', async (values) => {
  await Promise.resolve(
    expect(
      evaluateQuickJs({
        fields: ['lines', 'stock', 'backorderNote', 'dispatchReference'],
        values,
        source: orderReviewRule.source,
      })
    ).rejects.toThrow()
  );
});
