'use client';

import { DollarSignIcon } from 'lucide-react';
import type { AutoFormFieldProps } from '../core-types';
import { getFieldUiConfig } from '../helpers';
import type { FieldTypeDefinition } from '../registry';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '../ui-components';
import { builtInFieldMetadata } from './metadata';
import { useFieldTestIds } from './shared';

function CurrencyFieldComponent({ error, field, id, inputProps }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);

  return (
    <InputGroup testId={testIds.control}>
      <InputGroupAddon>
        <InputGroupText>
          <DollarSignIcon className="size-4" />
        </InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        aria-invalid={Boolean(error)}
        disabled={inputProps['disabled']}
        id={id}
        inputMode="decimal"
        onBlur={inputProps['onBlur']}
        onChange={(event) => inputProps['onValueChange'](event.target.value)}
        placeholder={getFieldUiConfig(field).placeholder}
        testId={testIds.controlPart('input')}
        value={
          typeof inputProps['value'] === 'string' || typeof inputProps['value'] === 'number'
            ? String(inputProps['value'])
            : ''
        }
      />
    </InputGroup>
  );
}

export { CurrencyFieldComponent };

export const currencyFieldDefinition: FieldTypeDefinition = {
  ...builtInFieldMetadata.currency,
  component: CurrencyFieldComponent,
};
