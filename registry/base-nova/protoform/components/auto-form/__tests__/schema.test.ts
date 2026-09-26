import { describe, expect } from "@rstest/core";

import "@/registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations";

import { AutoFormExampleSchema } from "@/registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb";
import { protoConversionOptionsFromFieldConfig, resolveSchema } from "../schema";
import { createMockProvider } from "./test-utils";

describe("resolveSchema", () => {
  test("maps per-field repeated-string policies to descriptor paths", () => {
    expect(
      protoConversionOptionsFromFieldConfig({
        aliases: { emptyRepeatedStringPolicy: "preserve" },
        name: {},
        "settings.labels": { emptyRepeatedStringPolicy: "discard" },
      })
    ).toEqual({
      emptyRepeatedStringPolicies: {
        aliases: "preserve",
        "settings.labels": "discard",
      },
    });
  });
  test("throws for unsupported input types", () => {
    expect(() => resolveSchema("not a schema" as never)).toThrow("Unsupported AutoForm schema input");
    expect(() => resolveSchema(42 as never)).toThrow("Unsupported");
    expect(() => resolveSchema({ random: "object" } as never)).toThrow("Unsupported");
  });

  test("resolves a SchemaProvider and a proto descriptor", () => {
    const provider = createMockProvider([{ key: "name", required: true, type: "string" }]);

    const resolved = resolveSchema(provider);
    expect(resolved.provider).toBe(provider);
    expect(resolved.parsedSchema.fields).toHaveLength(1);
    expect(resolved.isProto).toBe(false);
    expect(resolved.protoDesc).toBeUndefined();

    // Proto descriptors resolve without coupling the shared schema seam to an engine.
    const proto = resolveSchema(AutoFormExampleSchema);
    expect(proto.isProto).toBe(true);
    expect(proto.protoDesc).toBe(AutoFormExampleSchema);
    expect(proto).not.toHaveProperty("resolver");
    expect(proto.parsedSchema.fields.length).toBeGreaterThan(0);
  });
});
