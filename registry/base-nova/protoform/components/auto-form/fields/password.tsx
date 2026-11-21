'use client';

import type { AutoFormFieldProps } from '../core-types';
import { getFieldUiConfig } from '../helpers';
import type { FieldTypeDefinition } from '../registry';
import { builtInFieldMetadata } from './metadata';
import { StringLikeInput, useFieldTestIds } from './shared';

function PasswordFieldComponent(props: AutoFormFieldProps) {
  const testIds = useFieldTestIds(props.id);

  return (
    <StringLikeInput
      error={props.error}
      id={props.id}
      inputProps={props.inputProps}
      placeholder={getFieldUiConfig(props.field).placeholder}
      testId={testIds.control}
      type="password"
    />
  );
}

export { PasswordFieldComponent };

export const passwordFieldDefinition: FieldTypeDefinition = {
  ...builtInFieldMetadata.password,
  component: PasswordFieldComponent,
};
