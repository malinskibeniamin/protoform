"use client";

import type React from "react";
import { useAutoFormRenderContext, useAutoFormRuntimeContext } from "../context";
import type { AutoFormFieldProps, ParsedField } from "../core-types";
import { useAutoFormEngine } from "../engine";
import { getAutoFormFieldTestId } from "../test-ids";
import { getRenderedLabel, useFieldPresentation } from "./shared";

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
  const fullPath = path.join(".");
  const label = getRenderedLabel(field);
  const {
    isVisible,
    renderField,
    renderType: inferredRenderType,
  } = useFieldPresentation(field, path, inheritedDisabled);
  const { fieldRegistry, testIdPrefix } = useAutoFormRuntimeContext();

  if (!isVisible) {
    return null;
  }

  const resolvedRenderType = renderType ?? inferredRenderType;
  const FieldWrapperComponent = field.fieldConfig?.fieldWrapper || uiComponents.FieldWrapper;
  const registeredComponent =
    formComponents[resolvedRenderType] ??
    fieldRegistry?.list().find((definition) => definition.name === resolvedRenderType)?.component;
  const FieldComponent = (registeredComponent ?? formComponents.fallback) as React.ComponentType<AutoFormFieldProps>;
  const componentField = registeredComponent
    ? renderField
    : {
        ...renderField,
        type: resolvedRenderType,
      };

  return (
    <FieldController name={fullPath}>
      {(controller) => {
        const error = controller.errors.join("\n") || undefined;
        return (
          <FieldWrapperComponent error={error} field={renderField} id={fullPath} label={label}>
            <FieldComponent
              error={error}
              field={componentField}
              id={fullPath}
              inputProps={{
                ...renderField.fieldConfig?.inputProps,
                name: controller.name,
                onBlur: controller.onBlur,
                onChange: controller.onChange,
                onCheckedChange: controller.onChange,
                onValueChange: controller.onChange,
                ref: controller.ref,
                required: renderField.required,
                testId: getAutoFormFieldTestId(testIdPrefix, path, "control"),
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
