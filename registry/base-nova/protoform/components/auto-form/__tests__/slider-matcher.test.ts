import { describe, expect } from "@rstest/core";

import type { ParsedField } from "../core-types";
import { sliderFieldDefinition } from "../fields/slider";
import { buildFieldMatchContext } from "../registry";

function makeField(partial: Partial<ParsedField> & { fieldConfig?: ParsedField["fieldConfig"] } = {}): ParsedField {
  return {
    fieldConfig: {},
    key: "count",
    required: false,
    type: "number",
    ...partial,
  } as ParsedField;
}

describe("sliderFieldDefinition.match", () => {
  test("does NOT match a numeric field with min/max but no slider annotation", () => {
    const field = makeField({
      fieldConfig: { inputProps: { max: 10, min: 0 } },
    });
    expect(sliderFieldDefinition.match(field, buildFieldMatchContext(field))).toBe(false);
  });

  test('matches when customData.control === "slider"', () => {
    const field = makeField({
      fieldConfig: {
        customData: { control: "slider" },
        inputProps: { max: 10, min: 0 },
      },
    });
    expect(sliderFieldDefinition.match(field, buildFieldMatchContext(field))).toBe(true);
  });

  test('matches when customData.ui.control === "slider" (proto path)', () => {
    const field = makeField({
      fieldConfig: {
        customData: { ui: { control: "slider" } },
        inputProps: { max: 10, min: 0 },
      },
    });
    expect(sliderFieldDefinition.match(field, buildFieldMatchContext(field))).toBe(true);
  });

  test("does not match non-number fields even with slider annotation", () => {
    const field = makeField({
      fieldConfig: { customData: { control: "slider" } },
      type: "string",
    });
    expect(sliderFieldDefinition.match(field, buildFieldMatchContext(field))).toBe(false);
  });
});
