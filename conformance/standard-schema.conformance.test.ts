import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expect, it } from "vitest";
import { object as zodObject, string as zodString } from "zod";
import { minLength, object as zodMiniObject, string as zodMiniString } from "zod/mini";

import {
  createFinalFormValidator,
  createFormikValidator,
  isStandardSchema,
} from "../registry/base-nova/protoform/lib/core/index.js";

interface ProfileValues {
  profile: { displayName: string };
}

const values: ProfileValues = { profile: { displayName: "A" } };

const implementations: Array<{
  name: string;
  schema: StandardSchemaV1<ProfileValues, ProfileValues>;
}> = [
  {
    name: "Zod 4",
    schema: zodObject({
      profile: zodObject({ displayName: zodString().min(2) }),
    }),
  },
  {
    name: "Zod Mini",
    schema: zodMiniObject({
      profile: zodMiniObject({
        displayName: zodMiniString().check(minLength(2)),
      }),
    }),
  },
];

it("supports callable schemas and forwards vendor options", async () => {
  const libraryOptions = { locale: "en-GB" };
  let receivedOptions: StandardSchemaV1.Options | undefined;
  const schema = Object.assign(() => undefined, {
    "~standard": {
      validate: (value: unknown, options?: StandardSchemaV1.Options): StandardSchemaV1.Result<unknown> => {
        receivedOptions = options;
        return { value };
      },
      vendor: "callable-test",
      version: 1 as const,
    },
  });

  expect(isStandardSchema(schema)).toBe(true);
  expect(await createFormikValidator(schema, { libraryOptions })(values)).toEqual({});
  expect(receivedOptions?.libraryOptions).toBe(libraryOptions);
});

describe.each(implementations)("$name Standard Schema", ({ schema }) => {
  it("is accepted without a vendor adapter", () => {
    expect(isStandardSchema(schema)).toBe(true);
  });

  it("maps nested issues through every supported form-library adapter", async () => {
    const expected = {
      profile: { displayName: expect.stringContaining("2") },
    };

    expect(await createFormikValidator(schema)(values)).toEqual(expected);
    expect(await createFinalFormValidator(schema)(values)).toEqual(expected);
  });
});
