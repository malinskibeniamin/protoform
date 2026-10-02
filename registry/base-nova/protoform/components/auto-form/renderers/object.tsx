'use client';

import { useAutoFormRenderContext, useAutoFormRuntimeContext } from '../context';
import type { ParsedField } from '../core-types';
import { useAutoFormEngine } from '../engine';
import { getPathInObject } from '../field-utils';
import { getFieldErrorMessage } from '../helpers';
import { getAutoFormFieldTestId } from '../test-ids';
import { Text } from '../ui-components';
import { AutoFormFieldRenderer } from '.';
import { getRenderedLabel, useFieldPresentation } from './shared';

export function ObjectFieldRenderer({
  field,
  path,
  inheritedDisabled = false,
}: {
  field: ParsedField;
  path: string[];
  inheritedDisabled?: boolean;
}) {
  const { uiComponents } = useAutoFormRenderContext();
  const { errors } = useAutoFormEngine();
  const fullPath = path.join('.');
  const error = getFieldErrorMessage(errors, path);
  const label = getRenderedLabel(field);
  const { isVisible, renderField } = useFieldPresentation(field, path, inheritedDisabled);
  const { testIdPrefix } = useAutoFormRuntimeContext();

  const errorAtPath = getPathInObject(errors as Record<string, unknown>, path);
  const hasDescendantError = errorAtPath !== undefined && errorAtPath !== null && typeof errorAtPath === 'object';
  const hasError = Boolean(error) || hasDescendantError;

  if (!isVisible) {
    return null;
  }

  const ObjectWrapperComponent = uiComponents.ObjectWrapper;

  return (
    <>
      <ObjectWrapperComponent field={renderField} hasError={hasError} label={label}>
        {(renderField.schema ?? []).map((subField) => (
          <AutoFormFieldRenderer
            field={subField}
            inheritedDisabled={Boolean(renderField.fieldConfig?.inputProps?.['disabled'])}
            key={`${path.join('.')}.${subField.key}`}
            path={[...path, subField.key]}
          />
        ))}
      </ObjectWrapperComponent>
      {error ? (
        <Text
          className="whitespace-pre-wrap text-destructive"
          data-testid={getAutoFormFieldTestId(testIdPrefix, fullPath, 'error')}
          variant="small"
        >
          {error}
        </Text>
      ) : null}
    </>
  );
}
