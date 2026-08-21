import React from "react";

import { useAutoFormRuntimeContext } from "../context";
import type { ParsedField } from "../core-types";
import { getFieldHints } from "../core-types";
import { getLabel, getPathInObject } from "../field-utils";
import { getFieldUiConfig, resolveRenderFieldType } from "../helpers";
import type { DeprecatedFieldPolicy } from "../types";

export function isDeprecatedField(field: ParsedField): boolean {
  return getFieldHints(field)?.deprecated === true;
}

export function isFieldHidden(field: ParsedField, policy: DeprecatedFieldPolicy): boolean {
  const customData = (field.fieldConfig?.customData ?? {}) as Record<string, unknown>;
  return Boolean(customData["hidden"]) || (policy === "hide" && isDeprecatedField(field));
}

export function cloneFieldWithDisabled(field: ParsedField, disabled: boolean): ParsedField {
  if (!disabled) {
    return field;
  }

  return {
    ...field,
    fieldConfig: {
      ...(field.fieldConfig ?? {}),
      inputProps: {
        ...(field.fieldConfig?.inputProps ?? {}),
        disabled: true,
      },
    },
  };
}

export function useFieldPresentation(field: ParsedField, path: string[], inheritedDisabled = false) {
  const { deprecatedFields, formValues, evaluateRules } = useAutoFormRuntimeContext();
  const fieldValue = getPathInObject(formValues, path);
  const uiConfig = getFieldUiConfig(field);
  const customData = (field.fieldConfig?.customData ?? {}) as Record<string, unknown>;
  const isHidden = isFieldHidden(field, deprecatedFields);
  const isImmutable = Boolean(customData["immutable"]);
  const isVisible = !isHidden && evaluateRules(uiConfig.visibleWhen, fieldValue);
  const isDisabledByRule = uiConfig.disabledWhen?.length ? evaluateRules(uiConfig.disabledWhen, fieldValue) : false;
  const isDisabled =
    inheritedDisabled ||
    isDisabledByRule ||
    isImmutable ||
    (deprecatedFields === "disable" && isDeprecatedField(field));
  const renderField = React.useMemo(() => cloneFieldWithDisabled(field, isDisabled), [field, isDisabled]);

  return {
    fieldValue,
    isDisabled,
    isVisible,
    renderField,
    renderType: resolveRenderFieldType(field),
  };
}

export function cloneFieldForCompactRow(field: ParsedField): ParsedField {
  const label = String(getLabel(field));

  const existingCustomData = (field.fieldConfig?.customData ?? {}) as Record<string, unknown>;
  const existingUi = (existingCustomData["ui"] ?? {}) as Record<string, unknown>;

  return {
    ...field,
    fieldConfig: {
      ...(field.fieldConfig ?? {}),
      customData: {
        ...existingCustomData,
        compactRow: true,
        ui: {
          ...existingUi,
          example: "",
          help: "",
        },
      },
      description: "",
      inputProps: {
        ...(field.fieldConfig?.inputProps ?? {}),
        placeholder:
          (field.fieldConfig?.inputProps?.["placeholder"] as string | undefined) ||
          (field.type === "select" || field.type === "boolean" ? undefined : label),
      },
      label: "",
    },
  };
}

export function getRenderedLabel(field: ParsedField): string {
  if (typeof field.fieldConfig?.label === "string") {
    return field.fieldConfig.label;
  }

  return String(getLabel(field));
}

export function isComplexCollectionField(field: ParsedField | undefined): boolean {
  if (!field) {
    return false;
  }

  const renderType = resolveRenderFieldType(field);
  return ["object", "array", "map", "oneof", "json"].includes(renderType);
}
