// @vitest-environment node

import { create, createRegistry } from "@bufbuild/protobuf";
import { base64Encode } from "@bufbuild/protobuf/wire";
import { createValidator } from "@bufbuild/protovalidate";
import { describe, expect, it } from "vitest";

import {
  createProtoFormSchema,
  parseProtoSchema,
} from "../registry/base-nova/protoform/lib/protobuf-provider/index.js";
import {
  BytesRuleMatrixSchema,
  ExampleRuleMatrixSchema,
  PredefinedRuleMatrixSchema,
  StringNetworkRulesSchema,
  WellKnownRuleMatrixSchema,
} from "./gen/protoform/conformance/v1/conformance_pb.js";
import { IgnoreRuleMatrixSchema } from "./gen/protoform/conformance/v1/expected_failures_pb.js";
import { kebab_case } from "./gen/protoform/conformance/v1/predefined_pb.js";

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

function bytes(value: string | readonly number[]): string {
  return base64Encode(typeof value === "string" ? new TextEncoder().encode(value) : Uint8Array.from(value));
}

describe("Protovalidate format rule conformance", () => {
  it.each([
    ["hostname", "api.example.com", "not a host"],
    ["ip", "192.0.2.1", "999.0.2.1"],
    ["ipv4", "192.0.2.1", "2001:db8::1"],
    ["ipv6", "2001:db8::1", "192.0.2.1"],
    ["uriReference", "/profiles/123?view=full", "https://exa mple.com"],
    ["address", "api.example.com", "not an address"],
    ["ipWithPrefixLength", "192.0.2.1/24", "192.0.2.1/99"],
    ["ipv4WithPrefixLength", "192.0.2.1/24", "2001:db8::1/64"],
    ["ipv6WithPrefixLength", "2001:db8::1/64", "192.0.2.1/24"],
    ["ipPrefix", "192.0.2.0/24", "192.0.2.1/24"],
    ["ipv4Prefix", "192.0.2.0/24", "2001:db8::/64"],
    ["ipv6Prefix", "2001:db8::/64", "192.0.2.0/24"],
    ["hostAndPort", "api.example.com:443", "api.example.com"],
    ["ulid", "01ARZ3NDEKTSV4RRFFQ69G5FAV", "not-a-ulid"],
    ["protobufFqn", "google.protobuf.Timestamp", ".google.protobuf.Timestamp"],
    ["protobufDotFqn", ".google.protobuf.Timestamp", "google.protobuf.Timestamp"],
  ])("validates the %s string format", async (field, valid, invalid) => {
    const schema = createProtoFormSchema(StringNetworkRulesSchema);

    await expectValid(schema, field, valid);
    await expectInvalid(schema, field, invalid);
  });

  it.each([
    ["exact", bytes("proto"), bytes("wrong")],
    ["exactLength", bytes("12345"), bytes("1234")],
    ["boundedLength", bytes("four"), bytes("12")],
    ["patterned", bytes("lower"), bytes("UPPER")],
    ["prefixed", bytes("pre-value"), bytes("value")],
    ["suffixed", bytes("value-post"), bytes("value")],
    ["containing", bytes("has-mid-value"), bytes("value")],
    ["allowed", bytes("one"), bytes("three")],
    ["denied", bytes("safe"), bytes("bad")],
    ["ip", bytes([192, 0, 2, 1]), bytes([192, 0, 2])],
    ["ipv4", bytes([192, 0, 2, 1]), bytes(new Array(16).fill(0))],
    ["ipv6", bytes(new Array(16).fill(0)), bytes([192, 0, 2, 1])],
    [
      "uuid",
      bytes([0x12, 0x3e, 0x45, 0x67, 0xe8, 0x9b, 0x12, 0xd3, 0xa4, 0x56, 0x42, 0x66, 0x14, 0x17, 0x40, 0x00]),
      bytes([1, 2, 3]),
    ],
  ])("validates the %s bytes rule", async (field, valid, invalid) => {
    const schema = createProtoFormSchema(BytesRuleMatrixSchema);

    await expectValid(schema, field, valid);
    await expectInvalid(schema, field, invalid);
  });
});

describe("Protovalidate well-known-type rule conformance", () => {
  it("enforces duration const, comparisons, ranges, membership, normalization, and malformed input", async () => {
    const schema = createProtoFormSchema(WellKnownRuleMatrixSchema);

    await expectValid(schema, "exactDuration", "5s");
    await expectInvalid(schema, "exactDuration", "6s");
    await expectValid(schema, "boundedDuration", "7s");
    await expectInvalid(schema, "boundedDuration", "4s");
    await expectValid(schema, "reversedDuration", "3s");
    await expectValid(schema, "reversedDuration", "12s");
    await expectInvalid(schema, "reversedDuration", "7s");
    await expectValid(schema, "allowedDuration", "5.000000000s");
    await expectInvalid(schema, "allowedDuration", "7s");
    await expectInvalid(schema, "deniedDuration", "5s");
    await expectInvalid(schema, "exactDuration", "not-a-duration");
  });

  it("enforces FieldMask const, allow, deny, and subpath semantics", async () => {
    const schema = createProtoFormSchema(WellKnownRuleMatrixSchema);

    await expectValid(schema, "exactMask", ["display_name"]);
    await expectInvalid(schema, "exactMask", ["settings"]);
    await expectValid(schema, "allowedMask", ["settings.theme"]);
    await expectInvalid(schema, "allowedMask", ["name"]);
    await expectInvalid(schema, "deniedMask", ["name.child"]);
  });

  it("enforces timestamp const, comparisons, reversed and now-relative ranges, timezone normalization, and malformed input", async () => {
    const schema = createProtoFormSchema(WellKnownRuleMatrixSchema);
    const now = Date.now();

    await expectValid(schema, "exactTimestamp", "2030-01-01T01:00:00+01:00");
    await expectInvalid(schema, "exactTimestamp", "2030-01-01T00:00:01Z");
    await expectValid(schema, "boundedTimestamp", "2030-01-01T12:00:00Z");
    await expectInvalid(schema, "boundedTimestamp", "2029-12-31T23:59:59Z");
    await expectValid(schema, "reversedTimestamp", "2029-12-31T23:00:00Z");
    await expectValid(schema, "reversedTimestamp", "2030-01-02T01:00:00Z");
    await expectInvalid(schema, "reversedTimestamp", "2030-01-01T12:00:00Z");
    await expectValid(schema, "recentPast", new Date(now - 3_600_000).toISOString());
    await expectInvalid(schema, "recentPast", new Date(now - 172_800_000).toISOString());
    await expectValid(schema, "nearFuture", new Date(now + 3_600_000).toISOString());
    await expectInvalid(schema, "nearFuture", new Date(now + 172_800_000).toISOString());
    await expectInvalid(schema, "exactTimestamp", "not-a-date");
  });
});

describe("Protovalidate control-plane rule conformance", () => {
  it("applies IGNORE_ALWAYS and IGNORE_IF_ZERO_VALUE across scalar, message, repeated, and map fields", async () => {
    const schema = createProtoFormSchema(IgnoreRuleMatrixSchema);
    const zeroValues = await schema["~standard"].validate({
      alwaysChild: { name: "x" },
      alwaysIgnored: "x",
      zeroMap: [],
      zeroRepeated: [],
      zeroString: "",
    });

    expect(zeroValues.issues).toBeUndefined();
    await expectInvalid(schema, "zeroString", "x");
    const invalidMessage = await schema["~standard"].validate({
      zeroMessage: { name: "x" },
    });
    expect(paths(invalidMessage)).toContainEqual(["zeroMessage", "name"]);
    await expectInvalid(schema, "zeroRepeated", ["one", "two"]);
    await expectInvalid(schema, "zeroMap", [
      { key: "one", value: "1" },
      { key: "two", value: "2" },
    ]);
  });

  it("executes custom predefined rules with a stable rule id and form path", async () => {
    const registry = createRegistry(kebab_case);
    const validatorResult = createValidator({ registry }).validate(
      PredefinedRuleMatrixSchema,
      create(PredefinedRuleMatrixSchema, { slug: "Not Kebab" })
    );
    const standardResult = await createProtoFormSchema(PredefinedRuleMatrixSchema, {
      registry,
    })["~standard"].validate({ slug: "Not Kebab" });

    expect(validatorResult).toMatchObject({
      kind: "invalid",
      violations: [expect.objectContaining({ ruleId: "string.kebab_case" })],
    });
    expect(paths(standardResult)).toContainEqual(["slug"]);
  });

  it("keeps standard rule examples non-validating and surfaces the first example as form guidance", async () => {
    const schema = createProtoFormSchema(ExampleRuleMatrixSchema);
    const empty = await schema["~standard"].validate({});
    const invalid = await schema["~standard"].validate({ email: "not-email" });
    const field = parseProtoSchema(ExampleRuleMatrixSchema).fields.find((candidate) => candidate.key === "email");

    expect(empty.issues).toBeUndefined();
    expect(paths(invalid)).toContainEqual(["email"]);
    expect(field?.hints?.example).toBe("guide@example.com");
  });
});
