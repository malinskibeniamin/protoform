import { expect, test } from "vitest";

import { getFieldHints, type ParsedField } from "./field-model.js";

test("returns first-class hints when present", () => {
  const field: ParsedField = {
    hints: { control: "combobox", placeholder: "Pick a region" },
    key: "region",
    required: true,
    type: "string",
  };
  expect(getFieldHints(field)).toEqual({
    control: "combobox",
    placeholder: "Pick a region",
  });
});

test("returns undefined when a field carries no hints", () => {
  const field: ParsedField = { key: "name", required: false, type: "string" };
  expect(getFieldHints(field)).toBeUndefined();
});

test("hints stay schema-agnostic: a provider-agnostic field round-trips arbitrary hint values", () => {
  const field: ParsedField = {
    hints: {
      disabledWhen: [
        {
          expression: "this.tier == 'FREE'",
          id: "tier-gate",
          message: "Upgrade first",
        },
      ],
      jsonKind: "struct",
      minItems: 1,
      step: "connection",
      supportsUnset: true,
      visibleWhen: [{ expression: "this.enabled" }],
    },
    key: "config",
    required: false,
    type: "object",
  };
  const hints = getFieldHints(field);
  expect(hints?.step).toBe("connection");
  expect(hints?.visibleWhen).toHaveLength(1);
  expect(hints?.disabledWhen?.[0]?.id).toBe("tier-gate");
  expect(hints?.minItems).toBe(1);
});

test("nested schema fields carry their own hints independently", () => {
  const field: ParsedField = {
    key: "credentials",
    required: true,
    schema: [
      {
        hints: { control: "password", sensitive: true },
        key: "apiKey",
        required: true,
        type: "string",
      },
    ],
    type: "object",
  };
  expect(getFieldHints(field)).toBeUndefined();
  const nested = field.schema?.[0];
  expect(nested && getFieldHints(nested)?.sensitive).toBe(true);
});
