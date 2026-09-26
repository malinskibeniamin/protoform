import { expect } from "@rstest/core";

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

test("accepts spec-conforming Standard Schema v1 objects and rejects everything else", () => {
  expect(isStandardSchema(specConformingSchema())).toBe(true);
  expect(isStandardSchema(Object.assign(() => undefined, specConformingSchema()))).toBe(true);

  for (const value of [null, undefined, "schema", 42, {}, { standard: { version: 1 } }]) {
    expect(isStandardSchema(value)).toBe(false);
  }

  const wrongVersion = specConformingSchema();
  (wrongVersion["~standard"] as { version: number }).version = 2;
  expect(isStandardSchema(wrongVersion)).toBe(false);

  const noValidate = specConformingSchema();
  (noValidate["~standard"] as { validate?: unknown }).validate = undefined;
  expect(isStandardSchema(noValidate)).toBe(false);
});
