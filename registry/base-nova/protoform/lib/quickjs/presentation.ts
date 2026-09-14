import type { FieldConfig } from "../core/field-model";
import type { QuickJsPresentation } from "./contract";

/** Always compose against the original base config, not the previous dynamic result. */
export function quickJsFieldConfig<FieldTypes = never>(
  presentation: QuickJsPresentation,
  base: Record<string, FieldConfig<FieldTypes, Record<string, unknown>>> = {}
): Record<string, FieldConfig<FieldTypes, Record<string, unknown>>> {
  const result: Record<string, FieldConfig<FieldTypes, Record<string, unknown>>> = { ...base };
  for (const [field, policy] of Object.entries(presentation)) {
    const original = base[field];
    result[field] = {
      ...original,
      ...(policy.visible === false ? { customData: { ...original?.customData, hidden: true } } : {}),
      ...(policy.disabled === true ? { inputProps: { ...original?.inputProps, disabled: true } } : {}),
    };
  }
  return result;
}
