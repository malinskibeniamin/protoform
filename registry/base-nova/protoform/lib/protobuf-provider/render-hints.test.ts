import { expect } from "@rstest/core";
import {
  IntegerRulesSchema,
  ValidationMatrixSchema,
} from "../../../../../conformance/gen/protoform/conformance/v1/conformance_pb.js";
import { getFieldHints } from "../core/index.js";
import { AutoFormUiMetadataExampleSchema } from "./gen/auto-form-example_pb.js";
import { parseProtoSchema } from "./provider.js";

test("maps field and oneof annotations onto hints without empty hint objects", () => {
  const schema = parseProtoSchema(AutoFormUiMetadataExampleSchema);
  const clusterName = schema.fields.find((field) => field.key === "clusterName");
  const region = schema.fields.find((field) => field.key === "region");
  const supportContact = schema.fields.find((field) => field.key === "supportContact");

  expect(getFieldHints(clusterName ?? { key: "", required: false, type: "" })).toMatchObject({
    help: "Use the name operators will recognize in deployment and support tools.",
    placeholder: "scarlet-forest-dolphin",
    step: "basics",
  });
  const regionHints = getFieldHints(region ?? { key: "", required: false, type: "" });
  expect(regionHints?.disabledWhen?.[0]?.id).toBe("region.disabled");
  expect(regionHints?.disabledWhen?.[0]?.expression).toBe("form.provider == 0");
  expect(getFieldHints(supportContact ?? { key: "", required: false, type: "" })?.step).toBe("support");
  // A plain field with no annotations must not grow an empty hints object.
  expect(schema.fields.filter((field) => field.hints !== undefined && Object.keys(field.hints).length === 0)).toEqual(
    []
  );
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
