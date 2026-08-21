// @vitest-environment node

import { create } from "@bufbuild/protobuf";
import { createValidator } from "@bufbuild/protovalidate";
import { describe, expect, it } from "vitest";

import { createProtoFormSchema, ProtoProvider } from "../registry/base-nova/protoform/lib/protobuf-provider/index.js";
import { CelRuleMatrixSchema } from "./gen/protoform/conformance/v1/conformance_pb.js";
import {
  InvalidCelCompileSchema,
  InvalidCelRuntimeSchema,
  InvalidCelTypeSchema,
  InvalidCelUnknownSchema,
} from "./gen/protoform/conformance/v1/expected_failures_pb.js";
import { TransitiveCelConsumerSchema } from "./gen/protoform/conformance/v1/transitive_cel_pb.js";

const validForm = {
  booleanValue: "ok",
  child: { name: "child-primary" },
  children: [{ name: "child-one" }, { name: "child-two" }],
  messageValue: "ok",
  secondMessageValue: "ok",
  stringValue: "ok",
};

function paths(
  issues:
    | readonly {
        path?: readonly (PropertyKey | { key: PropertyKey })[] | undefined;
      }[]
    | undefined
): string[][] {
  return (issues ?? []).map((issue) =>
    (issue.path ?? []).map((segment) =>
      String(typeof segment === "object" && segment !== null && "key" in segment ? segment.key : segment)
    )
  );
}

describe("CEL validation conformance", () => {
  it("resolves transitive imported and nested enum symbols through Standard Schema", async () => {
    const schema = createProtoFormSchema(TransitiveCelConsumerSchema);

    const valid = await schema["~standard"].validate({
      deployment: { environment: 20, releaseTrack: 7 },
    });
    const invalid = await schema["~standard"].validate({
      deployment: { environment: 10, releaseTrack: 9 },
    });

    expect(valid.issues).toBeUndefined();
    expect(invalid.issues).toEqual([
      {
        message: "Production deployments require the stable release track.",
        path: ["deployment"],
      },
    ]);
  });

  it("resolves transitive imported and nested enum symbols through ProtoProvider", () => {
    const provider = new ProtoProvider(TransitiveCelConsumerSchema);

    expect(
      provider.validateSchema({
        deployment: { environment: 20, releaseTrack: 7 },
      })
    ).toMatchObject({ success: true });
    expect(
      provider.validateSchema({
        deployment: { environment: 10, releaseTrack: 9 },
      })
    ).toEqual({
      errors: [
        {
          message: "Production deployments require the stable release track.",
          path: ["deployment"],
        },
      ],
      success: false,
    });
  });

  it("does not expose CEL runtime failures through ProtoProvider", () => {
    const provider = new ProtoProvider(InvalidCelRuntimeSchema);

    expect(provider.validateSchema({ value: 0 })).toMatchObject({
      success: true,
    });
  });

  it("preserves a field boolean CEL rule id, message, and form path", async () => {
    const message = create(CelRuleMatrixSchema, {
      ...validForm,
      booleanValue: "bad",
    });
    const validatorResult = createValidator().validate(CelRuleMatrixSchema, message);
    const standardResult = await createProtoFormSchema(CelRuleMatrixSchema)["~standard"].validate({
      ...validForm,
      booleanValue: "bad",
    });

    expect(validatorResult).toMatchObject({
      kind: "invalid",
      violations: [
        expect.objectContaining({
          message: "boolean field rule failed",
          ruleId: "cel.field.boolean",
        }),
      ],
    });
    expect(paths(standardResult.issues)).toContainEqual(["booleanValue"]);
  });

  it("preserves a dynamic field CEL error string and stable form path", async () => {
    const result = await createProtoFormSchema(CelRuleMatrixSchema)["~standard"].validate({
      ...validForm,
      stringValue: "bad",
    });

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "received bad",
          path: ["stringValue"],
        }),
      ])
    );
  });

  it("preserves nested and repeated message CEL paths including every index", async () => {
    const result = await createProtoFormSchema(CelRuleMatrixSchema)["~standard"].validate({
      ...validForm,
      child: { name: "bad" },
      children: [{ name: "bad-one" }, { name: "bad-two" }],
    });

    expect(paths(result.issues)).toEqual(expect.arrayContaining([["child"], ["children", "0"], ["children", "1"]]));
  });

  it("returns every message and field CEL violation without dropping any", async () => {
    const result = await createProtoFormSchema(CelRuleMatrixSchema)["~standard"].validate({
      ...validForm,
      booleanValue: "bad",
      messageValue: "bad",
      secondMessageValue: "bad",
      stringValue: "bad",
    });
    const messages = (result.issues ?? []).map((issue) => issue.message);

    expect(messages).toEqual(
      expect.arrayContaining([
        "boolean field rule failed",
        "received bad",
        "first message rule failed",
        "second message rule failed",
      ])
    );
    expect(result.issues).toHaveLength(4);
  });

  it("returns a safe root issue for a CEL compile error", async () => {
    const result = await createProtoFormSchema(InvalidCelCompileSchema)["~standard"].validate({ value: 1 });

    expect(paths(result.issues)).toEqual([[]]);
    expect(result.issues?.[0]?.message).toBeTruthy();
  });

  it.each([
    ["wrong result type", InvalidCelTypeSchema, 1],
    ["unknown field", InvalidCelUnknownSchema, 1],
    ["evaluation error", InvalidCelRuntimeSchema, 0],
  ] as const)(
    "does not expose a CEL runtime failure for %s as a form validation issue",
    async (_name, schema, value) => {
      const result = await createProtoFormSchema(schema)["~standard"].validate({
        value,
      });

      expect(result.issues).toBeUndefined();
      if (!("value" in result)) {
        throw new Error(`Expected ${_name} to produce valid form values.`);
      }
      expect(result.value).toMatchObject({ value });
    }
  );
});
