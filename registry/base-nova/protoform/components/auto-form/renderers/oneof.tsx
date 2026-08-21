"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../select";
import { useAutoFormRenderContext, useAutoFormRuntimeContext } from "../context";
import type { ParsedField } from "../core-types";
import { useAutoFormEngine } from "../engine";
import { getLabel, getPathInObject } from "../field-utils";
import { formSpacing } from "../form-spacing";
import { createEmptyFieldValue, getFieldErrorMessage, getFieldUiConfig } from "../helpers";
import { FormDepthProvider, useFormDepth } from "../layout-context";
import { getAutoFormFieldTestId } from "../test-ids";
import { AutoFormFieldRenderer } from ".";
import { getRenderedLabel, isDeprecatedField, isFieldHidden, useFieldPresentation } from "./shared";

export function OneofFieldRenderer({
  field,
  path,
  inheritedDisabled = false,
}: {
  field: ParsedField;
  path: string[];
  inheritedDisabled?: boolean;
}) {
  const { uiComponents } = useAutoFormRenderContext();
  const { deprecatedFields, evaluateRules } = useAutoFormRuntimeContext();
  const form = useAutoFormEngine();
  const fullPath = path.join(".");
  const oneofValue = (getPathInObject(form.values, path) as { case?: string; value?: unknown } | undefined) ?? {
    case: undefined,
    value: undefined,
  };
  const error = getFieldErrorMessage(form.errors, path);
  const label = getRenderedLabel(field);
  const { isDisabled, isVisible, renderField } = useFieldPresentation(field, path, inheritedDisabled);
  const FieldWrapperComponent = field.fieldConfig?.fieldWrapper || uiComponents.FieldWrapper;
  const { testIdPrefix } = useAutoFormRuntimeContext();
  const controlTestId = getAutoFormFieldTestId(testIdPrefix, fullPath, "control");
  const depth = useFormDepth();

  const ruleVisibleFields = (field.schema ?? []).filter((candidate) => {
    const candidateUi = getFieldUiConfig(candidate);
    const candidateValue = candidate.key === oneofValue.case ? oneofValue.value : undefined;
    return evaluateRules(candidateUi.visibleWhen, candidateValue);
  });
  const availableFields = ruleVisibleFields.filter((candidate) => !isFieldHidden(candidate, deprecatedFields));

  const selectedField = availableFields.find((candidate) => candidate.key === oneofValue.case);
  const selectedSchemaField = (field.schema ?? []).find((candidate) => candidate.key === oneofValue.case);
  const selectedDeprecatedDisabled =
    deprecatedFields === "disable" && selectedSchemaField !== undefined && isDeprecatedField(selectedSchemaField);
  const oneofDisabled = isDisabled || selectedDeprecatedDisabled;
  let selectedValueLabel: string | undefined;
  if (selectedField) {
    selectedValueLabel = getLabel(selectedField);
  } else if (oneofValue.case) {
    selectedValueLabel = "Unavailable selection";
  } else if (!field.required) {
    selectedValueLabel = "Not set";
  }

  let selectedFieldContent: React.ReactNode = null;
  if (selectedField) {
    if (selectedField.type === "object" && (!selectedField.schema || selectedField.schema.length === 0)) {
      selectedFieldContent = (
        <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3">
          <p className="text-muted-foreground text-sm">
            {getLabel(selectedField)} selected. No additional configuration needed.
          </p>
        </div>
      );
    } else {
      selectedFieldContent = (
        <FormDepthProvider depth={depth + 1}>
          <AutoFormFieldRenderer field={selectedField} inheritedDisabled={oneofDisabled} path={[...path, "value"]} />
        </FormDepthProvider>
      );
    }
  }

  React.useEffect(() => {
    if (!oneofValue.case) {
      return;
    }

    const stillVisibleByRule = ruleVisibleFields.some((candidate) => candidate.key === oneofValue.case);
    if (!stillVisibleByRule) {
      form.setValue(
        fullPath,
        { case: undefined, value: undefined },
        { shouldDirty: true, shouldTouch: true, shouldValidate: true }
      );
    }
  }, [form, fullPath, oneofValue.case, ruleVisibleFields]);

  if (!isVisible) {
    return null;
  }

  return (
    <FieldWrapperComponent error={error} field={renderField} id={fullPath} label={label}>
      <div className={formSpacing.oneofStack}>
        <Select
          items={[
            ...(field.required ? [] : [{ label: "Not set", value: null }]),
            ...availableFields.map((candidate) => ({
              label: getLabel(candidate),
              value: candidate.key,
            })),
          ]}
          onValueChange={(value) => {
            if (oneofDisabled) {
              return;
            }
            if (value === null) {
              form.setValue(
                fullPath,
                { case: undefined, value: undefined },
                { shouldDirty: true, shouldValidate: true }
              );
              return;
            }
            const nextField = availableFields.find((candidate) => candidate.key === value);
            form.clearErrors([`${fullPath}.value`]);
            form.setValue(
              fullPath,
              {
                case: value,
                value: oneofValue.case === value ? oneofValue.value : createEmptyFieldValue(nextField),
              },
              { shouldDirty: true, shouldTouch: true, shouldValidate: true }
            );
          }}
          value={oneofValue.case ?? null}
        >
          <SelectTrigger aria-label={String(label)} disabled={oneofDisabled} id={fullPath} testId={controlTestId}>
            <SelectValue placeholder="Choose a field">{selectedValueLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {field.required ? null : (
              <SelectItem testId={getAutoFormFieldTestId(testIdPrefix, fullPath, "option-not-set")} value={null}>
                Not set
              </SelectItem>
            )}
            {availableFields.map((candidate) => (
              <SelectItem
                disabled={deprecatedFields === "disable" && isDeprecatedField(candidate)}
                key={candidate.key}
                testId={getAutoFormFieldTestId(testIdPrefix, fullPath, `option-${candidate.key}`)}
                value={candidate.key}
              >
                {getLabel(candidate)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedFieldContent}
      </div>
    </FieldWrapperComponent>
  );
}
