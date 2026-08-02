import { describe, expect, it } from 'vitest';

import type { ParsedField } from '../core-types';
import { sliderFieldDefinition } from '../fields/slider';
import { buildFieldMatchContext } from '../registry';

function makeField(partial: Partial<ParsedField> & { fieldConfig?: ParsedField['fieldConfig'] } = {}): ParsedField {
  return {
    key: 'count',
    type: 'number',
    required: false,
    fieldConfig: {},
    ...partial,
  } as ParsedField;
}

describe('sliderFieldDefinition.match', () => {
  it('does NOT match a numeric field with min/max but no slider annotation', () => {
    const field = makeField({
      fieldConfig: { inputProps: { min: 0, max: 10 } },
    });
    expect(sliderFieldDefinition.match(field, buildFieldMatchContext(field))).toBe(false);
  });

  it('matches when customData.control === "slider"', () => {
    const field = makeField({
      fieldConfig: {
        inputProps: { min: 0, max: 10 },
        customData: { control: 'slider' },
      },
    });
    expect(sliderFieldDefinition.match(field, buildFieldMatchContext(field))).toBe(true);
  });

  it('matches when customData.ui.control === "slider" (proto path)', () => {
    const field = makeField({
      fieldConfig: {
        inputProps: { min: 0, max: 10 },
        customData: { ui: { control: 'slider' } },
      },
    });
    expect(sliderFieldDefinition.match(field, buildFieldMatchContext(field))).toBe(true);
  });

  it('does not match non-number fields even with slider annotation', () => {
    const field = makeField({
      type: 'string',
      fieldConfig: { customData: { control: 'slider' } },
    });
    expect(sliderFieldDefinition.match(field, buildFieldMatchContext(field))).toBe(false);
  });
});
