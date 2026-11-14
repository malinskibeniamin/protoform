'use client';

import type { AutoFormFieldProps } from '../core-types';
import { getFieldUiConfig } from '../helpers';
import type { FieldTypeDefinition } from '../registry';
import { Textarea } from '../ui-components';
import { builtInFieldMetadata } from './metadata';
import { useFieldTestIds } from './shared';

function TextareaFieldComponent({ error, field, id, inputProps }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);

  return (
    <Textarea
      aria-invalid={Boolean(error)}
      className={error !== undefined && error !== '' ? 'border-destructive' : ''}
      disabled={inputProps['disabled']}
      id={id}
      onBlur={inputProps['onBlur']}
      onChange={(event) => inputProps['onValueChange'](event.target.value)}
      placeholder={getFieldUiConfig(field).placeholder}
      resize="vertical"
      testId={testIds.control}
      value={typeof inputProps['value'] === 'string' ? inputProps['value'] : ''}
    />
  );
}

export { TextareaFieldComponent };

export const textareaFieldDefinition: FieldTypeDefinition = {
  ...builtInFieldMetadata.textarea,
  component: TextareaFieldComponent,
};
