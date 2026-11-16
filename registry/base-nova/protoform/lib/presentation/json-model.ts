export function formatNumericValue(value: number) {
  return value.toString();
}

function isJsonValue(value: unknown): value is JSONValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }
  return typeof value === 'object' && Object.values(value).every(isJsonValue);
}

export function parseJson(source: string): JSONValue {
  const value: unknown = JSON.parse(source);
  if (!isJsonValue(value)) {
    throw new TypeError('Invalid JSON value');
  }
  return value;
}

export const TRAILING_S_REGEX = /s$/u;

export function jsonEditorLabel(propertyName: string | undefined, path: string[]): string {
  const name = propertyName ?? path.at(-1) ?? 'value';
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} JSON`;
}

export interface CustomFieldConfig {
  fieldName: string;
  onCreateOption?: (
    newValue: string,
    path: string[],
    handleFieldChange: (path: string[], value: JSONValue) => void
  ) => Promise<void>;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const EMPTY_CUSTOM_FIELDS: CustomFieldConfig[] = [];

const SIMPLE_JSON_TYPES = new Set(['string', 'number', 'integer', 'boolean', 'null']);

export function getJSONProperty(value: JSONValue, key: string): JSONValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value[key] : undefined;
}

export function withJSONDefault(value: JSONValue, fallback: JSONValue): JSONValue {
  if (value === undefined) {
    return fallback;
  }
  return value;
}

const isTypeSupported = (type: JSONSchemaType['type'], supportedTypes: ReadonlySet<string>): boolean => {
  if (Array.isArray(type)) {
    return type.every((t) => supportedTypes.has(t));
  }
  return typeof type === 'string' && supportedTypes.has(type);
};

export const isSimpleObject = (schema: JSONSchemaType): boolean => {
  if (schema.type !== undefined && isTypeSupported(schema.type, SIMPLE_JSON_TYPES)) {
    return true;
  }
  if (schema.type === 'object') {
    return schema.properties !== undefined && Object.keys(schema.properties).length > 0;
  }
  if (schema.type === 'array') {
    return Boolean(schema.items);
  }
  return false;
};

export function getStringInputType(format: string | undefined) {
  switch (format) {
    case 'email':
      return 'email';
    case 'uri':
      return 'url';
    case 'date':
      return 'date';
    case 'date-time':
      return 'datetime-local';
    default:
      return 'text';
  }
}

export const getArrayItemDefault = (schema: JSONSchemaType): JSONValue => {
  if ('default' in schema && schema.default !== undefined) {
    return schema.default;
  }

  switch (schema.type) {
    case 'string':
      return '';
    case 'number':
    case 'integer':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      return {};
    case 'null':
      return null;
    default:
      return null;
  }
};

const generateExampleData = (schema: JSONSchemaType): JSONValue => {
  if ('default' in schema && schema.default !== undefined) {
    return schema.default;
  }

  switch (schema.type) {
    case 'string': {
      const example = schema.examples?.[0];
      const hasExample = Boolean(example);
      return hasExample ? example : '';
    }
    case 'number':
    case 'integer': {
      const example = schema.examples?.[0];
      const hasExample = Boolean(example);
      return hasExample ? example : 42;
    }
    case 'boolean':
      return true;
    case 'array':
      if (schema.items) {
        return [generateExampleData(schema.items)];
      }
      return [];
    case 'object':
      if (schema.properties) {
        const result: Record<string, JSONValue> = {};
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          result[key] = generateExampleData(propSchema);
        }
        return result;
      }
      return {};
    case 'null':
      return null;
    default:
      return null;
  }
};

const hasEmptyValues = (value: JSONValue, schema: JSONSchemaType): boolean => {
  if (value === undefined) {
    return true;
  }

  if (schema.type === 'object' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, JSONValue>;
    if (Object.keys(obj).length === 0) {
      return true;
    }

    if (schema.properties) {
      return Object.entries(schema.properties).every(([key, propSchema]) => {
        const val = obj[key];
        const subSchema = propSchema;

        if (val === undefined) {
          return true;
        }
        if (subSchema.type === 'string' && val === '') {
          return true;
        }
        if (subSchema.type === 'array' && Array.isArray(val) && val.length === 0) {
          return true;
        }
        if (subSchema.type === 'object' && hasEmptyValues(val, subSchema)) {
          return true;
        }

        return false;
      });
    }
  }

  if (schema.type === 'array' && Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
};

export function isJSONOnlySchema(schema: JSONSchemaType): boolean {
  return (
    (schema.type === 'object' && (!schema.properties || Object.keys(schema.properties).length === 0)) ||
    (schema.type === 'array' && !schema.items)
  );
}

export function initialJSONText(value: JSONValue, schema: JSONSchemaType, showPlaceholder: boolean): string {
  if (showPlaceholder === true && hasEmptyValues(value, schema)) {
    return JSON.stringify(generateExampleData(schema), null, 2);
  }
  if (value !== undefined) {
    return JSON.stringify(value, null, 2);
  }
  return schema.type === 'array' ? '[]' : '{}';
}

export type JSONValue = string | number | boolean | null | undefined | JSONValue[] | { [key: string]: JSONValue };

export interface JSONSchemaConst {
  const: JSONValue;
  description?: string;
  title?: string;
}

export interface JSONSchemaType {
  anyOf?: (JSONSchemaType | JSONSchemaConst)[];
  const?: JSONValue;
  default?: JSONValue;
  description?: string;
  enum?: string[];
  examples?: JSONValue[];
  format?: string;
  items?: JSONSchemaType;
  maximum?: number;
  maxLength?: number;
  minimum?: number;
  minLength?: number;
  oneOf?: (JSONSchemaType | JSONSchemaConst)[];
  pattern?: string;
  properties?: Record<string, JSONSchemaType>;
  required?: string[];
  title?: string;
  type?:
    | 'string'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'array'
    | 'object'
    | 'null'
    | ('string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null')[];
}

export type JSONObject = Record<string, JSONValue>;

export function updateValueAtPath(obj: JSONValue, path: string[], value: JSONValue): JSONValue {
  if (path.length === 0) {
    return value;
  }

  let mutableObj = obj;
  if (obj === null || obj === undefined) {
    mutableObj = Number.isNaN(Number(path[0])) ? {} : [];
  }

  if (Array.isArray(mutableObj)) {
    return updateArray(mutableObj, path, value);
  }
  if (typeof mutableObj === 'object' && mutableObj !== null) {
    return updateObject(mutableObj, path, value);
  }
  return mutableObj;
}

function updateArray(array: JSONValue[], path: string[], value: JSONValue): JSONValue[] {
  const [index, ...restPath] = path;
  const arrayIndex = Number(index);

  if (Number.isNaN(arrayIndex)) {
    return array;
  }

  if (arrayIndex < 0) {
    return array;
  }

  let newArray: JSONValue[] = [];
  for (let i = 0; i < array.length; i += 1) {
    newArray[i] = i in array ? array[i] : null;
  }

  if (arrayIndex >= newArray.length) {
    const extendedArray: JSONValue[] = Array.from({ length: arrayIndex }, () => null);
    for (let i = 0; i < newArray.length; i += 1) {
      extendedArray[i] = newArray[i];
    }
    newArray = extendedArray;
  }

  newArray[arrayIndex] = restPath.length === 0 ? value : updateValueAtPath(newArray[arrayIndex], restPath, value);
  return newArray;
}

function updateObject(obj: JSONObject, path: string[], value: JSONValue): JSONObject {
  const [key, ...restPath] = path;

  if (typeof key !== 'string') {
    return obj;
  }

  const newObj = { ...obj };

  if (restPath.length === 0) {
    newObj[key] = value;
  } else {
    if (!(key in newObj)) {
      newObj[key] = {};
    }
    newObj[key] = updateValueAtPath(newObj[key], restPath, value);
  }
  return newObj;
}
