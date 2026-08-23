"use client";

import { TrashIcon } from "lucide-react";
import React from "react";
import { formatProtoformMessage } from "../../../lib/core/messages";
import { Button } from "../../button";
import { useAutoFormRenderContext, useAutoFormRuntimeContext } from "../context";
import type { ParsedField } from "../core-types";
import { type AutoFormArrayController, useAutoFormEngine } from "../engine";
import { formSpacing } from "../form-spacing";
import { createEmptyFieldValue, getFieldErrorMessage } from "../helpers";
import { FormDepthProvider, useFormDepth } from "../layout-context";
import { getAutoFormCollectionRemoveTestId, getAutoFormCollectionRowTestId, getAutoFormFieldTestId } from "../test-ids";
import { AutoFormFieldRenderer } from ".";
import { cloneFieldForCompactRow, getRenderedLabel, isComplexCollectionField, useFieldPresentation } from "./shared";

const COMPACT_ROW_GRID = "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3";

function RequiredArraySeeder({
  controller,
  disabled,
  field,
  itemField,
}: {
  controller: AutoFormArrayController;
  disabled: boolean;
  field: ParsedField;
  itemField: ParsedField | undefined;
}) {
  const hasSeededRef = React.useRef(false);
  React.useEffect(() => {
    if (hasSeededRef.current || disabled || !field.required || controller.items.length > 0 || !itemField) {
      return;
    }
    hasSeededRef.current = true;
    controller.append(createEmptyFieldValue(itemField));
  }, [controller, disabled, field.required, itemField]);
  return null;
}

function getCollectionItemLabel(collectionLabel: string, index: number): string {
  let singularLabel = collectionLabel;
  if (collectionLabel.endsWith("ies")) {
    singularLabel = `${collectionLabel.slice(0, -3)}y`;
  } else if (collectionLabel.endsWith("s")) {
    singularLabel = collectionLabel.slice(0, -1);
  }

  return `${singularLabel} ${index + 1}`;
}

export function ArrayFieldRenderer({
  field,
  path,
  inheritedDisabled = false,
}: {
  field: ParsedField;
  path: string[];
  inheritedDisabled?: boolean;
}) {
  const { uiComponents } = useAutoFormRenderContext();
  const { ArrayController, errors } = useAutoFormEngine();
  const { formatMessage, testIdPrefix } = useAutoFormRuntimeContext();
  const fullPath = path.join(".");
  const itemField = field.schema?.[0];
  const error = getFieldErrorMessage(errors, path);
  const label = getRenderedLabel(field);
  const { isDisabled, isVisible, renderField } = useFieldPresentation(field, path, inheritedDisabled);
  const FieldWrapperComponent = field.fieldConfig?.fieldWrapper || uiComponents.FieldWrapper;
  const ArrayWrapperComponent = uiComponents.ArrayWrapper as React.ComponentType<
    React.ComponentProps<typeof uiComponents.ArrayWrapper> & {
      addButtonLabel?: string;
      addButtonTestId?: string;
      testId?: string;
    }
  >;
  const ArrayElementWrapperComponent = uiComponents.ArrayElementWrapper as React.ComponentType<
    React.ComponentProps<typeof uiComponents.ArrayElementWrapper> & {
      removeButtonAriaLabel?: string;
      removeButtonTestId?: string;
      testId?: string;
    }
  >;
  const compactItemField = itemField ? cloneFieldForCompactRow(itemField) : undefined;
  const useCompactRows = itemField ? !isComplexCollectionField(itemField) : false;
  const depth = useFormDepth();
  const addItemLabel = formatProtoformMessage(
    formatMessage,
    "auto_form.add_item",
    { label: String(label) },
    `Add ${String(label)}`
  );
  const removeItemLabel = formatProtoformMessage(formatMessage, "auto_form.remove_item", {}, "Remove item");

  if (!isVisible) {
    return null;
  }

  return (
    <FieldWrapperComponent error={error} field={renderField} id={fullPath} label={label}>
      <ArrayController name={fullPath}>
        {(controller) => (
          <>
            <RequiredArraySeeder controller={controller} disabled={isDisabled} field={field} itemField={itemField} />
            <ArrayWrapperComponent
              addButtonLabel={addItemLabel}
              addButtonTestId={getAutoFormFieldTestId(testIdPrefix, fullPath, "add")}
              field={renderField}
              label={String(label)}
              onAddItem={() => {
                if (!isDisabled) {
                  controller.append(createEmptyFieldValue(itemField));
                }
              }}
              testId={getAutoFormFieldTestId(testIdPrefix, fullPath, "items")}
            >
              {controller.items.map((item, index) => {
                const rowTestId = getAutoFormCollectionRowTestId(testIdPrefix, fullPath, index);
                const removeButtonTestId = getAutoFormCollectionRemoveTestId(testIdPrefix, fullPath, index);
                const removeItem = () => {
                  if (!isDisabled) {
                    controller.remove(index);
                  }
                };

                if (compactItemField && useCompactRows) {
                  return (
                    <div
                      className={index > 0 ? `${COMPACT_ROW_GRID} ${formSpacing.arrayItemSeparator}` : COMPACT_ROW_GRID}
                      data-testid={rowTestId}
                      key={item.key}
                    >
                      <AutoFormFieldRenderer
                        field={compactItemField}
                        inheritedDisabled={isDisabled}
                        path={[...path, String(index)]}
                      />
                      <Button
                        aria-label={removeItemLabel}
                        disabled={isDisabled}
                        onClick={removeItem}
                        size="icon-sm"
                        testId={removeButtonTestId}
                        type="button"
                        variant="ghost"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                }

                const renderedItemField = itemField
                  ? {
                      ...itemField,
                      fieldConfig: {
                        ...(itemField.fieldConfig ?? {}),
                        label: getCollectionItemLabel(label, index),
                      },
                    }
                  : undefined;

                return (
                  <ArrayElementWrapperComponent
                    index={index}
                    key={item.key}
                    onRemove={removeItem}
                    removeButtonAriaLabel={removeItemLabel}
                    removeButtonTestId={removeButtonTestId}
                    testId={rowTestId}
                  >
                    {renderedItemField ? (
                      <FormDepthProvider depth={depth + 1}>
                        <AutoFormFieldRenderer
                          field={renderedItemField}
                          inheritedDisabled={isDisabled}
                          path={[...path, String(index)]}
                        />
                      </FormDepthProvider>
                    ) : null}
                  </ArrayElementWrapperComponent>
                );
              })}
            </ArrayWrapperComponent>
          </>
        )}
      </ArrayController>
    </FieldWrapperComponent>
  );
}
