"use client";

import React from "react";
import { useAutoFormRenderContext, useAutoFormRuntimeContext } from "../context";
import type { OneofWrapperProps, ParsedField } from "../core-types";
import { useAutoFormEngine } from "../engine";
import { getLabel, getPathInObject } from "../field-utils";
import { formSpacing } from "../form-spacing";
import { createEmptyFieldValue, getFieldErrorMessage, getFieldUiConfig } from "../helpers";
import { FormDepthProvider, useFormDepth } from "../layout-context";
import { getAutoFormFieldTestId } from "../test-ids";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui-components";
import { AutoFormFieldRenderer } from ".";
import { getRenderedLabel, isDeprecatedField, isFieldHidden, useFieldPresentation } from "./shared";

function SelectedOneofField({
  field,
  path,
  disabled,
  depth,
}: {
  field: ParsedField | undefined;
  path: string[];
  disabled: boolean;
  depth: number;
}) {
  if (field) {
    if (field.type === "object" && (!field.schema || field.schema.length === 0)) {
      return (
        <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3">
          <p className="text-muted-foreground text-sm">
            {getLabel(field)} selected. No additional configuration needed.
          </p>
        </div>
      );
    }
    return (
      <FormDepthProvider depth={depth + 1}>
        <AutoFormFieldRenderer field={field} inheritedDisabled={disabled} path={[...path, "value"]} />
      </FormDepthProvider>
    );
  }

  return null;
}

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
  const { deprecatedFields, evaluateRules, testIdPrefix } = useAutoFormRuntimeContext();
  const form = useAutoFormEngine();
  const fullPath = path.join(".");
  const oneofValue = (getPathInObject(form.values, path) as { case?: string; value?: unknown } | undefined) ?? {
    case: undefined,
    value: undefined,
  };
  const error = getFieldErrorMessage(form.errors, path);
  const label = getRenderedLabel(field);
  const { isDisabled, isVisible, renderField } = useFieldPresentation(field, path, inheritedDisabled);
  const OneofWrapperComponent = uiComponents.OneofWrapper;
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

  function selectVariant(key: string | undefined) {
    if (oneofDisabled) {
      return;
    }
    if (key === undefined) {
      form.setValue(fullPath, { case: undefined, value: undefined }, { shouldDirty: true, shouldValidate: true });
      return;
    }
    const nextField = availableFields.find((candidate) => candidate.key === key);
    if (!nextField) {
      return;
    }
    form.clearErrors([`${fullPath}.value`]);
    form.setValue(
      fullPath,
      {
        case: key,
        value: oneofValue.case === key ? oneofValue.value : createEmptyFieldValue(nextField),
      },
      { shouldDirty: true, shouldTouch: true, shouldValidate: true }
    );
  }

  return (
    <OneofWrapperComponent
      disabled={oneofDisabled}
      error={error}
      field={renderField}
      id={fullPath}
      label={label}
      onSelect={selectVariant}
      renderVariant={(variant) => (
        <SelectedOneofField depth={depth} disabled={oneofDisabled} field={variant} path={path} />
      )}
      selected={selectedField}
      selectedKey={oneofValue.case}
      testId={getAutoFormFieldTestId(testIdPrefix, fullPath, "control")}
      variants={availableFields.map((candidate) => ({
        disabled: deprecatedFields === "disable" && isDeprecatedField(candidate),
        field: candidate,
        key: candidate.key,
        label: getLabel(candidate),
      }))}
    />
  );
}

/** Default oneof presentation: a variant select above the selected variant's fields. */
export function OneofWrapper({
  disabled,
  error,
  field,
  id,
  label,
  onSelect,
  renderVariant,
  selected,
  selectedKey,
  testId,
  variants,
}: OneofWrapperProps) {
  const { uiComponents } = useAutoFormRenderContext();
  const { testIdPrefix } = useAutoFormRuntimeContext();
  const FieldWrapperComponent = field.fieldConfig?.fieldWrapper ?? uiComponents.FieldWrapper;
  let selectedValueLabel: string | undefined;
  if (selected) {
    selectedValueLabel = getLabel(selected);
  } else if (selectedKey) {
    selectedValueLabel = "Unavailable selection";
  } else if (!field.required) {
    selectedValueLabel = "Not set";
  }

  return (
    <FieldWrapperComponent error={error} field={field} id={id} label={label}>
      <div className={formSpacing.oneofStack}>
        <Select
          items={[
            ...(field.required ? [] : [{ label: "Not set", value: null }]),
            ...variants.map((variant) => ({ label: variant.label, value: variant.key })),
          ]}
          onValueChange={(value) => onSelect(value ?? undefined)}
          value={selectedKey ?? null}
        >
          <SelectTrigger aria-label={label} disabled={disabled} id={id} testId={testId}>
            <SelectValue placeholder="Choose a field">{selectedValueLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {field.required ? null : (
              <SelectItem testId={getAutoFormFieldTestId(testIdPrefix, id, "option-not-set")} value={null}>
                Not set
              </SelectItem>
            )}
            {variants.map((variant) => (
              <SelectItem
                disabled={variant.disabled}
                key={variant.key}
                testId={getAutoFormFieldTestId(testIdPrefix, id, `option-${variant.key}`)}
                value={variant.key}
              >
                {variant.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selected ? renderVariant(selected) : null}
      </div>
    </FieldWrapperComponent>
  );
}
