import { page } from "@rstest/browser";
import { render } from "@rstest/browser-react";
import { expect, test } from "@rstest/core";
import { SimpleMultiSelect } from "@/components/ui/multi-select";
import { AutoForm } from "..";
import type { ParsedField, SchemaProvider } from "../core-types";
import { AutoFormFieldComponentRegistry } from "../fields/index";
import { getAutoFormFieldTestId } from "../test-ids";

const simpleProvider: SchemaProvider = {
  getDefaultValues: () => ({
    email: "hello@protoform.dev",
    newsletter: true,
    notes: "Generated from a schema provider.",
  }),
  parseSchema: () => ({
    fields: [
      { fieldConfig: { label: "Work email" }, key: "email", required: true, type: "string" },
      { fieldConfig: { label: "Subscribe" }, key: "newsletter", required: false, type: "boolean" },
      {
        fieldConfig: { description: "A short textarea rendered through the shadcn input stack.", label: "Notes" },
        key: "notes",
        required: false,
        type: "string",
      },
    ],
  }),
  validateSchema: (values) => ({ data: values, success: true }),
};

const selectOptions: ParsedField["options"] = [
  ["active", "Active"],
  ["paused", "Paused"],
];

function matrixField(
  key: string,
  fieldType: string,
  type: ParsedField["type"],
  extra: Partial<ParsedField> = {}
): ParsedField {
  return {
    fieldConfig: { fieldType, label: fieldType },
    key,
    required: false,
    type,
    ...extra,
  };
}

const fieldMatrix: ParsedField[] = [
  matrixField("boolean", "boolean", "boolean"),
  matrixField("bytes", "bytes", "bytes"),
  matrixField("checkbox", "checkbox", "boolean"),
  matrixField("choicebox", "choicebox", "select", { options: selectOptions }),
  matrixField("combobox", "combobox", "select", { options: selectOptions }),
  matrixField("currency", "currency", "number"),
  matrixField("dataProviderMultiSelect", "dataProviderMultiSelect", "array", {
    schema: [
      {
        fieldConfig: { customData: { dataProvider: "statuses" } },
        key: "0",
        options: selectOptions,
        required: false,
        type: "select",
      },
    ],
  }),
  matrixField("dataProviderSelect", "dataProviderSelect", "select", {
    fieldConfig: {
      customData: { dataProvider: "statuses" },
      fieldType: "dataProviderSelect",
      label: "dataProviderSelect",
    },
    options: selectOptions,
  }),
  matrixField("date", "date", "timestamp"),
  matrixField("dropzoneJson", "dropzone-json", "json"),
  matrixField("duration", "duration", "duration"),
  matrixField("email", "email", "string"),
  matrixField("fieldMask", "fieldMask", "fieldMask"),
  matrixField("int64", "int64", "int64"),
  matrixField("json", "json", "json"),
  matrixField("keyValue", "keyValue", "map", {
    schema: [
      { key: "key", required: true, type: "string" },
      { key: "value", required: false, type: "string" },
    ],
  }),
  matrixField("multiselect", "multiselect", "array", {
    schema: [{ key: "0", options: selectOptions, required: false, type: "select" }],
  }),
  matrixField("number", "number", "number"),
  matrixField("password", "password", "string"),
  matrixField("radio", "radio", "select", { options: selectOptions }),
  matrixField("select", "select", "select", { options: selectOptions }),
  matrixField("slider", "slider", "number", {
    fieldConfig: { fieldType: "slider", inputProps: { max: 10, min: 0 }, label: "slider" },
  }),
  matrixField("string", "string", "string"),
  matrixField("switch", "switch", "boolean"),
  matrixField("textarea", "textarea", "string"),
  matrixField("timestamp", "timestamp", "timestamp"),
  matrixField("toggle", "toggle", "boolean"),
  matrixField("toggleGroup", "toggleGroup", "select", { options: selectOptions }),
  matrixField("url", "url", "string"),
];

const structuralFieldMatrix: ParsedField[] = [
  matrixField("arrayRenderer", "array", "array", {
    schema: [{ key: "0", required: false, type: "string" }],
  }),
  matrixField("mapRenderer", "map", "map", {
    schema: [
      { key: "key", required: true, type: "string" },
      { key: "value", required: false, type: "string" },
    ],
  }),
  matrixField("objectRenderer", "object", "object", {
    schema: [{ key: "name", required: false, type: "string" }],
  }),
  matrixField("oneofRenderer", "oneof", "oneof", {
    schema: [
      { fieldConfig: { label: "Email" }, key: "email", required: false, type: "email" },
      { fieldConfig: { label: "Phone" }, key: "phone", required: false, type: "string" },
    ],
  }),
];

const allMatrixFields = [...fieldMatrix, ...structuralFieldMatrix];

const matrixDefaults: Record<string, unknown> = {
  arrayRenderer: ["first"],
  boolean: true,
  bytes: "AQID",
  checkbox: true,
  choicebox: "active",
  combobox: "active",
  currency: 12.5,
  dataProviderMultiSelect: ["active"],
  dataProviderSelect: "active",
  date: "2026-09-02",
  dropzoneJson: { enabled: true },
  duration: "300s",
  email: "hello@protoform.dev",
  fieldMask: ["display_name"],
  int64: "42",
  json: { enabled: true },
  keyValue: { environment: "production" },
  mapRenderer: { environment: "production" },
  multiselect: ["active"],
  number: 4,
  objectRenderer: { name: "Protoform" },
  oneofRenderer: { case: "email", value: "hello@protoform.dev" },
  password: "correct horse battery staple",
  radio: "active",
  select: "active",
  slider: 5,
  string: "Protoform",
  switch: true,
  textarea: "Registry adapter",
  timestamp: "2026-09-02T10:30",
  toggle: true,
  toggleGroup: "active",
  url: "https://protoform.dev",
};

const matrixProvider: SchemaProvider = {
  getDefaultValues: () => matrixDefaults,
  parseSchema: () => ({ fields: allMatrixFields }),
  validateSchema: (values) => ({ data: values, success: true }),
};

test("renders a simple shadcn-native auto form in a browser", async () => {
  await render(
    <>
      <style>{'[data-testid="browser-simple-form"] textarea { resize: none; }'}</style>
      <main className="max-w-2xl bg-background p-6 text-foreground">
        <AutoForm schema={simpleProvider} testId="browser-simple-form" withSubmit />
      </main>
    </>
  );

  const form = page.getByTestId("browser-simple-form");
  await expect.element(form).toBeVisible();
});

test("renders labels for controlled enum selections on first paint", async () => {
  await render(
    <SimpleMultiSelect
      options={[
        { label: "Active", value: "1" },
        { label: "Paused", value: "2" },
      ]}
      testId="enum-statuses"
      value={["1", "2"]}
    />
  );

  await expect.element(page.getByTestId("enum-statuses-selected-1")).toHaveText("Active");
  await expect.element(page.getByTestId("enum-statuses-selected-2")).toHaveText("Paused");
});

test("renders every built-in field type through the configured UI alias", async () => {
  const registeredFieldTypes = Object.keys(AutoFormFieldComponentRegistry)
    .filter((fieldType) => fieldType !== "fallback")
    .sort((first, second) => first.localeCompare(second));
  const matrixFieldTypes = fieldMatrix
    .map((field) => String(field.fieldConfig?.fieldType))
    .sort((first, second) => first.localeCompare(second));

  expect(matrixFieldTypes).toEqual(registeredFieldTypes);

  await render(
    <main className="max-w-2xl bg-background p-6 text-foreground">
      <AutoForm
        dataProviders={{
          statuses: {
            useProvider: () => ({
              options: [
                { label: "Active", value: "active" },
                { label: "Paused", value: "paused" },
              ],
            }),
          },
        }}
        formComponents={{
          fallback: () => <div data-testid="browser-field-matrix-fallback">Missing field component</div>,
        }}
        schema={matrixProvider}
        testId="browser-field-matrix"
      />
    </main>
  );

  const renderedTestIds = new Set(
    [...document.querySelectorAll<HTMLElement>("[data-testid]")].map((element) => element.getAttribute("data-testid"))
  );
  for (const field of fieldMatrix) {
    expect(renderedTestIds.has(getAutoFormFieldTestId("browser-field-matrix", field.key)), field.key).toBe(true);
  }
  const structuralTestIds = [
    getAutoFormFieldTestId("browser-field-matrix", "arrayRenderer", "items"),
    getAutoFormFieldTestId("browser-field-matrix", "mapRenderer", "items"),
    getAutoFormFieldTestId("browser-field-matrix", ["objectRenderer", "name"]),
    getAutoFormFieldTestId("browser-field-matrix", "oneofRenderer"),
  ];
  for (const testId of structuralTestIds) {
    expect(renderedTestIds.has(testId), testId).toBe(true);
  }
  expect(document.querySelector('[data-testid="browser-field-matrix-fallback"]')).toBeNull();
});
