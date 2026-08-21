import { describe, expect, it } from "@rstest/core";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import {
  createFinalFormValidator,
  createFormikValidator,
  standardSchemaIssuesToFormErrors,
} from "./form-library-adapters.js";

interface ProfileValues {
  contacts: Array<{ email: string }>;
  displayName: string;
}

function failingSchema(): StandardSchemaV1<ProfileValues, ProfileValues> {
  return {
    "~standard": {
      validate: () => ({
        issues: [
          { message: "Display name is required.", path: ["displayName"] },
          {
            message: "Enter a valid email address.",
            path: ["contacts", 0, { key: "email" }],
          },
          {
            message: "Use an approved email domain.",
            path: ["contacts", 0, "email"],
          },
          { message: "Review the highlighted fields.", path: [] },
        ],
      }),
      vendor: "test",
      version: 1,
    },
  };
}

const values: ProfileValues = {
  contacts: [{ email: "invalid" }],
  displayName: "",
};

describe("form-library Standard Schema adapters", () => {
  it("maps Standard Schema issues for Formik", async () => {
    const validate = createFormikValidator(failingSchema());

    expect(await validate(values)).toEqual({
      _form: "Review the highlighted fields.",
      contacts: [
        {
          email: "Enter a valid email address.\nUse an approved email domain.",
        },
      ],
      displayName: "Display name is required.",
    });
  });

  it("maps Standard Schema issues for Final Form", async () => {
    const formError = Symbol("form-error");
    const validate = createFinalFormValidator(failingSchema(), {
      rootErrorKey: formError,
    });
    const errors = await validate(values);

    expect(errors).toMatchObject({
      contacts: [
        {
          email: "Enter a valid email address.\nUse an approved email domain.",
        },
      ],
      displayName: "Display name is required.",
    });
    expect(errors[formError]).toBe("Review the highlighted fields.");
  });

  it("returns no errors for valid values", async () => {
    const schema: StandardSchemaV1<ProfileValues, ProfileValues> = {
      "~standard": {
        validate: () => ({ value: values }),
        vendor: "test",
        version: 1,
      },
    };

    expect(await createFormikValidator(schema)(values)).toEqual({});
    expect(await createFinalFormValidator(schema)(values)).toEqual({});
  });

  it("forwards Standard Schema library options", async () => {
    const libraryOptions = { locale: "en-GB" };
    const receivedOptions: Array<StandardSchemaV1.Options | undefined> = [];
    const schema: StandardSchemaV1<ProfileValues, ProfileValues> = {
      "~standard": {
        validate: (_value, options) => {
          receivedOptions.push(options);
          return { value: values };
        },
        vendor: "test",
        version: 1,
      },
    };

    await createFormikValidator(schema)(values);
    await createFormikValidator(schema, { libraryOptions })(values);
    await createFinalFormValidator(schema, { libraryOptions })(values);

    expect(receivedOptions).toEqual([undefined, { libraryOptions }, { libraryOptions }]);
  });

  it("does not allow issue paths to mutate object prototypes", () => {
    const errors = standardSchemaIssuesToFormErrors([
      {
        message: "Unsafe path was isolated.",
        path: ["__proto__", "polluted"],
      },
    ]);

    expect(Object.hasOwn(errors, "__proto__")).toBe(true);
    expect(Reflect.get(Object.prototype, "polluted")).toBeUndefined();
  });
});
