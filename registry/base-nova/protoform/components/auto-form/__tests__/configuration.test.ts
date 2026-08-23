import { describe, expect, it } from "@rstest/core";

import { type AutoFormConfigurationDiagnostic, inspectAutoFormConfiguration } from "../configuration";
import { defaultRegistry } from "../fields";
import { createMockProvider } from "./test-utils";

const schema = createMockProvider([
  {
    key: "settings",
    required: true,
    schema: [
      { key: "source", required: true, type: "string" },
      { key: "count", required: false, type: "number" },
      {
        key: "tags",
        required: false,
        schema: [{ key: "value", required: true, type: "string" }],
        type: "array",
      },
      {
        key: "payload",
        required: false,
        schema: [{ key: "name", required: true, type: "string" }],
        type: "object",
      },
    ],
    type: "object",
  },
]);

describe("inspectAutoFormConfiguration", () => {
  it("returns deterministic diagnostics for every nested configuration defect", () => {
    const diagnostics = inspectAutoFormConfiguration({
      dataProviders: {},
      fieldConfig: {
        "settings.count": { emptyRepeatedStringPolicy: "preserve" },
        "settings.missing": {},
        "settings.payload": { customData: { dataProvider: "payloads" } },
        "settings.source": {
          customData: { dataProvider: "sources" },
          fieldType: "missing-renderer",
        },
      },
      fieldRegistry: defaultRegistry,
      schema,
    });

    expect(diagnostics).toEqual<AutoFormConfigurationDiagnostic[]>([
      {
        code: "unsupported-configuration",
        message: "emptyRepeatedStringPolicy is supported only on repeated string fields.",
        path: "settings.count",
        severity: "error",
      },
      {
        code: "invalid-configuration-path",
        message: 'Field configuration path "settings.missing" does not exist in the schema.',
        path: "settings.missing",
        severity: "error",
      },
      {
        code: "missing-data-provider",
        message: 'Data provider "payloads" is not registered.',
        path: "settings.payload",
        severity: "error",
      },
      {
        code: "unsupported-configuration",
        message: "Data providers are supported only on scalar string or number fields.",
        path: "settings.payload",
        severity: "error",
      },
      {
        code: "missing-data-provider",
        message: 'Data provider "sources" is not registered.',
        path: "settings.source",
        severity: "error",
      },
      {
        code: "missing-renderer",
        message: 'Renderer "missing-renderer" is not registered.',
        path: "settings.source",
        severity: "error",
      },
    ]);
  });

  it("accepts registered renderers, providers, and supported nested configuration", () => {
    const CustomRenderer = () => null;
    const fieldRegistry = defaultRegistry.clone().register({
      component: CustomRenderer,
      match: (field) => field.key === "source",
      name: "code",
      priority: 1000,
    });

    expect(
      inspectAutoFormConfiguration({
        dataProviders: { sources: () => ({ options: [] }) },
        fieldConfig: {
          "settings.source": {
            customData: { dataProvider: "sources" },
            fieldType: "code",
          },
          "settings.tags": { emptyRepeatedStringPolicy: "preserve" },
        },
        fieldRegistry,
        schema,
      })
    ).toEqual([]);
  });

  it("reports incompatible built-in controls", () => {
    expect(
      inspectAutoFormConfiguration({
        fieldConfig: {
          "settings.source": { fieldType: "slider" },
        },
        schema,
      })
    ).toContainEqual({
      code: "incompatible-control",
      message: 'Renderer "slider" is incompatible with field type "string".',
      path: "settings.source",
      severity: "error",
    });
  });

  it("reports broken step configuration and unsupported schema shapes instead of throwing", () => {
    const brokenSchema = {
      getDefaultValues: () => ({}),
      parseSchema: () => {
        throw new TypeError("Unsupported descriptor shape.");
      },
      validateSchema: () => ({ data: {}, success: true as const }),
    };

    expect(
      inspectAutoFormConfiguration({
        schema,
        stepper: {
          steps: [
            { id: "details", title: "Details" },
            { id: "details", title: "Review" },
          ],
        },
      })
    ).toContainEqual(
      expect.objectContaining({
        code: "invalid-step-configuration",
        path: "$",
        severity: "error",
      })
    );

    expect(inspectAutoFormConfiguration({ schema: brokenSchema })).toContainEqual(
      expect.objectContaining({
        cause: expect.any(TypeError),
        code: "unsupported-schema",
        path: "$",
      })
    );
  });

  it("reports unknown default and field step references", () => {
    const stepSchema = createMockProvider([
      { hints: { step: "missing" }, key: "name", required: true, type: "string" },
    ]);

    expect(
      inspectAutoFormConfiguration({
        schema: stepSchema,
        stepper: {
          defaultStep: "missing",
          steps: [
            { id: "details", title: "Details" },
            { id: "confirm", title: "Confirm" },
          ],
        },
      })
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid-step-configuration", path: "$" }),
        expect.objectContaining({ code: "invalid-step-configuration", path: "name" }),
      ])
    );
  });
});
