import { expect, test } from "@rstest/core";
import { expectTypeOf } from "expect-type";
import { isStandardSchema } from "../core/index.js";
import { createProtoFormSchema } from "./form-schema.js";
import { AutoFormExampleSchema } from "./gen/auto-form-example_pb.js";

function buildValidProtoFormValues(): Record<string, unknown> {
  return {
    accessTier: 3,
    age: 34,
    avatarBytes: "AQIDBA==",
    bio: "A protobuf-backed form with Buf reflection and Protovalidate.",
    createdAt: "2026-03-17T09:00",
    employeeNumber: "4001",
    homepageUrl: "https://protoform.com",
    labels: [{ key: "team", value: "frontend" }],
    maximumThreshold: 10,
    minimumThreshold: 5,
    officeLocations: [
      {
        key: "hq",
        value: {
          city: "San Francisco",
          country: 1,
          lineOne: "500 Harbor Way",
          postalCode: "94107",
          state: "CA",
        },
      },
    ],
    preferredContact: {
      case: "preferredEmail",
      value: "forms@protoform.com",
    },
    primaryEmail: "forms@protoform.com",
    reminderInterval: "300s",
    resourceId: "123e4567-e89b-12d3-a456-426614174000",
    shippingAddress: {
      city: "San Francisco",
      country: 1,
      lineOne: "500 Harbor Way",
      postalCode: "94107",
      state: "CA",
    },
    storageQuotaBytes: "4096",
    tags: ["forms"],
    username: "protoform_admin",
    writablePaths: ["profile"],
  };
}

test("createProtoFormSchema returns a Standard Schema", () => {
  const schema = createProtoFormSchema(AutoFormExampleSchema);

  expect(isStandardSchema(schema)).toBe(true);
  expect(schema["~standard"].version).toBe(1);
  expect(schema["~standard"].vendor).toBe("protoform");
});

test("createProtoFormSchema can expose a consumer-specific form input", () => {
  interface FormInput {
    username: string;
  }

  const schema = createProtoFormSchema<FormInput, typeof AutoFormExampleSchema>(AutoFormExampleSchema);

  expectTypeOf(schema["~standard"].types?.input).toEqualTypeOf<FormInput | undefined>();
});

test("valid form values produce a typed message value", async () => {
  const schema = createProtoFormSchema(AutoFormExampleSchema);

  const result = await schema["~standard"].validate(buildValidProtoFormValues());

  expect(result.issues).toBeUndefined();
  if (result.issues) {
    throw new Error("expected a success result");
  }
  expect(result.value.$typeName).toBe("protoform.v1.AutoFormExample");
  expect(result.value.username).toBe("protoform_admin");
  expect(result.value.primaryEmail).toBe("forms@protoform.com");
});

test("invalid form values produce issues with form-shaped camelCase paths", async () => {
  const schema = createProtoFormSchema(AutoFormExampleSchema);

  const result = await schema["~standard"].validate({});

  expect(result.issues).toBeDefined();
  if (!result.issues) {
    throw new Error("expected a failure result");
  }
  expect(result.issues.length).toBeGreaterThan(0);

  const paths = result.issues.map((issue) =>
    (issue.path ?? [])
      .map((segment) => (typeof segment === "object" && segment !== null && "key" in segment ? segment.key : segment))
      .join(".")
  );

  // Proto field `primary_email` must surface under its form (camelCase) path.
  expect(paths).toContain("primaryEmail");
  for (const path of paths) {
    expect(path).not.toContain("_");
  }
});

test("non-object input fails with a root issue instead of throwing", async () => {
  const schema = createProtoFormSchema(AutoFormExampleSchema);

  const result = await schema["~standard"].validate("not an object");

  expect(result.issues).toBeDefined();
  if (!result.issues) {
    throw new Error("expected a failure result");
  }
  expect(result.issues.length).toBeGreaterThan(0);
});
