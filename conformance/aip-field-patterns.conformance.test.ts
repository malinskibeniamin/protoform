// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  createProtoFormSchema,
  parseProtoSchema,
} from "../registry/base-nova/protoform/lib/protobuf-provider/index.js";
import { ProvisionCapacityRequestSchema, TimeRangeSchema } from "./gen/protoform/conformance/v1/aip_pb.js";

function field(schema: ReturnType<typeof parseProtoSchema>, key: string) {
  const match = schema.fields.find((candidate) => candidate.key === key);
  if (!match) {
    throw new Error(`Missing ${key}.`);
  }
  return match;
}

async function expectValid(values: Record<string, unknown>): Promise<void> {
  const result = await createProtoFormSchema(ProvisionCapacityRequestSchema)["~standard"].validate(values);
  expect(result.issues).toBeUndefined();
}

async function expectInvalid(values: Record<string, unknown>, path: string): Promise<void> {
  const result = await createProtoFormSchema(ProvisionCapacityRequestSchema)["~standard"].validate(values);
  expect(result.issues).toEqual(
    expect.arrayContaining([expect.objectContaining({ path: expect.arrayContaining([path]) })])
  );
}

describe("AIP field pattern conformance", () => {
  it("models AIP-141 quantities with signed numeric fields and units in field names", async () => {
    const parsed = parseProtoSchema(ProvisionCapacityRequestSchema);

    expect(field(parsed, "storageGibibytes")).toMatchObject({
      required: true,
      type: "int64",
    });
    expect(field(parsed, "replicaCount")).toMatchObject({
      required: true,
      type: "number",
    });
    await expectValid({
      currencyCode: "GBP",
      languageCode: "en-GB",
      regionCode: "GB",
      replicaCount: 3,
      storageGibibytes: "64",
      timeZone: "Europe/London",
    });
    await expectInvalid(
      {
        replicaCount: -1,
        storageGibibytes: "-1",
      },
      "storageGibibytes"
    );
  });

  it("models AIP-143 standardized codes as validated strings rather than enums", async () => {
    const parsed = parseProtoSchema(ProvisionCapacityRequestSchema);

    for (const key of ["currencyCode", "languageCode", "regionCode", "timeZone"]) {
      expect(field(parsed, key).type).toBe("string");
    }
    await expectValid({
      currencyCode: "gbp",
      languageCode: "zh-Hant-TW",
      regionCode: "gb",
      replicaCount: 1,
      storageGibibytes: "1",
      timeZone: "America/Argentina/Buenos_Aires",
    });
    await expectInvalid({ currencyCode: "Pounds sterling" }, "currencyCode");
    await expectInvalid({ languageCode: "not_a_language" }, "languageCode");
    await expectInvalid({ regionCode: "United Kingdom" }, "regionCode");
    await expectInvalid({ timeZone: "London" }, "timeZone");
  });

  it("validates AIP-145 inclusive-start, exclusive-end ranges and open bounds", async () => {
    const schema = createProtoFormSchema(TimeRangeSchema);

    const validResults = await Promise.all(
      [
        {},
        { startTime: "2026-01-01T00:00:00Z" },
        { endTime: "2026-01-02T00:00:00Z" },
        {
          endTime: "2026-01-02T00:00:00Z",
          startTime: "2026-01-01T00:00:00Z",
        },
      ].map((values) => schema["~standard"].validate(values))
    );
    for (const result of validResults) {
      expect(result.issues).toBeUndefined();
    }

    const invalidResults = await Promise.all(
      [
        {
          endTime: "2026-01-01T00:00:00Z",
          startTime: "2026-01-01T00:00:00Z",
        },
        {
          endTime: "2025-12-31T00:00:00Z",
          startTime: "2026-01-01T00:00:00Z",
        },
      ].map((values) => schema["~standard"].validate(values))
    );
    for (const result of invalidResults) {
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: "end time must be later than start time",
          }),
        ])
      );
    }
  });
});
