import { describe, expect } from "@rstest/core";

import type { ParsedField } from "../core-types";
import { getLabel, getPathInObject, sortFieldsByOrder } from "../field-utils";

describe("sortFieldsByOrder", () => {
  test("sorts by ascending order, treats missing order as 0, recurses into nested fields, and handles undefined input", () => {
    const fields: ParsedField[] = [
      { fieldConfig: { order: 2 }, key: "c", required: false, type: "string" },
      { key: "a", required: false, type: "string" },
      { fieldConfig: { order: 1 }, key: "b", required: false, type: "string" },
      {
        fieldConfig: { order: 3 },
        key: "parent",
        required: false,
        schema: [
          { fieldConfig: { order: 2 }, key: "z", required: false, type: "string" },
          { fieldConfig: { order: 1 }, key: "y", required: false, type: "string" },
        ],
        type: "object",
      },
    ];
    const result = sortFieldsByOrder(fields);
    expect(result.map((f) => f.key)).toEqual(["a", "b", "c", "parent"]);
    expect(result[3]?.schema?.map((f) => f.key)).toEqual(["y", "z"]);

    expect(sortFieldsByOrder(undefined)).toEqual([]);
  });
});

describe("getLabel", () => {
  test("prefers fieldConfig.label, then description, then the beautified key, and returns empty string for numeric keys", () => {
    const field: ParsedField = { key: "firstName", required: false, type: "string" };
    expect(getLabel({ ...field, description: "Field description", fieldConfig: { label: "Custom Label" } })).toBe(
      "Custom Label"
    );
    expect(getLabel({ ...field, description: "Field description" })).toBe("Field description");
    expect(getLabel(field)).toBe("First Name");
    expect(getLabel({ ...field, key: "42" })).toBe("");
  });
});

describe("getPathInObject", () => {
  test("traverses nested paths and returns undefined through missing, null, or undefined segments", () => {
    const obj = { a: { b: { c: "deep" } }, n: null, u: undefined } as unknown as Record<string, unknown>;
    expect(getPathInObject(obj, [])).toBe(obj);
    expect(getPathInObject(obj, ["a", "b", "c"])).toBe("deep");
    expect(getPathInObject(obj, ["a", "missing"])).toBeUndefined();
    expect(getPathInObject(obj, ["n", "b"])).toBeUndefined();
    expect(getPathInObject(obj, ["u", "b"])).toBeUndefined();
  });
});
