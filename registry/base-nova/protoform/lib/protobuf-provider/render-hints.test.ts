import { expect, test } from "vitest";
import {
  IntegerRulesSchema,
  ValidationMatrixSchema,
} from "../../../../../conformance/gen/protoform/conformance/v1/conformance_pb.js";
import { getFieldHints } from "../core/index.js";
import { AutoFormExampleSchema, AutoFormUiMetadataExampleSchema } from "./gen/auto-form-example_pb.js";
import { parseProtoSchema } from "./provider.js";

test("provider populates first-class render hints from field_ui annotations", () => {
  const schema = parseProtoSchema(AutoFormUiMetadataExampleSchema);
  const annotated = schema.fields.filter((field) => getFieldHints(field));
  expect(annotated.length).toBeGreaterThan(0);
});

test("ui annotation values surface as schema-agnostic hints", () => {
  const schema = parseProtoSchema(AutoFormUiMetadataExampleSchema);
  const withPlaceholder = schema.fields.find((field) => getFieldHints(field)?.placeholder);
  if (!withPlaceholder) {
    throw new Error("expected at least one field with a placeholder hint");
  }
  const hints = getFieldHints(withPlaceholder);
  // The hint must mirror what the proto ui annotation carries in customData.
  const legacyUi = (withPlaceholder.fieldConfig?.customData as { ui?: { placeholder?: string } } | undefined)?.ui;
  expect(hints?.placeholder).toBe(legacyUi?.placeholder);
});

test("hints stay absent for fields without render-driving metadata", () => {
  // A plain field with no annotations must not grow an empty hints object.
  const schema = parseProtoSchema(AutoFormUiMetadataExampleSchema);
  const bare = schema.fields.filter((field) => field.hints !== undefined && Object.keys(field.hints).length === 0);
  expect(bare).toEqual([]);
});

test("specific annotation values map onto the right hint properties", () => {
  const schema = parseProtoSchema(AutoFormUiMetadataExampleSchema);
  const clusterName = schema.fields.find((field) => field.key === "clusterName");
  const region = schema.fields.find((field) => field.key === "region");

  expect(getFieldHints(clusterName ?? { key: "", required: false, type: "" })).toMatchObject({
    help: "Use the name operators will recognize in deployment and support tools.",
    placeholder: "scarlet-forest-dolphin",
  });
  const regionHints = getFieldHints(region ?? { key: "", required: false, type: "" });
  expect(regionHints?.disabledWhen?.[0]?.id).toBe("region.disabled");
  expect(regionHints?.disabledWhen?.[0]?.expression).toBe("form.provider == 0");
});

test("field and oneof step annotations become schema-agnostic hints", () => {
  const schema = parseProtoSchema(AutoFormUiMetadataExampleSchema);
  const clusterName = schema.fields.find((field) => field.key === "clusterName");
  const supportContact = schema.fields.find((field) => field.key === "supportContact");

  expect(getFieldHints(clusterName ?? { key: "", required: false, type: "" })?.step).toBe("basics");
  expect(getFieldHints(supportContact ?? { key: "", required: false, type: "" })?.step).toBe("support");
});

test("nested message fields carry their own hints", () => {
  const schema = parseProtoSchema(AutoFormExampleSchema);
  const nested = schema.fields.find((field) => field.key === "shippingAddress");
  expect(nested?.schema?.length ?? 0).toBeGreaterThan(0);
});

test("enum aliases produce one selectable option per numeric value", () => {
  const schema = parseProtoSchema(ValidationMatrixSchema);
  const enumField = schema.fields.find((field) => field.key === "constStatus");
  const optionValues = enumField?.options?.map(([value]) => value) ?? [];

  expect(optionValues.length).toBeGreaterThan(0);
  expect(new Set(optionValues).size).toBe(optionValues.length);
});

test("reversed numeric ranges do not become invalid native input bounds", () => {
  const schema = parseProtoSchema(IntegerRulesSchema);
  const reversed = schema.fields.find((field) => field.key === "int32Reversed");

  expect(reversed?.fieldConfig?.inputProps).not.toHaveProperty("min");
  expect(reversed?.fieldConfig?.inputProps).not.toHaveProperty("max");
});
