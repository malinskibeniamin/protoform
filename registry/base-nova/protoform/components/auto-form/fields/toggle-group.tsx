'use client';

import type { AutoFormFieldProps } from '../core-types';
import type { FieldTypeDefinition } from '../registry';
import { ToggleGroup, ToggleGroupItem } from '../ui-components';
import { builtInFieldMetadata } from './metadata';
import { getControlLabel, getFlatOptions, hasNumericOptions, renderOptionLabel, useFieldTestIds } from './shared';

function ToggleGroupFieldComponent({ error, field, id, inputProps, label }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);
  const numericOptions = hasNumericOptions(field);
  const value = inputProps['value'] === undefined || inputProps['value'] === null ? '' : String(inputProps['value']);
  const options = getFlatOptions(field);

  return (
    <ToggleGroup
      aria-invalid={Boolean(error)}
      aria-label={getControlLabel(label, field)}
      onValueChange={(nextValue) => inputProps['onValueChange'](numericOptions ? Number(nextValue) : nextValue)}
      testId={testIds.control}
      type="single"
      value={value}
      variant="outline"
    >
      {options.map((option) => (
        <ToggleGroupItem
          disabled={inputProps['disabled']}
          key={option.value}
          testId={testIds.option(option.value)}
          value={option.value}
        >
          {renderOptionLabel(option)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export { ToggleGroupFieldComponent };

export const toggleGroupFieldDefinition: FieldTypeDefinition = {
  ...builtInFieldMetadata.toggleGroup,
  component: ToggleGroupFieldComponent,
};
