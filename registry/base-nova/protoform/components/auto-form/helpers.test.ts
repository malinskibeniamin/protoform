import type { ParsedField } from './core-types';
import { getFieldUiConfig } from './helpers';

declare const { expect, test }: typeof import('bun:test');

test('rejects non-string option labels without changing valid label mappings', () => {
  const field: ParsedField = {
    key: 'region',
    required: false,
    type: 'select',
    fieldConfig: {
      customData: {
        optionLabels: { eu: 42 },
      },
    },
  };
  const result = getFieldUiConfig(field);
  expect(result.optionLabels).toBeUndefined();
  expect(
    getFieldUiConfig({ ...field, fieldConfig: { customData: { optionLabels: { eu: 'Europe' } } } }).optionLabels
  ).toEqual({ eu: 'Europe' });
});
