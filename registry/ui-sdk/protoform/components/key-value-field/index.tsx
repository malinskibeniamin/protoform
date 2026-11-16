'use client';

import { Button } from '@/components/ui/sdk/button/index';
import { OptionCombobox, type OptionComboboxProps } from '@/components/ui/sdk/combobox/index';
import { Input, type InputProps } from '@/components/ui/sdk/input/index';
import {
  type KeyValueFieldControls,
  KeyValueField as KeyValueFieldRenderer,
  type KeyValueFieldRenderProps,
  type KeyValueFieldProps as RendererProps,
} from '@/components/ui/shared/key-value-field';

type InputFieldConfig = { mode?: 'input' } & Omit<InputProps, 'value' | 'onChange' | 'disabled' | 'aria-invalid'>;
type ComboboxFieldConfig = { mode: 'combobox' } & Omit<OptionComboboxProps, 'value' | 'onChange' | 'disabled'>;
export type KeyValueFieldConfig = InputFieldConfig | ComboboxFieldConfig;

function FieldRenderer({
  config: providedConfig,
  placeholder,
  value,
  onChange,
  disabled,
  isInvalid,
  testId,
}: KeyValueFieldRenderProps<KeyValueFieldConfig>) {
  const config = providedConfig ?? { placeholder };
  if (config.mode === 'combobox') {
    const { mode: _m, ...comboboxProps } = config;
    return <OptionCombobox {...comboboxProps} disabled={disabled} onChange={onChange} testId={testId} value={value} />;
  }

  const { mode: _, ...inputProps } = config;
  return (
    <Input
      {...inputProps}
      aria-invalid={isInvalid}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      testId={testId}
      value={value}
    />
  );
}

const controls = { Button, Field: FieldRenderer } satisfies KeyValueFieldControls<KeyValueFieldConfig>;
export type KeyValueFieldProps = RendererProps<KeyValueFieldConfig>;
export function KeyValueField(props: KeyValueFieldProps) {
  return <KeyValueFieldRenderer {...props} controls={controls} />;
}
export type { KeyValueFieldError, KeyValuePair } from '@/components/ui/shared/key-value-field';
