'use client';

import { getProtoFieldCustomData } from '@/registry/base-nova/protoform/lib/protobuf-provider/provider';
import type { AutoFormFieldProps } from '../core-types';
import {
  denormalizeKeyValueEntries,
  getFieldUiConfig,
  normalizeKeyValueEntries,
  resolveRenderFieldType,
} from '../helpers';
import type { FieldTypeDefinition } from '../registry';
import { KeyValueField } from '../ui-components';
import { builtInFieldMetadata } from './metadata';
import { useFieldTestIds } from './shared';

function KeyValueFieldComponent({ field, id, inputProps }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);
  const valueField =
    field.type === 'map'
      ? field.schema?.[1]
      : field.schema?.[0]?.schema?.find((candidate) => candidate.key === 'value');
  const valueRenderType = valueField ? resolveRenderFieldType(valueField) : undefined;
  const protoData = getProtoFieldCustomData(field);

  const configuredPlaceholder = getFieldUiConfig(valueField ?? field).placeholder;
  const placeholder =
    configuredPlaceholder !== undefined && configuredPlaceholder !== '' ? configuredPlaceholder : 'Value';
  const valueFieldProps =
    valueRenderType === 'select' || valueRenderType === 'combobox' || valueRenderType === 'radio'
      ? {
          mode: 'combobox' as const,
          options: (valueField?.options ?? []).map(([value, optionLabel]) => ({ label: optionLabel, value })),
          placeholder,
        }
      : {
          placeholder,
        };

  return (
    <KeyValueField
      addButtonLabel="Add pair"
      disabled={inputProps['disabled']}
      keyFieldProps={{ placeholder: 'Key' }}
      maxItems={protoData?.maxPairs}
      onChange={(entries) => inputProps['onValueChange'](denormalizeKeyValueEntries(entries, field))}
      showAddButton
      testId={testIds.control}
      value={normalizeKeyValueEntries(inputProps['value'])}
      valueFieldProps={valueFieldProps}
    />
  );
}

export { KeyValueFieldComponent };

export const keyValueFieldDefinition: FieldTypeDefinition = {
  ...builtInFieldMetadata.keyValue,
  component: KeyValueFieldComponent,
};
