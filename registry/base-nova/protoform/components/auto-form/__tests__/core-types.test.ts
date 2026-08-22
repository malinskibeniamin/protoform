import { describe, expect } from "@rstest/core";

import type { ParsedField } from "../core-types";
import { getLabel, getPathInObject, sortFieldsByOrder } from "../field-utils";

describe("sortFieldsByOrder", () => {
  test("returns empty array for undefined input", () => {
    expect(sortFieldsByOrder(undefined)).toEqual([]);
  });

  test("returns fields as-is when no order is set", () => {
    const fields: ParsedField[] = [
      { key: "b", required: false, type: "string" },
      { key: "a", required: false, type: "string" },
    ];
    const result = sortFieldsByOrder(fields);
    expect(result.map((f) => f.key)).toEqual(["b", "a"]);
  });

  test("sorts fields by fieldConfig.order ascending", () => {
    const fields: ParsedField[] = [
      { fieldConfig: { order: 3 }, key: "c", required: false, type: "string" },
      { fieldConfig: { order: 1 }, key: "a", required: false, type: "string" },
      { fieldConfig: { order: 2 }, key: "b", required: false, type: "string" },
    ];
    const result = sortFieldsByOrder(fields);
    expect(result.map((f) => f.key)).toEqual(["a", "b", "c"]);
  });

  test("treats missing order as 0", () => {
    const fields: ParsedField[] = [
      { fieldConfig: { order: 1 }, key: "second", required: false, type: "string" },
      { key: "first", required: false, type: "string" },
    ];
    const result = sortFieldsByOrder(fields);
    expect(result.map((f) => f.key)).toEqual(["first", "second"]);
  });

  test("recursively sorts nested schema fields", () => {
    const fields: ParsedField[] = [
      {
        key: "parent",
        required: false,
        schema: [
          { fieldConfig: { order: 2 }, key: "z", required: false, type: "string" },
          { fieldConfig: { order: 1 }, key: "a", required: false, type: "string" },
        ],
        type: "object",
      },
    ];
    const result = sortFieldsByOrder(fields);
    expect(result[0]?.schema?.map((f) => f.key)).toEqual(["a", "z"]);
  });
});

describe("getLabel", () => {
  test("returns fieldConfig.label when present", () => {
    const field: ParsedField = {
      fieldConfig: { label: "Custom Label" },
      key: "myField",
      required: false,
      type: "string",
    };
    expect(getLabel(field)).toBe("Custom Label");
  });

  test("falls back to description", () => {
    const field: ParsedField = {
      description: "Field description",
      key: "myField",
      required: false,
      type: "string",
    };
    expect(getLabel(field)).toBe("Field description");
  });

  test("beautifies camelCase key as last resort", () => {
    const field: ParsedField = { key: "firstName", required: false, type: "string" };
    expect(getLabel(field)).toBe("First Name");
  });

  test("returns empty string for numeric keys", () => {
    const field: ParsedField = { key: "42", required: false, type: "string" };
    expect(getLabel(field)).toBe("");
  });
});

describe("getPathInObject", () => {
  test("traverses a nested object path", () => {
    const obj = { a: { b: { c: "deep" } } };
    expect(getPathInObject(obj, ["a", "b", "c"])).toBe("deep");
  });

  test("returns the root object for empty path", () => {
    const obj = { x: 1 };
    expect(getPathInObject(obj, [])).toBe(obj);
  });

  test("returns undefined for missing keys", () => {
    const obj = { a: { b: 1 } };
    expect(getPathInObject(obj, ["a", "missing"])).toBeUndefined();
  });

  test("returns undefined when traversing through null", () => {
    const obj = { a: null } as unknown as Record<string, unknown>;
    expect(getPathInObject(obj, ["a", "b"])).toBeUndefined();
  });

  test("returns undefined when traversing through undefined", () => {
    const obj = { a: undefined } as Record<string, unknown>;
    expect(getPathInObject(obj, ["a", "b"])).toBeUndefined();
  });
});
