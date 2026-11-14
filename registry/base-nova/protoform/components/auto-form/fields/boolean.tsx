'use client';

import type { AutoFormFieldProps } from '../core-types';
import type { FieldTypeDefinition } from '../registry';
import {
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Toggle,
} from '../ui-components';
import { builtInFieldMetadata } from './metadata';
import { getControlLabel, useFieldTestIds } from './shared';

function BooleanFieldComponent({ error, field, id, inputProps, label }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);
  const fieldLabel = getControlLabel(label, field);

  return (
    <Select
      items={[
        { label: 'Not set', value: null },
        { label: 'True', value: 'true' },
        { label: 'False', value: 'false' },
      ]}
      onValueChange={(value) => {
        if (value === null) {
          inputProps['onValueChange'](undefined);
          return;
        }
        inputProps['onValueChange'](value === 'true');
      }}
      value={inputProps['value'] === undefined ? null : String(Boolean(inputProps['value']))}
    >
      <SelectTrigger
        aria-invalid={Boolean(error)}
        aria-label={fieldLabel}
        className={error !== undefined && error !== '' ? 'border-destructive' : ''}
        disabled={inputProps['disabled']}
        id={id}
        testId={testIds.control}
      >
        <SelectValue placeholder="Choose a value" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem testId={testIds.option('not-set')} value={null}>
          Not set
        </SelectItem>
        <SelectItem testId={testIds.option('true')} value="true">
          True
        </SelectItem>
        <SelectItem testId={testIds.option('false')} value="false">
          False
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

function CheckboxFieldComponent({ error, field, id, inputProps, label }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);

  return (
    <div className="flex min-h-9 items-center">
      <Checkbox
        aria-invalid={Boolean(error)}
        aria-label={getControlLabel(label, field)}
        checked={Boolean(inputProps['value'])}
        disabled={inputProps['disabled']}
        id={id}
        onCheckedChange={(checked) => inputProps['onValueChange'](Boolean(checked))}
        testId={testIds.control}
      />
    </div>
  );
}

function SwitchFieldComponent({ error, field, id, inputProps, label }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);

  return (
    <div className="flex min-h-9 items-center">
      <Switch
        aria-invalid={Boolean(error)}
        aria-label={getControlLabel(label, field)}
        checked={Boolean(inputProps['value'])}
        disabled={inputProps['disabled']}
        id={id}
        onCheckedChange={(checked) => inputProps['onValueChange'](Boolean(checked))}
        testId={testIds.control}
      />
    </div>
  );
}

function ToggleFieldComponent({ error, field, id, inputProps, label }: AutoFormFieldProps) {
  const testIds = useFieldTestIds(id);
  const isOn = Boolean(inputProps['value']);

  return (
    <div className="flex min-h-9 items-center gap-3" data-testid={testIds.control}>
      <Switch
        aria-invalid={Boolean(error)}
        aria-label={getControlLabel(label, field)}
        checked={Boolean(inputProps['value'])}
        disabled={inputProps['disabled']}
        id={id}
        onCheckedChange={(checked) => inputProps['onValueChange'](Boolean(checked))}
        testId={testIds.controlPart('switch')}
      />
      <Toggle
        aria-hidden
        className="pointer-events-none"
        pressed={Boolean(inputProps['value'])}
        size="sm"
        variant="outline"
      >
        {isOn ? 'On' : 'Off'}
      </Toggle>
    </div>
  );
}

export { BooleanFieldComponent, CheckboxFieldComponent, SwitchFieldComponent, ToggleFieldComponent };

export const booleanFieldDefinition: FieldTypeDefinition = {
  ...builtInFieldMetadata.boolean,
  component: BooleanFieldComponent,
};

export const checkboxFieldDefinition: FieldTypeDefinition = {
  ...builtInFieldMetadata.checkbox,
  component: CheckboxFieldComponent,
};

export const switchFieldDefinition: FieldTypeDefinition = {
  ...builtInFieldMetadata.switch,
  component: SwitchFieldComponent,
};
