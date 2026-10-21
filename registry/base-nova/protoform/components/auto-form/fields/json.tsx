'use client';

import type { AutoFormFieldProps } from '../core-types';
import { getProtoFieldCustomData, getProtoJsonSchema } from '../proto';
import type { FieldTypeDefinition } from '../registry';
import { JSONField } from '../ui-components';
import { useFieldTestIds } from './shared';

function JsonFieldComponent({ field, id, inputProps, label }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);
  const emptyValue = getProtoFieldCustomData(field)?.jsonKind === 'listValue' ? [] : {};

  return (
    <JSONField
      id={id}
      label={typeof label === 'string' ? label : field.key}
      maxDepth={3}
      onBlur={inputProps['onBlur']}
      onChange={(value) => inputProps['onValueChange'](value)}
      schema={getProtoJsonSchema(field)}
      showPlaceholder={false}
      testId={testIds.control}
      value={inputProps['value'] === undefined ? emptyValue : inputProps['value']}
    />
  );
}

export { JsonFieldComponent };

export const jsonFieldDefinition: FieldTypeDefinition = {
  component: JsonFieldComponent,
  match: (field) => field.type === 'json',
  name: 'json',
  priority: 10,
};
