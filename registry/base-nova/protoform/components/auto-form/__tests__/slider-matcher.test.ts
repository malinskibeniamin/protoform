import { describe, expect, it } from "vitest";

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
  it("does NOT match a numeric field with min/max but no slider annotation", () => {
    const field = makeField({
      fieldConfig: { inputProps: { max: 10, min: 0 } },
    });
    expect(sliderFieldDefinition.match(field, buildFieldMatchContext(field))).toBe(false);
  });

  it('matches when customData.control === "slider"', () => {
    const field = makeField({
      fieldConfig: {
        customData: { control: "slider" },
        inputProps: { max: 10, min: 0 },
      },
    });
    expect(sliderFieldDefinition.match(field, buildFieldMatchContext(field))).toBe(true);
  });

  it('matches when customData.ui.control === "slider" (proto path)', () => {
    const field = makeField({
      fieldConfig: {
        customData: { ui: { control: "slider" } },
        inputProps: { max: 10, min: 0 },
      },
    });
    expect(sliderFieldDefinition.match(field, buildFieldMatchContext(field))).toBe(true);
  });

  it("does not match non-number fields even with slider annotation", () => {
    const field = makeField({
      fieldConfig: { customData: { control: "slider" } },
      type: "string",
    });
    expect(sliderFieldDefinition.match(field, buildFieldMatchContext(field))).toBe(false);
  });
});
