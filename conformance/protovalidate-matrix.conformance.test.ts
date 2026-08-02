// @vitest-environment node

import { fromJson } from "@bufbuild/protobuf";
import { base64Encode } from "@bufbuild/protobuf/wire";
import { anyPack, StructSchema, ValueSchema } from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "vitest";

import { createProtoFormSchema } from "../registry/base-nova/protoform/lib/protobuf-provider/index.js";
import {
  AnyMatrixSchema,
  ValidationMatrixSchema,
} from "./gen/protoform/conformance/v1/conformance_pb.js";

type FormInput = Record<string, unknown>;

const validValidationInput: FormInput = {
  allowedStatus: 2,
  allowedText: "alpha",
  blockedStatus: 1,
  blockedText: "safe",
  byteLength: "éé",
  children: [{ name: "same" }, { name: "same" }],
  codePointLength: "éé",
  constStatus: 1,
  containingText: "has-middle-value",
  definedStatus: 1,
  email: "forms@protoform.dev",
  exactText: "protoform",
  labels: [{ key: "team", value: "forms" }],
  mustBeFalse: false,
  mustBeTrue: true,
  patternedText: "lowercase",
  prefixedText: "pre-value",
  suffixedText: "value-post",
  tags: ["forms"],
  tuuid: "123e4567e89b12d3a456426614174000",
  uuid: "123e4567-e89b-12d3-a456-426614174000",
};

function issuePaths(
  issues:
    | readonly {
        path?: readonly (PropertyKey | { key: PropertyKey })[];
      }[]
    | undefined
): string[][] | undefined {
  return issues?.map((issue) =>
    (issue.path ?? []).map((segment) =>
      String(
        typeof segment === "object" && segment !== null && "key" in segment
          ? segment.key
          : segment
      )
    )
  );
}

describe("Protovalidate scalar rule conformance", () => {
  it("enforces bool const for true, false, and the implicit default", async () => {
    const schema = createProtoFormSchema(ValidationMatrixSchema);

    const invalidCases = [
      [{ ...validValidationInput, mustBeTrue: false }, "mustBeTrue"],
      [{ ...validValidationInput, mustBeFalse: true }, "mustBeFalse"],
      [
        Object.fromEntries(
          Object.entries(validValidationInput).filter(
            ([key]) => key !== "mustBeTrue"
          )
        ),
        "mustBeTrue",
      ],
    ] as const;
    const invalidResults = await Promise.all(
      invalidCases.map(async ([input, field]) => ({
        field,
        result: await schema["~standard"].validate(input),
      }))
    );
    for (const { field, result } of invalidResults) {
      expect(issuePaths(result.issues)).toContainEqual([field]);
    }
  });

  it("enforces string const, code-point and byte lengths, pattern, affixes, contains, and membership", async () => {
    const schema = createProtoFormSchema(ValidationMatrixSchema);
    const invalidCases = [
      ["exactText", "wrong"],
      ["codePointLength", "a"],
      ["codePointLength", "abcde"],
      ["byteLength", "é"],
      ["byteLength", "ééééé"],
      ["patternedText", "UPPER"],
      ["prefixedText", "value"],
      ["suffixedText", "value"],
      ["containingText", "value"],
      ["allowedText", "gamma"],
      ["blockedText", "blocked"],
    ] as const;

    const invalidResults = await Promise.all(
      invalidCases.map(async ([field, value]) => ({
        field,
        result: await schema["~standard"].validate({
          ...validValidationInput,
          [field]: value,
        }),
        value,
      }))
    );
    for (const { field, result, value } of invalidResults) {
      expect(
        issuePaths(result.issues),
        `${field} accepted ${value}`
      ).toContainEqual([field]);
    }
  });

  it("validates UUID and trimmed UUID forms without rewriting accepted case", async () => {
    const schema = createProtoFormSchema(ValidationMatrixSchema);
    const uppercaseUuid = "123E4567-E89B-12D3-A456-426614174000";
    const valid = await schema["~standard"].validate({
      ...validValidationInput,
      uuid: uppercaseUuid,
    });

    expect(valid).toMatchObject({ value: { uuid: uppercaseUuid } });

    const invalidCases = [
      ["uuid", "123e4567e89b12d3a456426614174000"],
      ["tuuid", "123e4567-e89b-12d3-a456-426614174000"],
      ["uuid", "not-a-uuid"],
      ["tuuid", "not-a-tuuid"],
    ] as const;
    const invalidResults = await Promise.all(
      invalidCases.map(async ([field, value]) => ({
        field,
        result: await schema["~standard"].validate({
          ...validValidationInput,
          [field]: value,
        }),
      }))
    );
    for (const { field, result } of invalidResults) {
      expect(issuePaths(result.issues)).toContainEqual([field]);
    }
  });

  it("enforces enum const, defined-only, allow and deny lists, aliases, and unknown values", async () => {
    const schema = createProtoFormSchema(ValidationMatrixSchema);
    const alias = await schema["~standard"].validate({
      ...validValidationInput,
      constStatus: 1,
      definedStatus: 1,
    });

    expect(alias).toMatchObject({
      value: { constStatus: 1, definedStatus: 1 },
    });

    const invalidCases = [
      ["constStatus", 2],
      ["definedStatus", 99],
      ["allowedStatus", 0],
      ["blockedStatus", 2],
    ] as const;
    const invalidResults = await Promise.all(
      invalidCases.map(async ([field, value]) => ({
        field,
        result: await schema["~standard"].validate({
          ...validValidationInput,
          [field]: value,
        }),
      }))
    );
    for (const { field, result } of invalidResults) {
      expect(issuePaths(result.issues)).toContainEqual([field]);
    }
  });
});

describe("Protovalidate collection and Any rule conformance", () => {
  it("enforces repeated min, max, and uniqueness while allowing duplicate messages", async () => {
    const schema = createProtoFormSchema(ValidationMatrixSchema);
    const duplicateMessages = await schema["~standard"].validate({
      ...validValidationInput,
      children: [{ name: "same" }, { name: "same" }],
    });

    expect(duplicateMessages.issues).toBeUndefined();

    const invalidResults = await Promise.all(
      [[], ["a", "b", "c", "d"], ["same", "same"]].map(async (tags) =>
        schema["~standard"].validate({
          ...validValidationInput,
          tags,
        })
      )
    );
    for (const result of invalidResults) {
      expect(issuePaths(result.issues)).toContainEqual(["tags"]);
    }
  });

  it("enforces map min and max pairs and rejects duplicate rendered keys", async () => {
    const schema = createProtoFormSchema(ValidationMatrixSchema);

    const invalidLabels = [
      [],
      [
        { key: "one", value: "1" },
        { key: "two", value: "2" },
        { key: "three", value: "3" },
      ],
      [
        { key: "same", value: "1" },
        { key: "same", value: "2" },
      ],
    ];
    const invalidResults = await Promise.all(
      invalidLabels.map(async (labels) =>
        schema["~standard"].validate({
          ...validValidationInput,
          labels,
        })
      )
    );
    for (const result of invalidResults) {
      expect(issuePaths(result.issues)).toContainEqual(["labels"]);
    }
  });

  it("enforces Any type URL allow and deny lists and rejects malformed form values", async () => {
    const schema = createProtoFormSchema(AnyMatrixSchema);
    const struct = anyPack(StructSchema, fromJson(StructSchema, { ok: true }));
    const value = anyPack(ValueSchema, fromJson(ValueSchema, "blocked"));
    const wrongAllowList = await schema["~standard"].validate({
      allowedPayload: {
        typeUrl: value.typeUrl,
        valueBase64: base64Encode(value.value),
      },
    });
    const denied = await schema["~standard"].validate({
      deniedPayload: {
        typeUrl: value.typeUrl,
        valueBase64: base64Encode(value.value),
      },
    });
    const valid = await schema["~standard"].validate({
      allowedPayload: {
        typeUrl: struct.typeUrl,
        valueBase64: base64Encode(struct.value),
      },
    });

    expect(valid.issues).toBeUndefined();
    expect(issuePaths(wrongAllowList.issues)).toEqual([["allowedPayload"]]);
    expect(issuePaths(denied.issues)).toEqual([["deniedPayload"]]);
  });
});
