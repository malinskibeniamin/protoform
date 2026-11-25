'use client';

import { MailIcon } from 'lucide-react';
import type { AutoFormFieldProps } from '../core-types';
import { getFieldUiConfig } from '../helpers';
import type { FieldTypeDefinition } from '../registry';
import { builtInFieldMetadata } from './metadata';
import { StringLikeInput, useFieldTestIds } from './shared';

function EmailFieldComponent(props: AutoFormFieldProps) {
  const testIds = useFieldTestIds(props.id);

  return (
    <StringLikeInput
      error={props.error}
      icon={<MailIcon className="size-4" />}
      id={props.id}
      inputProps={props.inputProps}
      placeholder={getFieldUiConfig(props.field).placeholder}
      testId={testIds.control}
      type="email"
    />
  );
}

export { EmailFieldComponent };

export const emailFieldDefinition: FieldTypeDefinition = {
  ...builtInFieldMetadata.email,
  component: EmailFieldComponent,
};
