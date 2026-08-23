import type { ParsedField } from "./core-types";
import type { DataProviderRegistry } from "./data-providers";
import { AutoFormFieldComponentRegistry, defaultRegistry } from "./fields";
import { readDataProviderId } from "./fields/shared";
import { getFieldUiConfig, resolveRenderFieldType } from "./helpers";
import { buildFieldMatchContext, type FieldTypeRegistry } from "./registry";
import { mergeFieldOverrides, protoConversionOptionsFromFieldConfig, resolveSchema } from "./schema";
import { getStepConfigurationError } from "./step-configuration";
import type { AutoFormSchemaInput, AutoFormStepperConfig, FieldConfigMap } from "./types";

export type AutoFormConfigurationDiagnosticCode =
  | "incompatible-control"
  | "invalid-configuration-path"
  | "invalid-step-configuration"
  | "missing-data-provider"
  | "missing-renderer"
  | "render-error"
  | "unsupported-schema"
  | "unsupported-configuration";

export interface AutoFormDiagnostic {
  cause?: unknown;
  code: AutoFormConfigurationDiagnosticCode;
  fieldPath: string;
  message: string;
  severity: "error" | "warning";
}

export interface AutoFormConfigurationDiagnostic extends Omit<AutoFormDiagnostic, "fieldPath"> {
  path: string;
}

export interface InspectAutoFormConfigurationInput<
  T extends Record<string, unknown> = Record<string, unknown>,
  TCustomFieldType extends string = never,
> {
  dataProviders?: DataProviderRegistry;
  fieldConfig?: FieldConfigMap<TCustomFieldType>;
  fieldRegistry?: FieldTypeRegistry<string>;
  schema: AutoFormSchemaInput<T>;
  stepper?: AutoFormStepperConfig;
}

const STRUCTURAL_FIELD_TYPES = new Set(["array", "map", "object", "oneof"]);
const BUILT_IN_RENDERER_TYPES: Readonly<Record<string, readonly string[]>> = {
  boolean: ["boolean"],
  bytes: ["bytes"],
  checkbox: ["boolean"],
  choicebox: ["select"],
  combobox: ["select"],
  currency: ["string"],
  dataProviderMultiSelect: ["array"],
  dataProviderSelect: ["number", "string"],
  date: ["date"],
  "dropzone-json": ["json", "object"],
  duration: ["duration"],
  email: ["string"],
  fieldMask: ["fieldMask"],
  int64: ["int64"],
  json: ["json", "object"],
  keyValue: ["array", "map"],
  multiselect: ["array"],
  number: ["number"],
  password: ["string"],
  radio: ["select"],
  select: ["select"],
  slider: ["number"],
  string: ["string"],
  switch: ["boolean"],
  textarea: ["string"],
  timestamp: ["timestamp"],
  toggle: ["boolean"],
  toggleGroup: ["select"],
  url: ["string"],
};

function collectFields(
  fields: ParsedField[],
  path: readonly string[] = []
): Array<{ field: ParsedField; path: string }> {
  return fields.flatMap((field) => {
    const fieldPath = [...path, field.key];
    return [{ field, path: fieldPath.join(".") }, ...collectFields(field.schema ?? [], fieldPath)];
  });
}

function resolvedRenderer(field: ParsedField, registry: FieldTypeRegistry<string>): string {
  const configured = getFieldUiConfig(field).control;
  if (configured) {
    return configured;
  }
  return registry.resolve(field, buildFieldMatchContext(field))?.name ?? resolveRenderFieldType(field);
}

function hasRenderer(field: ParsedField, renderer: string, registry: FieldTypeRegistry<string>): boolean {
  if (STRUCTURAL_FIELD_TYPES.has(field.type) && renderer === field.type) {
    return true;
  }
  if (renderer !== "fallback" && Object.hasOwn(AutoFormFieldComponentRegistry, renderer)) {
    return true;
  }
  return registry.list().some((definition) => definition.name === renderer);
}

function fieldDiagnostics(
  field: ParsedField,
  path: string,
  registry: FieldTypeRegistry<string>,
  dataProviders: DataProviderRegistry | undefined
): AutoFormConfigurationDiagnostic[] {
  const diagnostics: AutoFormConfigurationDiagnostic[] = [];
  const renderer = resolvedRenderer(field, registry);
  if (!hasRenderer(field, renderer, registry)) {
    diagnostics.push({
      code: "missing-renderer",
      message: `Renderer "${renderer}" is not registered.`,
      path,
      severity: "error",
    });
  }

  const supportedFieldTypes = BUILT_IN_RENDERER_TYPES[renderer];
  if (supportedFieldTypes && !supportedFieldTypes.includes(field.type)) {
    diagnostics.push({
      code: "incompatible-control",
      message: `Renderer "${renderer}" is incompatible with field type "${field.type}".`,
      path,
      severity: "error",
    });
  }

  const dataProviderId = readDataProviderId(field);
  if (dataProviderId !== undefined) {
    if (!dataProviders?.[dataProviderId]) {
      diagnostics.push({
        code: "missing-data-provider",
        message: `Data provider "${dataProviderId}" is not registered.`,
        path,
        severity: "error",
      });
    }
    if (field.type !== "string" && field.type !== "number") {
      diagnostics.push({
        code: "unsupported-configuration",
        message: "Data providers are supported only on scalar string or number fields.",
        path,
        severity: "error",
      });
    }
  }

  if (
    field.fieldConfig?.emptyRepeatedStringPolicy &&
    !(field.type === "array" && field.schema?.[0]?.type === "string")
  ) {
    diagnostics.push({
      code: "unsupported-configuration",
      message: "emptyRepeatedStringPolicy is supported only on repeated string fields.",
      path,
      severity: "error",
    });
  }

  return diagnostics;
}

export function inspectAutoFormConfiguration<
  T extends Record<string, unknown> = Record<string, unknown>,
  TCustomFieldType extends string = never,
>({
  schema,
  fieldConfig,
  fieldRegistry,
  dataProviders,
  stepper,
}: InspectAutoFormConfigurationInput<T, TCustomFieldType>): AutoFormConfigurationDiagnostic[] {
  const stepConfigurationError = stepper ? getStepConfigurationError(stepper.steps, stepper.defaultStep) : undefined;
  const stepDiagnostic: AutoFormConfigurationDiagnostic[] = stepConfigurationError
    ? [
        {
          code: "invalid-step-configuration",
          message: stepConfigurationError,
          path: "$",
          severity: "error",
        },
      ]
    : [];

  let resolvedSchema: ReturnType<typeof resolveSchema>;
  try {
    resolvedSchema = resolveSchema(schema, protoConversionOptionsFromFieldConfig(fieldConfig));
  } catch (cause) {
    return [
      ...stepDiagnostic,
      {
        cause,
        code: "unsupported-schema",
        message: cause instanceof Error ? cause.message : "The schema could not be resolved.",
        path: "$",
        severity: "error",
      },
    ];
  }
  const fields = mergeFieldOverrides(resolvedSchema.parsedSchema.fields, fieldConfig);
  const flattenedFields = collectFields(fields);
  const validPaths = new Set(flattenedFields.map((entry) => entry.path));
  const activeRegistry = fieldRegistry ?? defaultRegistry;
  const diagnostics: AutoFormConfigurationDiagnostic[] = [...stepDiagnostic];

  for (const path of Object.keys(fieldConfig ?? {})) {
    if (!validPaths.has(path)) {
      diagnostics.push({
        code: "invalid-configuration-path",
        message: `Field configuration path "${path}" does not exist in the schema.`,
        path,
        severity: "error",
      });
    }
  }

  for (const { field, path } of flattenedFields) {
    diagnostics.push(...fieldDiagnostics(field, path, activeRegistry, dataProviders));
    if (field.hints?.step && stepper && !stepper.steps.some((step) => step.id === field.hints?.step)) {
      diagnostics.push({
        code: "invalid-step-configuration",
        message: 'Field references unknown step "'.concat(field.hints.step, '".'),
        path,
        severity: "error",
      });
    }
  }

  return diagnostics.sort((left, right) => left.path.localeCompare(right.path) || left.code.localeCompare(right.code));
}
