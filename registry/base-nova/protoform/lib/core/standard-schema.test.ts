import { expect, test } from "@rstest/core";

import { isStandardSchema } from "./standard-schema.js";

function specConformingSchema() {
  return {
    "~standard": {
      validate: (value: unknown) => ({ value }),
      vendor: "protoform",
      version: 1 as const,
    },
  };
}

test("accepts a spec-conforming Standard Schema v1 object", () => {
  expect(isStandardSchema(specConformingSchema())).toBe(true);
});

test("accepts a callable Standard Schema v1 implementation", () => {
  const schema = Object.assign(() => undefined, specConformingSchema());

  expect(isStandardSchema(schema)).toBe(true);
});

test("rejects primitives and null", () => {
  expect(isStandardSchema(null)).toBe(false);
  expect(isStandardSchema(undefined)).toBe(false);
  expect(isStandardSchema("schema")).toBe(false);
  expect(isStandardSchema(42)).toBe(false);
});

test("rejects objects without the ~standard marker", () => {
  expect(isStandardSchema({})).toBe(false);
  expect(isStandardSchema({ standard: { version: 1 } })).toBe(false);
});

test("rejects a ~standard marker with the wrong version", () => {
  const schema = specConformingSchema();
  const marker = schema["~standard"] as { version: number };
  marker.version = 2;
  expect(isStandardSchema(schema)).toBe(false);
});

test("rejects a ~standard marker without a validate function", () => {
  const schema = specConformingSchema();
  const marker = schema["~standard"] as { validate?: unknown };
  marker.validate = undefined;
  expect(isStandardSchema(schema)).toBe(false);
});
