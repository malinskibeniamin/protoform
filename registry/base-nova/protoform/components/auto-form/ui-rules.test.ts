import { evaluateUiRules } from './ui-rules';

declare const { describe, expect, test }: typeof import('bun:test');

const readyRule = {
  expression: "form.enabled && this == 'ready'",
  id: 'ui.ready',
  message: 'Ready state is required.',
};

describe('autoForm UI CEL profile', () => {
  test('exposes only form and current-field values and fails closed for malformed, unknown, erroring, and non-boolean rules', () => {
    expect(
      evaluateUiRules([readyRule], {
        form: { enabled: true },
        thisValue: 'ready',
      })
    ).toBe(true);
    expect(
      evaluateUiRules([readyRule], {
        form: { enabled: false },
        thisValue: 'ready',
      })
    ).toBe(false);
    expect(
      evaluateUiRules([readyRule], {
        form: { enabled: true },
        thisValue: 'waiting',
      })
    ).toBe(false);

    const context = { form: {}, thisValue: undefined };
    const expressions = ['(', 'unknown_name', '1 / 0', "'visible'"];

    for (const expression of expressions) {
      expect(evaluateUiRules([{ expression, id: `ui.${expression}`, message: '' }], context)).toBe(false);
    }
  });
});
