'use client';

import { TrashIcon } from 'lucide-react';
import React from 'react';
import { Button } from '../../button';
import { useAutoFormRenderContext, useAutoFormRuntimeContext } from '../context';
import type { ParsedField } from '../core-types';
import { useAutoFormEngine } from '../engine';
import { formSpacing } from '../form-spacing';
import { createEmptyFieldValue, getFieldErrorMessage } from '../helpers';
import { getAutoFormCollectionRemoveTestId, getAutoFormCollectionRowTestId, getAutoFormFieldTestId } from '../test-ids';
import { AutoFormFieldRenderer } from './index';
import { cloneFieldForCompactRow, getRenderedLabel, isComplexCollectionField, useFieldPresentation } from './shared';

const COMPACT_PAIR_GRID = 'grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-3';
const KEY_REMOVE_GRID = 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3';

export function MapFieldRenderer({
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
  const { testIdPrefix } = useAutoFormRuntimeContext();
  const fullPath = path.join('.');
  const keyField = field.schema?.[0];
  const valueField = field.schema?.[1];
  const error = getFieldErrorMessage(errors, path);
  const label = getRenderedLabel(field);
  const { isDisabled, isVisible, renderField } = useFieldPresentation(field, path, inheritedDisabled);
  const FieldWrapperComponent = field.fieldConfig?.fieldWrapper || uiComponents.FieldWrapper;
  const ArrayWrapperComponent = uiComponents.ArrayWrapper as React.ComponentType<
    React.ComponentProps<typeof uiComponents.ArrayWrapper> & {
      addButtonTestId?: string;
      testId?: string;
    }
  >;
  const compactKeyField = keyField ? cloneFieldForCompactRow(keyField) : undefined;
  const compactValueField = valueField ? cloneFieldForCompactRow(valueField) : undefined;
  const valueIsComplex = isComplexCollectionField(valueField);

  if (!isVisible) {
    return null;
  }

  return (
    <FieldWrapperComponent error={error} field={renderField} id={fullPath} label={label}>
      <ArrayController name={fullPath}>
        {(controller) => (
          <ArrayWrapperComponent
            addButtonTestId={getAutoFormFieldTestId(testIdPrefix, fullPath, 'add')}
            field={renderField}
            label={String(label)}
            onAddItem={() => {
              if (!isDisabled) {
                controller.append({ key: '', value: createEmptyFieldValue(valueField) });
              }
            }}
            testId={getAutoFormFieldTestId(testIdPrefix, fullPath, 'items')}
          >
            {controller.items.map((item, index) => {
              const rowTestId = getAutoFormCollectionRowTestId(testIdPrefix, fullPath, index);
              const removeButtonTestId = getAutoFormCollectionRemoveTestId(testIdPrefix, fullPath, index);
              const removeEntry = () => {
                if (!isDisabled) {
                  controller.remove(index);
                }
              };

              if (compactKeyField && compactValueField && !valueIsComplex) {
                return (
                  <div
                    className={index > 0 ? `${COMPACT_PAIR_GRID} ${formSpacing.arrayItemSeparator}` : COMPACT_PAIR_GRID}
                    data-testid={rowTestId}
                    key={item.key}
                  >
                    <AutoFormFieldRenderer
                      field={compactKeyField}
                      inheritedDisabled={isDisabled}
                      path={[...path, String(index), 'key']}
                    />
                    <AutoFormFieldRenderer
                      field={compactValueField}
                      inheritedDisabled={isDisabled}
                      path={[...path, String(index), 'value']}
                    />
                    <Button
                      aria-label="Remove item"
                      disabled={isDisabled}
                      onClick={removeEntry}
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

              return (
                <div
                  className={
                    index > 0
                      ? `${formSpacing.collectionRow} ${formSpacing.arrayItemSeparator}`
                      : formSpacing.collectionRow
                  }
                  data-testid={rowTestId}
                  key={item.key}
                >
                  <div className={KEY_REMOVE_GRID}>
                    {compactKeyField ? (
                      <AutoFormFieldRenderer
                        field={compactKeyField}
                        inheritedDisabled={isDisabled}
                        path={[...path, String(index), 'key']}
                      />
                    ) : null}
                    <Button
                      aria-label="Remove item"
                      disabled={isDisabled}
                      onClick={removeEntry}
                      size="icon-sm"
                      testId={removeButtonTestId}
                      type="button"
                      variant="ghost"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {valueField ? (
                    <AutoFormFieldRenderer
                      field={compactValueField ?? valueField}
                      inheritedDisabled={isDisabled}
                      path={[...path, String(index), 'value']}
                    />
                  ) : null}
                </div>
              );
            })}
          </ArrayWrapperComponent>
        )}
      </ArrayController>
    </FieldWrapperComponent>
  );
}
