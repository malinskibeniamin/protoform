import { getProtoFieldCustomData } from '@/registry/base-nova/protoform/lib/protobuf-provider/provider';
import type { ParsedField } from '../core-types';
import {
  CONSENT_FIELD_PATTERN,
  CURRENCY_FIELD_PATTERN,
  EMAIL_FIELD_PATTERN,
  getFieldUiConfig,
  LONG_TEXT_FIELD_PATTERN,
  readDataProviderId,
  SECRET_FIELD_PATTERN,
  URL_FIELD_PATTERN,
} from '../helpers';
import type { FieldMatchContext, FieldTypeDefinition } from '../registry';

type FieldTypeMetadata = Omit<FieldTypeDefinition, 'component'>;

interface FieldMetadataRegistry {
  list: () => readonly FieldTypeMetadata[];
  resolve: (field: ParsedField, context: FieldMatchContext) => FieldTypeMetadata | undefined;
}

function isKeyValueScalarField(field: { type?: string | undefined } | undefined): boolean {
  if (!field) {
    return false;
  }
  return ['string', 'email', 'url', 'password', 'currency', 'number', 'int64', 'select', 'combobox'].includes(
    field.type ?? ''
  );
}

function isSimpleKeyValueLikeObject(
  field:
    | {
        type?: string | undefined;
        schema?: Array<{ key: string; type?: string | undefined }> | undefined;
      }
    | undefined
): boolean {
  if (!(field?.type === 'object' && field.schema?.length === 2)) {
    return false;
  }

  const keyField = field.schema.find((candidate) => candidate.key === 'key');
  const valueField = field.schema.find((candidate) => candidate.key === 'value');
  return (
    keyField !== undefined &&
    valueField !== undefined &&
    isKeyValueScalarField(keyField) &&
    isKeyValueScalarField(valueField)
  );
}

export const builtInFieldMetadata = {
  dataProviderSelect: {
    match: (field) => {
      if (field.type !== 'string' && field.type !== 'number') {
        return false;
      }
      return readDataProviderId(field) !== undefined;
    },
    name: 'dataProviderSelect',
    priority: 120,
  },
  password: {
    match: (field, context) =>
      field.type === 'string' && (SECRET_FIELD_PATTERN.test(context.identity) || context.inputType === 'password'),
    name: 'password',
    priority: 20,
  },
  email: {
    match: (field, context) =>
      field.type === 'string' && (context.inputType === 'email' || EMAIL_FIELD_PATTERN.test(context.identity)),
    name: 'email',
    priority: 20,
  },
  url: {
    match: (field, context) =>
      field.type === 'string' && (context.inputType === 'url' || URL_FIELD_PATTERN.test(context.identity)),
    name: 'url',
    priority: 20,
  },
  currency: {
    match: (field, context) => field.type === 'string' && CURRENCY_FIELD_PATTERN.test(context.identity),
    name: 'currency',
    priority: 18,
  },
  textarea: {
    match: (field, context) =>
      field.type === 'string' &&
      (context.inputType === 'textarea' || context.maxLength > 120 || LONG_TEXT_FIELD_PATTERN.test(context.identity)),
    name: 'textarea',
    priority: 15,
  },
  string: {
    match: (field) => field.type === 'string',
    name: 'string',
    priority: 10,
  },
  slider: {
    match: (field) => {
      if (field.type !== 'number') {
        return false;
      }
      const customData = field.fieldConfig?.customData;
      if (!(customData && typeof customData === 'object')) {
        return false;
      }
      const bag = customData;
      if (bag['control'] === 'slider') {
        return true;
      }
      if (
        typeof bag['ui'] === 'object' &&
        bag['ui'] !== null &&
        'control' in bag['ui'] &&
        bag['ui'].control === 'slider'
      ) {
        return true;
      }
      return false;
    },
    name: 'slider',
    priority: 15,
  },
  number: {
    match: (field) => {
      if (field.type !== 'number') {
        return false;
      }
      const min = Number(field.fieldConfig?.inputProps?.['min']);
      const max = Number(field.fieldConfig?.inputProps?.['max']);
      return !(Number.isFinite(min) && Number.isFinite(max));
    },
    name: 'number',
    priority: 10,
  },
  int64: {
    match: (field) => field.type === 'int64',
    name: 'int64',
    priority: 10,
  },
  boolean: {
    match: (field) => {
      if (field.type !== 'boolean') {
        return false;
      }
      const protoData = getProtoFieldCustomData(field);
      return Boolean(protoData?.supportsUnset) && !field.required;
    },
    name: 'boolean',
    priority: 15,
  },
  checkbox: {
    match: (field, context) => field.type === 'boolean' && CONSENT_FIELD_PATTERN.test(context.identity),
    name: 'checkbox',
    priority: 14,
  },
  switch: {
    match: (field) => field.type === 'boolean',
    name: 'switch',
    priority: 10,
  },
  date: {
    match: (field) => field.type === 'date',
    name: 'date',
    priority: 10,
  },
  timestamp: {
    match: (field) => field.type === 'timestamp',
    name: 'timestamp',
    priority: 10,
  },
  choicebox: {
    match: (field) => {
      if (field.type !== 'select') {
        return false;
      }
      return getFieldUiConfig(field).control === 'choicebox';
    },
    name: 'choicebox',
    priority: 25,
  },
  toggleGroup: {
    match: (field) => {
      if (field.type !== 'select') {
        return false;
      }
      return getFieldUiConfig(field).control === 'toggleGroup';
    },
    name: 'toggleGroup',
    priority: 25,
  },
  combobox: {
    match: (field) => {
      if (field.type !== 'select') {
        return false;
      }
      const optionCount = field.options?.length ?? 0;
      return optionCount > 8;
    },
    name: 'combobox',
    priority: 18,
  },
  radio: {
    match: (field) => {
      if (field.type !== 'select') {
        return false;
      }
      const optionCount = field.options?.length ?? 0;
      return optionCount > 0 && optionCount <= 3;
    },
    name: 'radio',
    priority: 15,
  },
  select: {
    match: (field) => {
      if (field.type !== 'select') {
        return false;
      }
      const optionCount = field.options?.length ?? 0;
      return optionCount > 3 && optionCount <= 8;
    },
    name: 'select',
    priority: 12,
  },
  dataProviderMultiSelect: {
    match: (field) => {
      if (field.type !== 'array') {
        return false;
      }
      const itemField = field.schema?.[0];
      if (!itemField || (itemField.type !== 'string' && itemField.type !== 'number')) {
        return false;
      }
      return readDataProviderId(itemField) !== undefined;
    },
    name: 'dataProviderMultiSelect',
    priority: 120,
  },
  multiselect: {
    match: (field) => {
      if (field.type !== 'array') {
        return false;
      }
      const itemField = field.schema?.[0];
      return itemField?.type === 'select' && itemField.options !== undefined && itemField.options.length > 0;
    },
    name: 'multiselect',
    priority: 20,
  },
  keyValue: {
    match: (field) => {
      if (field.type === 'array') {
        const itemField = field.schema?.[0];
        return isSimpleKeyValueLikeObject(itemField);
      }

      if (field.type === 'map') {
        const keyField = field.schema?.[0];
        const valueField = field.schema?.[1];
        return isKeyValueScalarField(keyField) && isKeyValueScalarField(valueField);
      }

      return false;
    },
    name: 'keyValue',
    priority: 18,
  },
  bytes: {
    match: (field) => field.type === 'bytes',
    name: 'bytes',
    priority: 10,
  },
  duration: {
    match: (field) => field.type === 'duration',
    name: 'duration',
    priority: 10,
  },
  fieldMask: {
    match: (field) => field.type === 'fieldMask',
    name: 'fieldMask',
    priority: 10,
  },
  json: {
    match: (field) => field.type === 'json',
    name: 'json',
    priority: 10,
  },
} satisfies Record<string, FieldTypeMetadata>;

export const BUILT_IN_RENDERER_TYPES: Readonly<Record<string, readonly string[]>> = {
  boolean: ['boolean'],
  bytes: ['bytes'],
  checkbox: ['boolean'],
  choicebox: ['select'],
  combobox: ['select'],
  currency: ['string'],
  dataProviderMultiSelect: ['array'],
  dataProviderSelect: ['number', 'string'],
  date: ['date'],
  'dropzone-json': ['json', 'object'],
  duration: ['duration'],
  email: ['string'],
  fieldMask: ['fieldMask'],
  int64: ['int64'],
  json: ['json', 'object'],
  keyValue: ['array', 'map'],
  multiselect: ['array'],
  number: ['number'],
  password: ['string'],
  radio: ['select'],
  select: ['select'],
  slider: ['number'],
  string: ['string'],
  switch: ['boolean'],
  textarea: ['string'],
  timestamp: ['timestamp'],
  toggle: ['boolean'],
  toggleGroup: ['select'],
  url: ['string'],
};

const defaultDefinitions = Object.values(builtInFieldMetadata).sort((left, right) => right.priority - left.priority);

let defaultFieldMetadataRegistry: FieldMetadataRegistry = {
  list: () => defaultDefinitions,
  resolve: (field, context) => defaultDefinitions.find((definition) => definition.match(field, context)),
};
let builtInRenderers: Readonly<Record<string, unknown>> = BUILT_IN_RENDERER_TYPES;

export function getDefaultFieldMetadataRegistry(): FieldMetadataRegistry {
  return defaultFieldMetadataRegistry;
}

export function hasBuiltInFieldRenderer(name: string): boolean {
  return name !== 'fallback' && Object.hasOwn(builtInRenderers, name);
}

export function bindDefaultFieldMetadataRegistry(
  registry: FieldMetadataRegistry,
  renderers: Readonly<Record<string, unknown>>
): void {
  defaultFieldMetadataRegistry = registry;
  builtInRenderers = renderers;
}
