import type { FormStore, RequiredPath } from '@formisch/react';
import { getInput, insert, remove, setErrors, setInput, useFieldArray } from '@formisch/react';
import { array, type GenericSchema, nullish, object, unknown as unknownValue } from 'valibot';
import type { ParsedField } from '../core-types';

type Values = Record<string, unknown>;
type Segment = string | number;
const ARRAY_INDEX = /^\d+$/u;
type Storage =
  | { kind: 'leaf' }
  | { kind: 'array'; item: Storage }
  | { kind: 'object'; entries: Record<string, Storage> };

function fieldStorage(field: ParsedField): Storage {
  if (field.type === 'object' && field.schema) {
    return objectStorage(field.schema);
  }
  if (field.type === 'array' && field.schema?.[0]) {
    return { item: fieldStorage(field.schema[0]), kind: 'array' };
  }
  if (field.type === 'map' && field.schema) {
    return { item: objectStorage(field.schema), kind: 'array' };
  }
  if (field.type === 'oneof') {
    return { entries: { case: { kind: 'leaf' }, value: { kind: 'leaf' } }, kind: 'object' };
  }
  return { kind: 'leaf' };
}

export function objectStorage(fields: ParsedField[]): Extract<Storage, { kind: 'object' }> {
  return {
    entries: Object.fromEntries(
      fields.map((field) => {
        if (Object.hasOwn(Object.prototype, field.key)) {
          throw new Error(`Formisch cannot register the field "${field.key}".`);
        }
        return [field.key, fieldStorage(field)];
      })
    ),
    kind: 'object',
  };
}

function storageSchema(storage: Storage): GenericSchema {
  if (storage.kind === 'object') {
    return nullish(objectSchema(storage));
  }
  if (storage.kind === 'array') {
    return nullish(array(storageSchema(storage.item)));
  }
  return unknownValue();
}

export function objectSchema(storage: Extract<Storage, { kind: 'object' }>) {
  return object(Object.fromEntries(Object.entries(storage.entries).map(([key, node]) => [key, storageSchema(node)])));
}

type GeneratedSchema = ReturnType<typeof objectSchema>;
export type FormischAutoFormApi = FormStore<GeneratedSchema>;

export function storagePath(storage: Storage, name: string) {
  const keys = name.split('.');
  const path: Segment[] = [];
  let current = storage;
  for (const key of keys) {
    if (current.kind === 'leaf') {
      break;
    }
    if (current.kind === 'array') {
      if (!ARRAY_INDEX.test(key)) {
        return;
      }
      path.push(Number(key));
      current = current.item;
    } else {
      const next = Object.hasOwn(current.entries, key) ? current.entries[key] : undefined;
      if (!next) {
        return;
      }
      path.push(key);
      current = next;
    }
  }

  const [first, ...rest] = path;
  if (first === undefined) {
    return;
  }
  const field: RequiredPath = [first, ...rest];
  return { field, remaining: keys.slice(path.length), storage: current };
}

function ownValue(value: unknown, key: Segment): unknown {
  return typeof value === 'object' && value !== null && Object.hasOwn(value, key) ? Reflect.get(value, key) : undefined;
}

function withPathValue(input: unknown, path: string[], value: unknown): unknown {
  const [head, ...rest] = path;
  if (head === undefined) {
    return value;
  }
  const next = withPathValue(ownValue(input, head), rest, value);
  if (Array.isArray(input)) {
    const index = Number(head);
    if (Number.isInteger(index) && index >= 0 && index < input.length) {
      const previousItems: unknown[] = input;
      const items = [...previousItems];
      items[index] = next;
      return items;
    }
  }
  return { ...(typeof input === 'object' && input !== null ? input : {}), [head]: next };
}

function readFieldInput(form: FormischAutoFormApi, path: RequiredPath): unknown {
  return Reflect.apply(getInput, undefined, [form, { path }]);
}

export function clearFieldError(form: FormischAutoFormApi, path: RequiredPath) {
  Reflect.apply(setErrors, undefined, [form, { errors: null, path }]);
}

export function useGeneratedArrayKeys(form: FormischAutoFormApi, path: RequiredPath): string[] {
  const field: unknown = Reflect.apply(useFieldArray, undefined, [form, { path }]);
  const items = ownValue(field, 'items');
  if (!(Array.isArray(items) && items.every((item: unknown): item is string => typeof item === 'string'))) {
    throw new TypeError('Expected native Formisch field-array keys.');
  }
  return items;
}

export function insertGeneratedItem(form: FormischAutoFormApi, path: RequiredPath, initialInput: unknown) {
  Reflect.apply(insert, undefined, [form, { initialInput, path }]);
}

export function removeGeneratedItem(form: FormischAutoFormApi, path: RequiredPath, at: number) {
  Reflect.apply(remove, undefined, [form, { at, path }]);
}

export function setGeneratedValue(form: FormischAutoFormApi, storage: Storage, name: string, value: unknown) {
  const path = storagePath(storage, name);
  if (!path) {
    return;
  }
  const input =
    path.remaining.length > 0 ? withPathValue(readFieldInput(form, path.field), path.remaining, value) : value;
  Reflect.apply(setInput, undefined, [form, { input, path: path.field }]);
}

export function errorTree(issues: Array<{ message: string; path: Segment[] }>): Values {
  const errors: Values = {};
  for (const issue of issues) {
    let current = errors;
    for (const [index, key] of issue.path.entries()) {
      const previous = ownValue(current, key);
      const next: Values = { ...(typeof previous === 'object' && previous !== null ? previous : {}) };
      if (index === issue.path.length - 1) {
        const { message } = next;
        next['message'] = typeof message === 'string' ? `${message}\n${issue.message}` : issue.message;
      }
      Object.defineProperty(current, key, { configurable: true, enumerable: true, value: next });
      current = next;
    }
  }
  return errors;
}
