// @rstest-environment node

import { describe, expect, it } from "@rstest/core";

import { createProtoFormSchema } from "../registry/base-nova/protoform/lib/protobuf-provider/index.js";
import { FloatDoubleRulesSchema, IntegerRulesSchema } from "./gen/protoform/conformance/v1/conformance_pb.js";

type ValidationResult = Awaited<ReturnType<ReturnType<typeof createProtoFormSchema>["~standard"]["validate"]>>;

function paths(result: ValidationResult): string[][] {
  return (result.issues ?? []).map((issue) => (issue.path ?? []).map((segment) => String(segment)));
}

async function expectValid(schema: ReturnType<typeof createProtoFormSchema>, field: string, value: unknown) {
  const result = await schema["~standard"].validate({ [field]: value });
  expect(result.issues, `${field} rejected ${String(value)}`).toBeUndefined();
}

async function expectInvalid(schema: ReturnType<typeof createProtoFormSchema>, field: string, value: unknown) {
  const result = await schema["~standard"].validate({ [field]: value });
  expect(paths(result), `${field} accepted ${String(value)}`).toContainEqual([field]);
}

describe("Protovalidate numeric rule conformance", () => {
  it.each(["float", "double"])(
    "enforces const, comparisons, membership, finite values, and reversed ranges for %s",
    async (kind) => {
      const schema = createProtoFormSchema(FloatDoubleRulesSchema);

      await expectValid(schema, `${kind}Const`, 1.5);
      await expectInvalid(schema, `${kind}Const`, 1.6);
      await expectValid(schema, `${kind}Range`, 2);
      await expectInvalid(schema, `${kind}Range`, 0);
      await expectInvalid(schema, `${kind}Range`, 5);
      await expectValid(schema, `${kind}Allowed`, 2);
      await expectInvalid(schema, `${kind}Allowed`, 3);
      await expectValid(schema, `${kind}Denied`, 2);
      await expectInvalid(schema, `${kind}Denied`, 3);
      await expectValid(schema, `${kind}Reversed`, 3);
      await expectValid(schema, `${kind}Reversed`, 12);
      await expectInvalid(schema, `${kind}Reversed`, 7);
      await expectValid(schema, `${kind}Finite`, 1);
      await expectInvalid(schema, `${kind}Finite`, Number.NaN);
      await expectInvalid(schema, `${kind}Finite`, Number.POSITIVE_INFINITY);
    }
  );

  it.each([
    ["int32", false],
    ["sint32", false],
    ["sfixed32", false],
    ["int64", true],
    ["sint64", true],
    ["sfixed64", true],
  ] as const)("enforces const, comparisons, membership, and reversed ranges for %s", async (kind, is64Bit) => {
    const schema = createProtoFormSchema(IntegerRulesSchema);
    const value = (number: number) => (is64Bit ? String(number) : number);

    await expectValid(schema, `${kind}Const`, value(7));
    await expectInvalid(schema, `${kind}Const`, value(8));
    await expectValid(schema, `${kind}Range`, value(5));
    await expectInvalid(schema, `${kind}Range`, value(0));
    await expectInvalid(schema, `${kind}Range`, value(11));
    await expectValid(schema, `${kind}Allowed`, value(7));
    await expectInvalid(schema, `${kind}Allowed`, value(8));
    await expectValid(schema, `${kind}Denied`, value(7));
    await expectInvalid(schema, `${kind}Denied`, value(8));
    await expectValid(schema, `${kind}Reversed`, value(3));
    await expectValid(schema, `${kind}Reversed`, value(12));
    await expectInvalid(schema, `${kind}Reversed`, value(7));
  });

  it.each([
    ["uint32", false],
    ["fixed32", false],
    ["uint64", true],
    ["fixed64", true],
  ] as const)("enforces const, comparisons, membership, and reversed ranges for %s", async (kind, is64Bit) => {
    const schema = createProtoFormSchema(IntegerRulesSchema);
    const value = (number: number) => (is64Bit ? String(number) : number);

    await expectValid(schema, `${kind}Const`, value(7));
    await expectInvalid(schema, `${kind}Const`, value(8));
    await expectValid(schema, `${kind}Range`, value(5));
    await expectInvalid(schema, `${kind}Range`, value(0));
    await expectInvalid(schema, `${kind}Range`, value(11));
    await expectValid(schema, `${kind}Allowed`, value(7));
    await expectInvalid(schema, `${kind}Allowed`, value(8));
    await expectValid(schema, `${kind}Denied`, value(7));
    await expectInvalid(schema, `${kind}Denied`, value(8));
    await expectValid(schema, `${kind}Reversed`, value(3));
    await expectValid(schema, `${kind}Reversed`, value(12));
    await expectInvalid(schema, `${kind}Reversed`, value(7));
  });
});
