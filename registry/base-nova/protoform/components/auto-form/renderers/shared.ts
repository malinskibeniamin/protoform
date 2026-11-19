import React from 'react';
import { getFieldHints } from '@/registry/base-nova/protoform/lib/core/field-model';
import { useAutoFormRuntimeContext } from '../context';
import type { ParsedField } from '../core-types';
import { getLabel, getPathInObject } from '../field-utils';
import { getFieldUiConfig, isRecord, resolveRenderFieldType } from '../helpers';
import type { DeprecatedFieldPolicy } from '../types';

export function isDeprecatedField(field: ParsedField) {
  return getFieldHints(field)?.deprecated === true;
}

export function isFieldHidden(field: ParsedField, policy: DeprecatedFieldPolicy) {
  const customData = (field.fieldConfig?.customData ?? {}) as Record<string, unknown>;
  return Boolean(customData['hidden']) || (policy === 'hide' && isDeprecatedField(field));
}

export function cloneFieldWithDisabled(field: ParsedField, disabled: boolean) {
  if (!disabled) {
    return field;
  }

  return {
    ...field,
    fieldConfig: {
      ...field.fieldConfig,
      inputProps: {
        ...field.fieldConfig?.inputProps,
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
  const isImmutable = Boolean(customData['immutable']);
  const isVisible = !isHidden && evaluateRules(uiConfig.visibleWhen, fieldValue);
  const isDisabledByRule =
    uiConfig.disabledWhen && uiConfig.disabledWhen.length > 0
      ? evaluateRules(uiConfig.disabledWhen, fieldValue)
      : false;
  const isDisabled =
    inheritedDisabled ||
    isDisabledByRule ||
    isImmutable ||
    (deprecatedFields === 'disable' && isDeprecatedField(field));
  const renderField = React.useMemo(() => cloneFieldWithDisabled(field, isDisabled), [field, isDisabled]);

  return {
    fieldValue,
    isDisabled,
    isVisible,
    renderField,
    renderType: resolveRenderFieldType(field),
  };
}

export function cloneFieldForCompactRow(field: ParsedField) {
  const label = getLabel(field);

  const existingCustomData = (field.fieldConfig?.customData ?? {}) as Record<string, unknown>;
  const existingUi = isRecord(existingCustomData['ui']) ? existingCustomData['ui'] : {};
  const value = field.fieldConfig?.inputProps?.['placeholder'];
  const placeholder = typeof value === 'string' ? value : undefined;
  const fallbackPlaceholder = field.type === 'select' || field.type === 'boolean' ? undefined : label;

  const compactField: ParsedField = {
    ...field,
    fieldConfig: {
      ...field.fieldConfig,
      customData: {
        ...existingCustomData,
        compactRow: true,
        ui: {
          ...existingUi,
          example: '',
          help: '',
        },
      },
      description: '',
      inputProps: {
        ...field.fieldConfig?.inputProps,
        placeholder: placeholder !== undefined && placeholder !== '' ? placeholder : fallbackPlaceholder,
      },
      label: '',
    },
  };
  return compactField;
}

export function getRenderedLabel(field: ParsedField) {
  if (typeof field.fieldConfig?.label === 'string') {
    return field.fieldConfig.label;
  }

  return getLabel(field);
}

export function isComplexCollectionField(field: ParsedField | undefined) {
  if (!field) {
    return false;
  }

  const renderType = resolveRenderFieldType(field);
  return ['object', 'array', 'map', 'oneof', 'json'].includes(renderType);
}
