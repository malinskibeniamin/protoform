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
  test("matches only number fields annotated through customData.control or the proto ui path", () => {
    for (const customData of [{ control: "slider" }, { ui: { control: "slider" } }]) {
      const field = makeField({ fieldConfig: { customData, inputProps: { max: 10, min: 0 } } });
      expect(sliderFieldDefinition.match(field, buildFieldMatchContext(field))).toBe(true);
    }

    const bounded = makeField({ fieldConfig: { inputProps: { max: 10, min: 0 } } });
    const text = makeField({ fieldConfig: { customData: { control: "slider" } }, type: "string" });
    expect(sliderFieldDefinition.match(bounded, buildFieldMatchContext(bounded))).toBe(false);
    expect(sliderFieldDefinition.match(text, buildFieldMatchContext(text))).toBe(false);
  });
});
