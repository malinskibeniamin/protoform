import { describe, expect, it } from "vitest";
import { AutoFormExampleSchema } from "../registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb.js";
import {
  createProtoFormSchema,
  parseProtoSchema,
  protoToFormValues,
} from "../registry/base-nova/protoform/lib/protobuf-provider/index.js";

type FormInput = Record<string, unknown>;

interface ValidationCase {
  input: FormInput;
  name: string;
  paths: (string | number)[][];
}

const validInput: FormInput = {
  accessTier: 3,
  age: 34,
  avatarBytes: "AQIDBA==",
  bio: "A protobuf-backed form with validation.",
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

const requiredValidationCases: ValidationCase[] = [
  {
    input: { ...validInput, primaryEmail: "" },
    name: "required scalar",
    paths: [["primaryEmail"]],
  },
  {
    input: {
      ...validInput,
      shippingAddress: {
        city: "",
        country: 1,
        lineOne: "500 Harbor Way",
        postalCode: "94107",
        state: "CA",
      },
    },
    name: "nested message",
    paths: [["shippingAddress", "city"]],
  },
  {
    input: { ...validInput, luckyNumbers: [0, 100] },
    name: "repeated item",
    paths: [
      ["luckyNumbers", 0],
      ["luckyNumbers", 1],
    ],
  },
  {
    input: {
      ...validInput,
      officeLocations: [
        {
          key: "hq",
          value: {
            city: "",
            country: 1,
            lineOne: "500 Harbor Way",
            postalCode: "94107",
            state: "CA",
          },
        },
      ],
    },
    name: "nested map value",
    paths: [["officeLocations", 0, "value", "city"]],
  },
  {
    input: {
      ...validInput,
      preferredContact: { case: undefined, value: undefined },
    },
    name: "required oneof",
    paths: [["preferredContact"]],
  },
  {
    input: {
      ...validInput,
      preferredContact: { case: "preferredEmail", value: "not-an-email" },
    },
    name: "active oneof branch",
    paths: [["preferredContact", "value"]],
  },
];

const recommendedValidationCases: ValidationCase[] = [
  {
    input: { ...validInput, homepageUrl: "not a URI" },
    name: "format rule",
    paths: [["homepageUrl"]],
  },
  {
    input: { ...validInput, maximumThreshold: 10, minimumThreshold: 20 },
    name: "message CEL rule",
    paths: [[]],
  },
  {
    input: {
      ...validInput,
      labels: [{ key: "?", value: "" }],
    },
    name: "all map key and value failures",
    paths: [["labels"], ["labels"], ["labels"]],
  },
  {
    input: { ...validInput, avatarBytes: "!!!" },
    name: "malformed conversion input",
    paths: [[]],
  },
];

function getIssuePaths(
  issues:
    | readonly {
        path?: readonly (PropertyKey | { key: PropertyKey })[];
      }[]
    | undefined
): (string | number)[][] | undefined {
  return issues?.map((issue) =>
    (issue.path ?? []).map((segment) => {
      const key =
        typeof segment === "object" && segment !== null && "key" in segment
          ? segment.key
          : segment;
      return typeof key === "number" ? key : String(key);
    })
  );
}

describe("required Protoform conformance", () => {
  it("exposes descriptor validation through Standard Schema v1", () => {
    const schema = createProtoFormSchema(AutoFormExampleSchema);

    expect(schema["~standard"]).toMatchObject({
      vendor: "protoform",
      version: 1,
    });
  });

  it.each([
    { key: "username", required: true, type: "string" },
    {
      control: "email",
      key: "primaryEmail",
      required: true,
      type: "string",
    },
    { key: "employeeNumber", required: false, type: "int64" },
    { key: "accessTier", required: false, type: "select" },
    { key: "shippingAddress", required: true, type: "object" },
    { key: "tags", required: true, type: "array" },
    { key: "labels", required: true, type: "map" },
    { key: "preferredContact", required: true, type: "oneof" },
    { key: "createdAt", required: true, type: "timestamp" },
    { key: "reminderInterval", required: false, type: "duration" },
    { key: "preferences", required: false, type: "json" },
  ])("maps $key into the stable field model", (expectedField) => {
    const parsedSchema = parseProtoSchema(AutoFormExampleSchema);
    const field = parsedSchema.fields.find(
      (candidate) => candidate.key === expectedField.key
    );

    expect(field).toBeDefined();
    expect({
      control: field?.hints?.control,
      key: field?.key,
      required: field?.required,
      type: field?.type,
    }).toMatchObject(expectedField);
  });

  it("turns valid form values into a typed protobuf message", async () => {
    const schema = createProtoFormSchema(AutoFormExampleSchema);
    const result = await schema["~standard"].validate(validInput);

    expect(result.issues).toBeUndefined();
    if (result.issues) {
      throw new Error("Expected the required conformance fixture to validate.");
    }
    expect(result.value).toMatchObject({
      $typeName: "protoform.v1.AutoFormExample",
      employeeNumber: 4001n,
      labels: { team: "frontend" },
      preferredContact: {
        case: "preferredEmail",
        value: "forms@protoform.com",
      },
      username: "protoform_admin",
    });
    expect(Array.from(result.value.avatarBytes)).toEqual([1, 2, 3, 4]);
  });

  it.each(
    requiredValidationCases
  )("returns form-shaped paths for $name failures", async ({
    input,
    paths,
  }) => {
    const schema = createProtoFormSchema(AutoFormExampleSchema);
    const result = await schema["~standard"].validate(input);

    expect(getIssuePaths(result.issues)).toEqual(paths);
  });

  it("returns a root issue for a non-object input instead of throwing", async () => {
    const schema = createProtoFormSchema(AutoFormExampleSchema);
    const result = await schema["~standard"].validate("not an object");

    expect(getIssuePaths(result.issues)).toEqual([[]]);
  });
});

describe("recommended Protoform conformance", () => {
  it.each(
    recommendedValidationCases
  )("reports $name with stable paths", async ({ input, paths }) => {
    const schema = createProtoFormSchema(AutoFormExampleSchema);
    const result = await schema["~standard"].validate(input);

    expect(getIssuePaths(result.issues)).toEqual(paths);
  });

  it("round-trips optional, wrapper, JSON, map, bytes, and oneof values", async () => {
    const schema = createProtoFormSchema(AutoFormExampleSchema);
    const result = await schema["~standard"].validate({
      ...validInput,
      betaTester: true,
      bonusPoints: 42,
      dashboardBlocks: ["overview", "alerts"],
      featuredValue: "feature-rollout",
      middleName: "UI",
      nickname: "Harbor",
      preferences: { density: "comfortable", theme: "dark" },
    });

    expect(result.issues).toBeUndefined();
    if (result.issues) {
      throw new Error(
        "Expected the round-trip conformance fixture to validate."
      );
    }

    expect(
      protoToFormValues(AutoFormExampleSchema, result.value)
    ).toMatchObject({
      avatarBytes: "AQIDBA==",
      betaTester: true,
      bonusPoints: 42,
      dashboardBlocks: ["overview", "alerts"],
      employeeNumber: "4001",
      featuredValue: "feature-rollout",
      labels: [{ key: "team", value: "frontend" }],
      middleName: "UI",
      nickname: "Harbor",
      preferences: { density: "comfortable", theme: "dark" },
      preferredContact: {
        case: "preferredEmail",
        value: "forms@protoform.com",
      },
      reminderInterval: "300s",
      writablePaths: ["profile"],
    });
  });

  it("keeps every oneof branch discoverable in descriptor order", () => {
    const parsedSchema = parseProtoSchema(AutoFormExampleSchema);
    const oneof = parsedSchema.fields.find(
      (field) => field.key === "preferredContact"
    );

    expect(oneof?.schema?.map((field) => field.key)).toEqual([
      "preferredEmail",
      "preferredPhone",
      "doNotContact",
    ]);
  });
});
