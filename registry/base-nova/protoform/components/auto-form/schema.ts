import type { Message } from '@bufbuild/protobuf';
import type { ProtoConversionOptions } from '@/registry/base-nova/protoform/lib/protobuf-provider';
import {
  isProtoMessageDescriptor,
  isProtoProvider,
  ProtoProvider,
} from '@/registry/base-nova/protoform/lib/protobuf-provider/provider';
import type { ParsedField, SchemaProvider, SchemaValidation } from './core-types';
import { sortFieldsByOrder } from './field-utils';
import type { AutoFormSchemaInput, FieldConfigMap, FieldTypes, RenderFieldConfig, ResolvedSchema } from './types';

function isSchemaProvider(value: unknown): value is SchemaProvider<Record<string, unknown>> {
  return (
    value !== null &&
    typeof value === 'object' &&
    'parseSchema' in value &&
    typeof value.parseSchema === 'function' &&
    'validateSchema' in value &&
    typeof value.validateSchema === 'function' &&
    'getDefaultValues' in value &&
    typeof value.getDefaultValues === 'function'
  );
}

export { normalizeProtoInitialValues } from './proto/conversion';

export function resolveSchema<T extends Record<string, unknown>>(
  schemaInput: AutoFormSchemaInput<T>,
  conversionOptions: ProtoConversionOptions = {},
  protoSource?: Message
) {
  if (isSchemaProvider(schemaInput)) {
    const provider = schemaInput;
    const parsedSchema = provider.parseSchema();

    if (isProtoProvider(provider)) {
      const protoDesc = provider.getMessageDescriptor();
      const resolvedSchema: ResolvedSchema = {
        isProto: true,
        parsedSchema,
        protoDesc,
        protoSource,
        provider,
      };
      return resolvedSchema;
    }

    const resolvedSchema: ResolvedSchema = {
      isProto: false,
      parsedSchema,
      provider,
    };
    return resolvedSchema;
  }

  if (isProtoMessageDescriptor(schemaInput)) {
    const provider = new ProtoProvider(schemaInput, conversionOptions);
    const resolvedSchema: ResolvedSchema = {
      isProto: true,
      parsedSchema: provider.parseSchema(),
      protoDesc: schemaInput,
      protoSource,
      provider,
    };
    return resolvedSchema;
  }

  throw new Error('Unsupported AutoForm schema input. Pass a SchemaProvider or a Buf message descriptor.');
}

export function protoConversionOptionsFromFieldConfig<TCustom extends string>(
  fieldConfig: FieldConfigMap<TCustom> | undefined
) {
  const emptyRepeatedStringPolicies = Object.fromEntries(
    Object.entries(fieldConfig ?? {}).flatMap(([path, config]) =>
      config.emptyRepeatedStringPolicy ? [[path, config.emptyRepeatedStringPolicy] as const] : []
    )
  );
  const result: ProtoConversionOptions =
    Object.keys(emptyRepeatedStringPolicies).length > 0 ? { emptyRepeatedStringPolicies } : {};
  return result;
}

export function mergeFieldOverrides<TCustom extends string = never>(
  fields: ParsedField[] | undefined,
  overrides: FieldConfigMap<TCustom> | undefined,
  path: string[] = []
) {
  if (!fields) {
    const result: ParsedField<FieldTypes<TCustom>>[] = [];
    return result;
  }

  const result: ParsedField<FieldTypes<TCustom>>[] = sortFieldsByOrder(
    fields.map((field) => {
      const fieldPath = [...path, field.key].join('.');
      const override = overrides?.[fieldPath];
      const existingConfig = field.fieldConfig as RenderFieldConfig<TCustom> | undefined;
      const mergedFieldConfig: RenderFieldConfig<TCustom> | undefined = override
        ? {
            ...existingConfig,
            ...override,
            customData: {
              ...existingConfig?.customData,
              ...override.customData,
            },
            inputProps: {
              ...existingConfig?.inputProps,
              ...override.inputProps,
            },
          }
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
  return result;
}

export type ValidatedFormValues =
  | { success: true; data: Record<string, unknown> }
  | Extract<SchemaValidation, { success: false }>;

export function normalizeSchemaValidation(result: SchemaValidation) {
  if (!result.success) {
    return result;
  }
  const { data } = result;
  if (isFormValues(data)) {
    const success: ValidatedFormValues = { data, success: true };
    return success;
  }
  const failure: ValidatedFormValues = {
    errors: [{ message: 'Validation returned invalid form values.', path: [] }],
    success: false,
  };
  return failure;
}

function isFormValues(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
