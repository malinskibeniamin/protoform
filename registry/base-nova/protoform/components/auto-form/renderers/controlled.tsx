'use client';

import React from 'react';
import { useAutoFormRenderContext, useAutoFormRuntimeContext } from '../context';
import type { AutoFormFieldProps, ParsedField } from '../core-types';
import { useAutoFormEngine } from '../engine';
import { getAutoFormFieldTestId } from '../test-ids';
import { getRenderedLabel, useFieldPresentation } from './shared';

export function ControlledFieldRenderer({
  field,
  path,
  renderType,
  inheritedDisabled = false,
}: {
  field: ParsedField;
  path: string[];
  renderType?: string;
  inheritedDisabled?: boolean;
}) {
  const { formComponents, uiComponents } = useAutoFormRenderContext();
  const { FieldController } = useAutoFormEngine();
  const fullPath = path.join('.');
  const label = getRenderedLabel(field);
  const {
    isVisible,
    renderField,
    renderType: inferredRenderType,
  } = useFieldPresentation(field, path, inheritedDisabled);
  const { testIdPrefix } = useAutoFormRuntimeContext();

  if (!isVisible) {
    return null;
  }

  const resolvedRenderType = renderType ?? inferredRenderType;
  const FieldWrapperComponent = field.fieldConfig?.fieldWrapper || uiComponents.FieldWrapper;
  const FieldComponent = (formComponents[resolvedRenderType] ??
    formComponents[renderField.type] ??
    formComponents.fallback) as React.ComponentType<AutoFormFieldProps>;

  return (
    <FieldController name={fullPath}>
      {(controller) => {
        const error = controller.errors.join('\n') || undefined;
        return (
          <FieldWrapperComponent error={error} field={renderField} id={fullPath} label={label}>
            <FieldComponent
              error={error}
              field={renderField}
              id={fullPath}
              inputProps={{
                ...renderField.fieldConfig?.inputProps,
                name: controller.name,
                onBlur: controller.onBlur,
                onValueChange: controller.onChange,
                ref: controller.ref,
                required: renderField.required,
                testId: getAutoFormFieldTestId(testIdPrefix, path, 'control'),
                value: controller.value,
              }}
              label={label}
              path={path}
              value={controller.value}
            />
          </FieldWrapperComponent>
        );
      }}
    </FieldController>
  );
}
