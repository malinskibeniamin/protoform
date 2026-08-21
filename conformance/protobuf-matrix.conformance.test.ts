import { create, fromBinary, fromJson, toBinary } from "@bufbuild/protobuf";
import { fromText, mergeFromText, toText } from "@bufbuild/protobuf/txtpb";
import { base64Encode, sizeDelimitedDecodeStream, sizeDelimitedEncode } from "@bufbuild/protobuf/wire";
import { anyPack, anyUnpack, StructSchema } from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "@rstest/core";

import {
  createProtoFormSchema,
  formValuesToProto,
  protoToFormValues,
} from "../registry/base-nova/protoform/lib/protobuf-provider/index.js";
import {
  AnyMatrixSchema,
  CollectionMatrixSchema,
  NumericMatrixSchema,
  PresenceMatrixSchema,
} from "./gen/protoform/conformance/v1/conformance_pb.js";

function issuePaths(
  issues:
    | readonly {
        path?: readonly (PropertyKey | { key: PropertyKey })[] | undefined;
      }[]
    | undefined
): string[][] | undefined {
  return issues?.map((issue) =>
    (issue.path ?? []).map((segment) =>
      String(typeof segment === "object" && segment !== null && "key" in segment ? segment.key : segment)
    )
  );
}

describe("Protobuf text and streaming conformance", () => {
  it("round-trips form messages through the protobuf text format", () => {
    const parsed = fromText(NumericMatrixSchema, "enabled: true\nint32_value: -7\n");
    const values = protoToFormValues(NumericMatrixSchema, parsed);

    values["int32Value"] = 8;
    const edited = formValuesToProto(NumericMatrixSchema, values, parsed);

    expect(toText(NumericMatrixSchema, edited)).toBe("enabled: true\nint32_value: 8\n");
  });

  it("merges protobuf text into an existing message", () => {
    const target = create(NumericMatrixSchema, {
      enabled: true,
      int32Value: 1,
    });

    const merged = mergeFromText(NumericMatrixSchema, target, "int32_value: 2\n");

    expect(merged).toMatchObject({ enabled: true, int32Value: 2 });
  });

  it("bounds size-delimited decoding with readMaxBytes", async () => {
    const encoded = sizeDelimitedEncode(NumericMatrixSchema, create(NumericMatrixSchema, { enabled: true }));
    const chunks = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoded);
        controller.close();
      },
    });
    const decoded = sizeDelimitedDecodeStream(NumericMatrixSchema, chunks, {
      readMaxBytes: 1,
    });

    await expect(decoded.next()).rejects.toThrow("readMaxBytes 1");
  });
});

describe("Protobuf scalar conformance", () => {
  it("preserves unknown fields when editing a parsed message", () => {
    const originalBytes = toBinary(NumericMatrixSchema, create(NumericMatrixSchema, { int32Value: 1 }));
    const unknownFieldBytes = [0xb8, 0x3e, 0x07];
    const parsed = fromBinary(NumericMatrixSchema, Uint8Array.from([...originalBytes, ...unknownFieldBytes]));
    const values = protoToFormValues(NumericMatrixSchema, parsed);

    values["int32Value"] = 2;
    const edited = formValuesToProto(NumericMatrixSchema, values, parsed);
    const editedBytes = toBinary(NumericMatrixSchema, edited);

    expect(edited.int32Value).toBe(2);
    expect(edited.$unknown).toEqual(parsed.$unknown);
    expect(Array.from(editedBytes.slice(-unknownFieldBytes.length))).toEqual(unknownFieldBytes);
  });

  it("round-trips explicit and implicit boolean values", async () => {
    const schema = createProtoFormSchema(NumericMatrixSchema);
    const implicit = await schema["~standard"].validate({});
    const explicit = await schema["~standard"].validate({ enabled: true });

    expect(implicit).toMatchObject({ value: { enabled: false } });
    expect(explicit).toMatchObject({ value: { enabled: true } });
    if (!("value" in explicit)) {
      throw new Error("Expected the boolean matrix to validate.");
    }
    expect(protoToFormValues(NumericMatrixSchema, explicit.value)).toMatchObject({ enabled: true });
  });

  it("enforces signed 32-bit boundaries across int32, sint32, and sfixed32", async () => {
    const schema = createProtoFormSchema(NumericMatrixSchema);
    const valid = await schema["~standard"].validate({
      int32Value: -2_147_483_648,
      sfixed32Value: 2_147_483_647,
      sint32Value: -2_147_483_648,
    });

    expect(valid.issues).toBeUndefined();

    const invalidCases = [
      ["int32Value", 2_147_483_648],
      ["sint32Value", -2_147_483_649],
      ["sfixed32Value", 1.5],
    ] as const;
    const invalidResults = await Promise.all(
      invalidCases.map(async ([field, value]) => ({
        field,
        result: await schema["~standard"].validate({ [field]: value }),
        value,
      }))
    );
    for (const { field, result, value } of invalidResults) {
      expect(issuePaths(result.issues), `${field} accepted ${value}`).toEqual([[field]]);
    }
  });

  it("enforces unsigned 32-bit boundaries across uint32 and fixed32", async () => {
    const schema = createProtoFormSchema(NumericMatrixSchema);
    const valid = await schema["~standard"].validate({
      fixed32Value: 4_294_967_295,
      uint32Value: 0,
    });

    expect(valid.issues).toBeUndefined();

    const invalidCases = [
      ["uint32Value", -1],
      ["fixed32Value", 4_294_967_296],
      ["uint32Value", 1.5],
    ] as const;
    const invalidResults = await Promise.all(
      invalidCases.map(async ([field, value]) => ({
        field,
        result: await schema["~standard"].validate({ [field]: value }),
        value,
      }))
    );
    for (const { field, result, value } of invalidResults) {
      expect(issuePaths(result.issues), `${field} accepted ${value}`).toEqual([[field]]);
    }
  });

  it("enforces signed and unsigned boundaries for other 64-bit integer families", async () => {
    const schema = createProtoFormSchema(NumericMatrixSchema);
    const valid = await schema["~standard"].validate({
      fixed64Value: "18446744073709551615",
      sfixed64Value: "9223372036854775807",
      sint64Value: "-9223372036854775808",
    });

    expect(valid).toMatchObject({
      value: {
        fixed64Value: 18_446_744_073_709_551_615n,
        sfixed64Value: 9_223_372_036_854_775_807n,
        sint64Value: -9_223_372_036_854_775_808n,
      },
    });

    const invalidCases = [
      ["sint64Value", "9223372036854775808"],
      ["sfixed64Value", "-9223372036854775809"],
      ["fixed64Value", "18446744073709551616"],
      ["sint64Value", 1.5],
    ] as const;
    const invalidResults = await Promise.all(
      invalidCases.map(async ([field, value]) => ({
        field,
        result: await schema["~standard"].validate({ [field]: value }),
        value,
      }))
    );
    for (const { field, result, value } of invalidResults) {
      expect(issuePaths(result.issues), `${field} accepted ${value}`).toEqual([[field]]);
    }
  });

  it("round-trips float and double decimals, negative zero, NaN, and infinities", async () => {
    const schema = createProtoFormSchema(NumericMatrixSchema);
    const decimals = await schema["~standard"].validate({
      doubleValue: -0,
      floatValue: 1.25,
    });
    const specials = await schema["~standard"].validate({
      doubleValue: "-Infinity",
      floatValue: "NaN",
    });

    expect(decimals.issues).toBeUndefined();
    expect(specials.issues).toBeUndefined();
    if (!("value" in decimals && "value" in specials)) {
      throw new Error("Expected float and double values to validate.");
    }
    expect(decimals.value.floatValue).toBeCloseTo(1.25);
    expect(Object.is(decimals.value.doubleValue, -0)).toBe(true);
    expect(Number.isNaN(specials.value.floatValue)).toBe(true);
    expect(specials.value.doubleValue).toBe(Number.NEGATIVE_INFINITY);
    expect(protoToFormValues(NumericMatrixSchema, specials.value)).toMatchObject({
      doubleValue: Number.NEGATIVE_INFINITY,
    });
  });
});

describe("Protobuf collection conformance", () => {
  it("round-trips the repeated scalar, bytes, enum, 64-bit, float, and double matrix", async () => {
    const schema = createProtoFormSchema(CollectionMatrixSchema);
    const result = await schema["~standard"].validate({
      amounts: [3.5, "Infinity"],
      blobs: ["AQID", "BAU="],
      flags: [true, false],
      identifiers: ["-9223372036854775808", "9223372036854775807"],
      ratios: [1.25, "NaN"],
      statuses: [1, 2],
    });

    expect(result.issues).toBeUndefined();
    if (!("value" in result)) {
      throw new Error("Expected the repeated scalar matrix to validate.");
    }
    expect(result.value.flags).toEqual([true, false]);
    expect(result.value.blobs.map((value) => Array.from(value))).toEqual([
      [1, 2, 3],
      [4, 5],
    ]);
    expect(result.value.identifiers).toEqual([-9_223_372_036_854_775_808n, 9_223_372_036_854_775_807n]);
    expect(Number.isNaN(result.value.ratios[1])).toBe(true);
    expect(result.value.amounts[1]).toBe(Number.POSITIVE_INFINITY);
    expect(protoToFormValues(CollectionMatrixSchema, result.value)).toMatchObject({
      blobs: ["AQID", "BAU="],
      identifiers: ["-9223372036854775808", "9223372036854775807"],
    });
  });

  it("round-trips repeated messages and preserves indexed validation paths after removal", async () => {
    const schema = createProtoFormSchema(CollectionMatrixSchema);
    const valid = await schema["~standard"].validate({
      children: [{ name: "one" }, { name: "two" }],
    });
    const twoInvalid = await schema["~standard"].validate({
      children: [{ name: "" }, { name: "" }],
    });
    const afterRemoval = await schema["~standard"].validate({
      children: [{ name: "" }],
    });

    expect(valid).toMatchObject({
      value: { children: [{ name: "one" }, { name: "two" }] },
    });
    expect(issuePaths(twoInvalid.issues)).toEqual([
      ["children", "0", "name"],
      ["children", "1", "name"],
    ]);
    expect(issuePaths(afterRemoval.issues)).toEqual([["children", "0", "name"]]);
  });

  it("round-trips every legal boolean and integer map key type", async () => {
    const schema = createProtoFormSchema(CollectionMatrixSchema);
    const result = await schema["~standard"].validate({
      boolKeys: [
        { key: true, value: "yes" },
        { key: false, value: "no" },
      ],
      fixed32Keys: [{ key: 4_294_967_295, value: "max" }],
      fixed64Keys: [{ key: "18446744073709551615", value: "max" }],
      int32Keys: [{ key: -2_147_483_648, value: "min" }],
      int64Keys: [{ key: "-9223372036854775808", value: "min" }],
      sfixed32Keys: [{ key: -2_147_483_648, value: "min" }],
      sfixed64Keys: [{ key: "-9223372036854775808", value: "min" }],
      sint32Keys: [{ key: -1, value: "negative" }],
      sint64Keys: [{ key: "-1", value: "negative" }],
      uint32Keys: [{ key: 4_294_967_295, value: "max" }],
      uint64Keys: [{ key: "18446744073709551615", value: "max" }],
    });

    expect(result.issues).toBeUndefined();
    if (!("value" in result)) {
      throw new Error("Expected the map key matrix to validate.");
    }
    expect(result.value.boolKeys).toEqual({ false: "no", true: "yes" });
    expect(result.value.int64Keys).toEqual({
      "-9223372036854775808": "min",
    });

    const formValues = protoToFormValues(CollectionMatrixSchema, result.value);
    expect(formValues["boolKeys"]).toEqual(
      expect.arrayContaining([
        { key: false, value: "no" },
        { key: true, value: "yes" },
      ])
    );
    expect(formValues["int32Keys"]).toEqual([{ key: -2_147_483_648, value: "min" }]);
    expect(formValues["uint64Keys"]).toEqual([{ key: "18446744073709551615", value: "max" }]);
  });
});

describe("Protobuf presence and well-known-type conformance", () => {
  it("distinguishes explicit presence while documenting implicit scalar loss", async () => {
    const presenceSchema = createProtoFormSchema(PresenceMatrixSchema);
    const numericSchema = createProtoFormSchema(NumericMatrixSchema);
    const unset = await presenceSchema["~standard"].validate({});
    const explicit = await presenceSchema["~standard"].validate({
      child: { name: "present" },
      optionalEnabled: false,
      selection: { case: "approved", value: false },
    });
    const implicitUnset = await numericSchema["~standard"].validate({});
    const implicitDefault = await numericSchema["~standard"].validate({
      enabled: false,
    });

    expect(unset).toMatchObject({ value: { selection: { case: undefined } } });
    if (!("value" in unset)) {
      throw new Error("Expected the unset presence matrix to validate.");
    }
    expect(unset.value).not.toHaveProperty("child");
    expect(unset.value).not.toHaveProperty("optionalEnabled");
    expect(explicit).toMatchObject({
      value: {
        child: { name: "present" },
        optionalEnabled: false,
        selection: { case: "approved", value: false },
      },
    });
    expect(implicitUnset).toMatchObject({ value: { enabled: false } });
    expect(implicitDefault).toMatchObject({ value: { enabled: false } });
  });

  it("round-trips every remaining scalar wrapper with unset and default values", async () => {
    const schema = createProtoFormSchema(PresenceMatrixSchema);
    const unset = await schema["~standard"].validate({});
    const defaults = await schema["~standard"].validate({
      bytesWrapper: "",
      doubleWrapper: 0,
      floatWrapper: -0,
      int64Wrapper: "0",
      uint32Wrapper: 0,
      uint64Wrapper: "0",
    });

    expect(unset.issues).toBeUndefined();
    if (!("value" in unset)) {
      throw new Error("Expected the unset wrapper matrix to validate.");
    }
    for (const field of [
      "bytesWrapper",
      "doubleWrapper",
      "floatWrapper",
      "int64Wrapper",
      "uint32Wrapper",
      "uint64Wrapper",
    ]) {
      expect(unset.value).not.toHaveProperty(field);
    }
    expect(defaults.issues).toBeUndefined();
    if (!("value" in defaults)) {
      throw new Error("Expected the wrapper matrix to validate.");
    }
    expect(defaults.value).toMatchObject({
      bytesWrapper: new Uint8Array(),
      doubleWrapper: 0,
      int64Wrapper: 0n,
      uint32Wrapper: 0,
      uint64Wrapper: 0n,
    });
    expect(Object.is(defaults.value.floatWrapper, -0)).toBe(true);
    expect(protoToFormValues(PresenceMatrixSchema, defaults.value)).toMatchObject({
      bytesWrapper: "",
      int64Wrapper: "0",
      uint64Wrapper: "0",
    });
  });

  it("round-trips Any bytes, rejects malformed base64, and supports registered unpacking", async () => {
    const schema = createProtoFormSchema(AnyMatrixSchema);
    const struct = fromJson(StructSchema, { enabled: true });
    const packed = anyPack(StructSchema, struct);
    const valueBase64 = base64Encode(packed.value);
    const result = await schema["~standard"].validate({
      allowedPayload: { typeUrl: packed.typeUrl, valueBase64 },
    });
    const malformed = await schema["~standard"].validate({
      allowedPayload: {
        typeUrl: packed.typeUrl,
        valueBase64: "not base64!",
      },
    });

    expect(result.issues).toBeUndefined();
    if (!("value" in result && result.value.allowedPayload)) {
      throw new Error("Expected the Any payload to validate.");
    }
    expect(protoToFormValues(AnyMatrixSchema, result.value)["allowedPayload"]).toEqual({
      typeUrl: packed.typeUrl,
      valueBase64,
    });
    expect(anyUnpack(result.value.allowedPayload, StructSchema)).toStrictEqual(struct);
    expect(issuePaths(malformed.issues)).toEqual([["allowedPayload"]]);
  });
});
