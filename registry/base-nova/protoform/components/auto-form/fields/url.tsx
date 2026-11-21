'use client';

import { Link2Icon } from 'lucide-react';
import type { AutoFormFieldProps } from '../core-types';
import { getFieldUiConfig } from '../helpers';
import type { FieldTypeDefinition } from '../registry';
import { builtInFieldMetadata } from './metadata';
import { StringLikeInput, useFieldTestIds } from './shared';

function UrlFieldComponent(props: AutoFormFieldProps) {
  const testIds = useFieldTestIds(props.id);

  const { placeholder } = getFieldUiConfig(props.field);

  return (
    <StringLikeInput
      error={props.error}
      icon={<Link2Icon className="size-4" />}
      id={props.id}
      inputProps={props.inputProps}
      placeholder={placeholder !== undefined && placeholder !== '' ? placeholder : 'https://'}
      testId={testIds.control}
      type="url"
    />
  );
}

export { UrlFieldComponent };

export const urlFieldDefinition: FieldTypeDefinition = {
  ...builtInFieldMetadata.url,
  component: UrlFieldComponent,
};
