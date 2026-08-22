import type { Message } from "@bufbuild/protobuf";
import type { ProtoConversionOptions } from "../../lib/protobuf-provider";
import type { ParsedField, SchemaProvider } from "./core-types";
import { sortFieldsByOrder } from "./field-utils";
import { isProtoMessageDescriptor, isProtoProvider, ProtoProvider } from "./proto";
import type { AutoFormSchemaInput, FieldConfigMap, FieldTypes, RenderFieldConfig, ResolvedSchema } from "./types";

function isSchemaProvider(value: unknown): value is SchemaProvider<Record<string, unknown>> {
  return Boolean(
    value &&
      typeof value === "object" &&
      "parseSchema" in value &&
      typeof (value as SchemaProvider<Record<string, unknown>>).parseSchema === "function" &&
      "validateSchema" in value &&
      typeof (value as SchemaProvider<Record<string, unknown>>).validateSchema === "function" &&
      "getDefaultValues" in value &&
      typeof (value as SchemaProvider<Record<string, unknown>>).getDefaultValues === "function"
  );
}

export { normalizeProtoInitialValues } from "./proto";

export function resolveSchema<T extends Record<string, unknown>>(
  schemaInput: AutoFormSchemaInput<T>,
  conversionOptions: ProtoConversionOptions = {},
  protoSource?: Message
): ResolvedSchema {
  if (isSchemaProvider(schemaInput)) {
    const provider = schemaInput as SchemaProvider<Record<string, unknown>>;
    const parsedSchema = provider.parseSchema();

    if (isProtoProvider(provider)) {
      const protoDesc = provider.getMessageDescriptor();
      return {
        isProto: true,
        parsedSchema,
        protoDesc,
        protoSource,
        provider,
      };
    }

    return {
      isProto: false,
      parsedSchema,
      provider,
    };
  }

  if (isProtoMessageDescriptor(schemaInput)) {
    const provider = new ProtoProvider(schemaInput, conversionOptions);
    return {
      isProto: true,
      parsedSchema: provider.parseSchema(),
      protoDesc: schemaInput,
      protoSource,
      provider,
    };
  }

  throw new Error("Unsupported AutoForm schema input. Pass a SchemaProvider or a Buf message descriptor.");
}

export function protoConversionOptionsFromFieldConfig<TCustom extends string>(
  fieldConfig: FieldConfigMap<TCustom> | undefined
): ProtoConversionOptions {
  const emptyRepeatedStringPolicies = Object.fromEntries(
    Object.entries(fieldConfig ?? {}).flatMap(([path, config]) =>
      config.emptyRepeatedStringPolicy ? [[path, config.emptyRepeatedStringPolicy] as const] : []
    )
  );
  return Object.keys(emptyRepeatedStringPolicies).length > 0 ? { emptyRepeatedStringPolicies } : {};
}

export function mergeFieldOverrides<TCustom extends string = never>(
  fields: ParsedField[] | undefined,
  overrides: FieldConfigMap<TCustom> | undefined,
  path: string[] = []
): ParsedField<FieldTypes<TCustom>>[] {
  if (!fields) {
    return [];
  }

  return sortFieldsByOrder(
    fields.map((field) => {
      const fieldPath = [...path, field.key].join(".");
      const override = overrides?.[fieldPath];
      const existingConfig = field.fieldConfig as RenderFieldConfig<TCustom> | undefined;
      const mergedFieldConfig: RenderFieldConfig<TCustom> | undefined = override
        ? ({
            ...(existingConfig ?? {}),
            ...override,
            customData: {
              ...(existingConfig?.customData ?? {}),
              ...(override.customData ?? {}),
            },
            inputProps: {
              ...(existingConfig?.inputProps ?? {}),
              ...(override.inputProps ?? {}),
            },
          } as RenderFieldConfig<TCustom>)
        : existingConfig;

      const nextSchema =
        field.schema && field.schema.length > 0
          ? mergeFieldOverrides(field.schema, overrides, [...path, field.key])
          : field.schema;

      return {
        ...field,
        fieldConfig: mergedFieldConfig,
        schema: nextSchema,
      } as ParsedField<FieldTypes<TCustom>>;
    })
  );
}
