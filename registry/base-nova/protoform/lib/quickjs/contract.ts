export type QuickJsValue = string | number | boolean | null | QuickJsValue[] | { [key: string]: QuickJsValue };
export type QuickJsFieldInfo = Record<string, { type: string; required: boolean }>;

export interface QuickJsRequest {
  fieldInfo?: QuickJsFieldInfo;
  fields: string[];
  source: string;
  values: Record<string, QuickJsValue>;
}
export type QuickJsPresentation = Record<string, { visible?: boolean; disabled?: boolean }>;
export const QUICKJS_TEXT_LIMIT = 16_384;
const reservedNames = new Set(['__proto__', 'constructor', 'prototype']);
const fieldName = /^[A-Za-z_][A-Za-z0-9_]{0,127}$/u;
const fieldTypeName = /^[A-Za-z][A-Za-z0-9_.-]{0,127}$/u;
const depthLimit = 16;
const nodeLimit = 2000;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

interface SnapshotBudget {
  remaining: number;
  remainingText: number;
}

function spendText(budget: SnapshotBudget, length: number): void {
  budget.remainingText -= length;
  if (budget.remainingText < 0) {
    throw new Error('Input too large');
  }
}

function readDataProperty(value: object, key: PropertyKey): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (!(descriptor && 'value' in descriptor)) {
    throw new Error('Expected snapshot data properties');
  }
  return descriptor.value;
}

function copyArray(value: unknown[], depth: number, budget: SnapshotBudget): QuickJsValue[] {
  if (
    value.length > budget.remaining ||
    Object.keys(value).length !== value.length ||
    Object.getOwnPropertySymbols(value).length > 0 ||
    Object.getPrototypeOf(value) !== Array.prototype
  ) {
    throw new Error('Invalid or oversized snapshot array');
  }
  const result: QuickJsValue[] = [];
  for (let index = 0; index < value.length; index += 1) {
    result.push(copyValue(readDataProperty(value, index), depth + 1, budget));
  }
  return result;
}

function copyObject(
  value: Record<string, unknown>,
  depth: number,
  budget: SnapshotBudget
): Record<string, QuickJsValue> {
  const prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new Error('Expected plain snapshot objects');
  }
  const keys = Object.keys(value);
  if (keys.length > budget.remaining || Object.getOwnPropertySymbols(value).length > 0) {
    throw new Error('Invalid or oversized snapshot object');
  }
  const result: Record<string, QuickJsValue> = {};
  for (const key of keys.sort((a, b) => {
    if (a < b) {
      return -1;
    }
    return a > b ? 1 : 0;
  })) {
    spendText(budget, key.length);
    if (reservedNames.has(key) || key === '$typeName' || key === '$unknown') {
      throw new Error('Reserved snapshot property');
    }
    const item = readDataProperty(value, key);
    if (item !== undefined) {
      result[key] = copyValue(item, depth + 1, budget);
    }
  }
  return result;
}

function copyValue(value: unknown, depth: number, budget: SnapshotBudget): QuickJsValue {
  budget.remaining -= 1;
  if (depth > depthLimit || budget.remaining < 0) {
    throw new Error('Snapshot structure limit exceeded');
  }
  if (value === null || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    spendText(budget, value.length);
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    return copyArray(value, depth, budget);
  }
  if (isRecord(value)) {
    return copyObject(value, depth, budget);
  }
  throw new Error('Expected JSON-safe snapshot values');
}

function parseFieldMetadata(entry: unknown, rawEntry: unknown): QuickJsFieldInfo[string] {
  if (
    !isRecord(rawEntry) ||
    Object.keys(rawEntry).length !== 2 ||
    !isRecord(entry) ||
    Object.keys(entry).length !== 2 ||
    typeof entry['type'] !== 'string' ||
    !fieldTypeName.test(entry['type']) ||
    typeof entry['required'] !== 'boolean'
  ) {
    throw new Error('Expected known fields with type/required metadata');
  }
  return { required: entry['required'], type: entry['type'] };
}

function parseFieldInfo(
  rawInfo: unknown,
  allowedFields: Set<string>,
  budget: SnapshotBudget
): QuickJsFieldInfo | undefined {
  if (rawInfo === undefined) {
    return undefined;
  }
  if (!isRecord(rawInfo) || Object.keys(rawInfo).some((key) => !allowedFields.has(key))) {
    throw new Error('Expected known field metadata');
  }
  const info = copyValue(rawInfo, 0, budget);
  if (!isRecord(info)) {
    throw new Error('Expected field metadata object');
  }
  const fieldInfo: QuickJsFieldInfo = {};
  for (const [key, entry] of Object.entries(info)) {
    fieldInfo[key] = parseFieldMetadata(entry, readDataProperty(rawInfo, key));
  }
  return fieldInfo;
}

export function parseQuickJsRequest(value: unknown): QuickJsRequest {
  if (
    !isRecord(value) ||
    typeof value['source'] !== 'string' ||
    !isRecord(value['values']) ||
    !Array.isArray(value['fields'])
  ) {
    throw new Error('Expected source, form values, and explicit field names');
  }
  if (value['fields'].length > 200) {
    throw new Error('Too many fields');
  }
  const fields: string[] = [];
  const allowedFields = new Set<string>();
  for (const field of value['fields']) {
    if (typeof field !== 'string' || !fieldName.test(field) || reservedNames.has(field) || allowedFields.has(field)) {
      throw new Error('Invalid or duplicate field name');
    }
    fields.push(field);
    allowedFields.add(field);
  }
  if (value['source'].length > QUICKJS_TEXT_LIMIT) {
    throw new Error('Request limit exceeded');
  }
  if (Object.keys(value['values']).some((key) => !allowedFields.has(key))) {
    throw new Error('Expected known snapshot fields');
  }
  const budget = { remaining: nodeLimit, remainingText: QUICKJS_TEXT_LIMIT };
  const values = copyValue(value['values'], 0, budget);
  if (!isRecord(values)) {
    throw new Error('Expected snapshot object');
  }
  const fieldInfo = parseFieldInfo(value['fieldInfo'], allowedFields, budget);
  if (JSON.stringify([values, fieldInfo ?? {}]).length > QUICKJS_TEXT_LIMIT) {
    throw new Error('Input too large');
  }
  return { ...(fieldInfo ? { fieldInfo } : {}), fields, source: value['source'], values };
}

export function parseQuickJsPresentation(value: unknown, fields: string[]): QuickJsPresentation {
  if (!isRecord(value)) {
    throw new Error('Expected presentation object');
  }
  const result: QuickJsPresentation = {};
  const allowedFields = new Set(fields);
  for (const [field, config] of Object.entries(value)) {
    if (!(allowedFields.has(field) && isRecord(config))) {
      throw new Error('Unknown field or invalid presentation');
    }
    const policy: { visible?: boolean; disabled?: boolean } = {};
    for (const [key, setting] of Object.entries(config)) {
      if ((key !== 'visible' && key !== 'disabled') || typeof setting !== 'boolean') {
        throw new Error('Only boolean visible/disabled properties are allowed');
      }
      policy[key] = setting;
    }
    result[field] = policy;
  }
  return result;
}
