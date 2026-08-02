import type { ParsedField, SchemaProvider } from './core-types';
import { sortFieldsByOrder } from './field-utils';
import { isProtoMessageDescriptor, isProtoProvider, ProtoProvider } from './proto';
import type { AutoFormSchemaInput, FieldConfigMap, RenderFieldConfig, ResolvedSchema } from './types';

function isSchemaProvider(value: unknown): value is SchemaProvider<Record<string, unknown>> {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'parseSchema' in value &&
      typeof (value as SchemaProvider<Record<string, unknown>>).parseSchema === 'function' &&
      'validateSchema' in value &&
      typeof (value as SchemaProvider<Record<string, unknown>>).validateSchema === 'function' &&
      'getDefaultValues' in value &&
      typeof (value as SchemaProvider<Record<string, unknown>>).getDefaultValues === 'function'
  );
}

export { normalizeProtoInitialValues } from './proto';

export function resolveSchema<T extends Record<string, unknown>>(
  schemaInput: AutoFormSchemaInput<T>
): ResolvedSchema {
  if (isSchemaProvider(schemaInput)) {
    const provider = schemaInput as SchemaProvider<Record<string, unknown>>;
    const parsedSchema = provider.parseSchema();

    if (isProtoProvider(provider)) {
      const protoDesc = provider.getMessageDescriptor();
      return {
        provider,
        parsedSchema,
        isProto: true,
        protoDesc,
      };
    }

    return {
      provider,
      parsedSchema,
      isProto: false,
    };
  }

  if (isProtoMessageDescriptor(schemaInput)) {
    const provider = new ProtoProvider(schemaInput);
    return {
      provider,
      parsedSchema: provider.parseSchema(),
      isProto: true,
      protoDesc: schemaInput,
    };
  }

  throw new Error('Unsupported AutoForm schema input. Pass a SchemaProvider or a Buf message descriptor.');
}

export function mergeFieldOverrides(
  fields: ParsedField[] | undefined,
  overrides: FieldConfigMap | undefined,
  path: string[] = []
): ParsedField[] {
  if (!fields) {
    return [];
  }

  return sortFieldsByOrder(
    fields.map((field) => {
      const fieldPath = [...path, field.key].join('.');
      const override = overrides?.[fieldPath];
      const existingConfig = (field.fieldConfig ?? {}) as RenderFieldConfig;
      const mergedFieldConfig: ParsedField['fieldConfig'] = override
        ? ({
            ...existingConfig,
            ...override,
            inputProps: {
              ...(existingConfig.inputProps ?? {}),
              ...(override.inputProps ?? {}),
            },
            customData: {
              ...(existingConfig.customData ?? {}),
              ...(override.customData ?? {}),
            },
          } as ParsedField['fieldConfig'])
        : field.fieldConfig;

      const nextSchema = field.schema?.length
        ? mergeFieldOverrides(field.schema, overrides, [...path, field.key])
        : field.schema;

      return {
        ...field,
        fieldConfig: mergedFieldConfig,
        schema: nextSchema,
      };
    })
  );
}
