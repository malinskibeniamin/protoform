import type { FormValues, ParsedSchema } from "../core/field-model";
import { parseQuickJsRequest } from "./contract";
import type { ReviewedQuickJsRequest } from "./controller";

/** Bind form-shaped values, never protobuf messages or provider-private metadata. */
export function createQuickJsFormRequest(options: {
  rule: ReviewedQuickJsRequest["rule"];
  schema: ParsedSchema;
  /** Explicit host-owned input exposure; omit sensitive fields. */
  valueFields: readonly string[];
  values: FormValues;
}): ReviewedQuickJsRequest {
  const fields = options.schema.fields.map((field) => field.key);
  const values: FormValues = {};
  const selected = new Set<string>();
  for (const key of options.valueFields) {
    if (!fields.includes(key) || selected.has(key)) {
      throw new Error("Unknown or duplicate QuickJS input field");
    }
    selected.add(key);
    const descriptor = Object.getOwnPropertyDescriptor(options.values, key);
    if (!descriptor) {
      continue;
    }
    if (!("value" in descriptor)) {
      throw new Error("Expected form value data properties");
    }
    if (descriptor.value !== undefined) {
      values[key] = descriptor.value;
    }
  }
  const fieldInfo = Object.fromEntries(
    options.schema.fields.map((field) => [field.key, { required: field.required, type: field.type }])
  );
  const snapshot = parseQuickJsRequest({ fieldInfo, fields, source: options.rule.source, values });
  return {
    ...(snapshot.fieldInfo ? { fieldInfo: snapshot.fieldInfo } : {}),
    fields: snapshot.fields,
    rule: { ...options.rule },
    values: snapshot.values,
  };
}
