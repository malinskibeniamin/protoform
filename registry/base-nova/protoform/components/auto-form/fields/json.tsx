'use client';

import { getProtoFieldCustomData } from '@/registry/base-nova/protoform/lib/protobuf-provider/provider';
import type { AutoFormFieldProps } from '../core-types';
import { getProtoJsonSchema } from '../proto/conversion';
import type { FieldTypeDefinition } from '../registry';
import { JSONField } from '../ui-components';
import { builtInFieldMetadata } from './metadata';
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
  ...builtInFieldMetadata.json,
  component: JsonFieldComponent,
};
