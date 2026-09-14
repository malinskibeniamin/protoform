/** Flat, JSON-safe snapshots only. No protobuf messages, credentials, or host objects. */
export interface QuickJsRequest {
  fields: string[];
  source: string;
  values: Record<string, string | number | boolean | null>;
}
export type QuickJsPresentation = Record<string, { visible?: boolean; disabled?: boolean }>;
export const QUICKJS_TEXT_LIMIT = 16_384;
const reservedNames = new Set(["__proto__", "constructor", "prototype"]);
const fieldName = /^[A-Za-z_][A-Za-z0-9_]{0,127}$/u;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseQuickJsRequest(value: unknown): QuickJsRequest {
  if (
    !isRecord(value) ||
    typeof value["source"] !== "string" ||
    !isRecord(value["values"]) ||
    !Array.isArray(value["fields"])
  ) {
    throw new Error("Expected source, scalar values, and explicit field names");
  }
  if (value["fields"].length > 200) {
    throw new Error("Too many fields");
  }
  const fields: string[] = [];
  const allowedFields = new Set<string>();
  for (const field of value["fields"]) {
    if (typeof field !== "string" || !fieldName.test(field) || reservedNames.has(field) || allowedFields.has(field)) {
      throw new Error("Invalid or duplicate field name");
    }
    fields.push(field);
    allowedFields.add(field);
  }
  if (value["source"].length > QUICKJS_TEXT_LIMIT) {
    throw new Error("Request limit exceeded");
  }
  const values: QuickJsRequest["values"] = {};
  for (const [key, item] of Object.entries(value["values"])) {
    if (
      !(
        allowedFields.has(key) &&
        (item === null ||
          typeof item === "string" ||
          typeof item === "boolean" ||
          (typeof item === "number" && Number.isFinite(item)))
      )
    ) {
      throw new Error("Expected known fields with finite scalar values");
    }
    values[key] = item;
  }
  if (JSON.stringify(values).length > QUICKJS_TEXT_LIMIT) {
    throw new Error("Input too large");
  }
  return { fields, source: value["source"], values };
}

export function parseQuickJsPresentation(value: unknown, fields: string[]): QuickJsPresentation {
  if (!isRecord(value)) {
    throw new Error("Expected presentation object");
  }
  const result: QuickJsPresentation = {};
  const allowedFields = new Set(fields);
  for (const [field, config] of Object.entries(value)) {
    if (!(allowedFields.has(field) && isRecord(config))) {
      throw new Error("Unknown field or invalid presentation");
    }
    const policy: { visible?: boolean; disabled?: boolean } = {};
    for (const [key, setting] of Object.entries(config)) {
      if ((key !== "visible" && key !== "disabled") || typeof setting !== "boolean") {
        throw new Error("Only boolean visible/disabled properties are allowed");
      }
      policy[key] = setting;
    }
    result[field] = policy;
  }
  return result;
}
