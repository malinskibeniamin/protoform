// @rstest-environment node

import { create } from "@bufbuild/protobuf";
import { DurationSchema, timestampFromDate } from "@bufbuild/protobuf/wkt";
import { createValidator } from "@bufbuild/protovalidate";
import { describe, expect, it } from "@rstest/core";

import { CelProtoLanguageMatrixSchema, MatrixStatus } from "./gen/protoform/conformance/v1/conformance_pb.js";

describe("CEL protobuf conformance", () => {
  it("evaluates protobuf messages, enums, presence, collections, bytes, and temporal values", () => {
    const message = create(CelProtoLanguageMatrixSchema, {
      child: { name: "child-primary" },
      numbers: [1, 2, 3],
      optionalValue: "present",
      payload: new TextEncoder().encode("proto"),
      scores: { primary: 3 },
      start: timestampFromDate(new Date("2025-01-01T00:00:00Z")),
      status: MatrixStatus.ACTIVE,
      window: create(DurationSchema, { seconds: 3600n }),
    });

    expect(createValidator().validate(CelProtoLanguageMatrixSchema, message)).toMatchObject({ kind: "valid" });
  });

  it("reports every protobuf CEL capability failure by stable rule id", () => {
    const result = createValidator().validate(CelProtoLanguageMatrixSchema, create(CelProtoLanguageMatrixSchema));

    expect(result.kind).toBe("invalid");
    if (result.kind !== "invalid") {
      throw new Error("Expected protobuf CEL fixture to fail.");
    }
    expect(result.violations.map((violation) => violation.ruleId)).toEqual(
      expect.arrayContaining([
        "cel.proto.messages_enums_presence",
        "cel.proto.collections",
        "cel.proto.bytes",
        "cel.proto.temporal",
      ])
    );
  });
});
