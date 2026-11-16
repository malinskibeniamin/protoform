'use client';

import { Plus, X } from 'lucide-react';
import { type ReactNode, useId, useRef } from 'react';
import { Button } from '@/components/ui/sdk/button/index';
import { OptionCombobox, type OptionComboboxProps } from '@/components/ui/sdk/combobox/index';
import { Input, type InputProps } from '@/components/ui/sdk/input/index';
import { KeyValueLayout, KeyValueRowLayout } from '@/registry/base-nova/protoform/components/control-layouts';
import { findDuplicateIndices, useInputListFocus } from '@/registry/base-nova/protoform/lib/input-utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

const DEFAULT_KEY_FIELD_PROPS = { placeholder: 'Key' };

const DEFAULT_VALUE_FIELD_PROPS = { placeholder: 'Value' };

export interface KeyValuePair {
  key: string;
  value: string;
}

const EMPTY_KEY_VALUE_PAIRS: KeyValuePair[] = [];

type InputFieldConfig = { mode?: 'input' } & Omit<InputProps, 'value' | 'onChange' | 'disabled' | 'aria-invalid'>;
type ComboboxFieldConfig = { mode: 'combobox' } & Omit<OptionComboboxProps, 'value' | 'onChange' | 'disabled'>;
export type KeyValueFieldConfig = InputFieldConfig | ComboboxFieldConfig;

export interface KeyValueFieldError {
  key?: string | undefined;
  value?: string | undefined;
}

export interface KeyValueFieldProps extends SharedProps {
  addButtonLabel?: string;
  description?: ReactNode;
  disabled?: boolean | undefined;
  errors?: Array<KeyValueFieldError | undefined>;
  keyFieldProps?: KeyValueFieldConfig;
  label?: ReactNode;
  maxItems?: number | undefined;
  onChange?: (value: KeyValuePair[]) => void;
  showAddButton?: boolean;
  value?: KeyValuePair[];
  valueFieldProps?: KeyValueFieldConfig;
}

function FieldRenderer({
  config,
  value,
  onChange,
  disabled,
  isInvalid,
  testId,
}: {
  config: KeyValueFieldConfig;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean | undefined;
  isInvalid: boolean;
  testId?: string | undefined;
}) {
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

function KeyValueError({ message }: { message: string | undefined }) {
  if (message === undefined || message === '') {
    return null;
  }
  return <p className="text-sm text-destructive">{message}</p>;
}

function KeyValueRow({
  pair,
  index,
  isDuplicate,
  isLast,
  error,
  disabled,
  keyFieldProps,
  valueFieldProps,
  testId,
  addButtonLabel,
  onKeyChange,
  onValueChange,
  onDelete,
  onAdd,
}: {
  pair: KeyValuePair;
  index: number;
  isDuplicate: boolean;
  isLast: boolean;
  error?: KeyValueFieldError | undefined;
  disabled?: boolean | undefined;
  keyFieldProps: KeyValueFieldConfig;
  valueFieldProps: KeyValueFieldConfig;
  testId?: string | undefined;
  addButtonLabel: string;
  onKeyChange: (index: number, key: string) => void;
  onValueChange: (index: number, val: string) => void;
  onDelete: (index: number) => void;
  onAdd?: (() => void) | undefined;
}) {
  const hasTestId = testId !== undefined && testId !== '';
  const isKeyInvalid = Boolean(error?.key) || Boolean(pair.value && !pair.key) || isDuplicate;
  const isValueInvalid = Boolean(error?.value) || Boolean(pair.key && !pair.value);
  const keyError = isDuplicate ? 'Duplicate key' : error?.key;

  const keyControl = (
    <FieldRenderer
      config={keyFieldProps}
      disabled={disabled}
      isInvalid={isKeyInvalid}
      onChange={(val) => onKeyChange(index, val)}
      testId={hasTestId ? `${testId}-key-${index}` : undefined}
      value={pair.key}
    />
  );
  const valueControl = (
    <FieldRenderer
      config={valueFieldProps}
      disabled={disabled}
      isInvalid={isValueInvalid}
      onChange={(val) => onValueChange(index, val)}
      testId={hasTestId ? `${testId}-value-${index}` : undefined}
      value={pair.value}
    />
  );
  const removeAction = (
    <Button
      aria-label="Delete key-value pair"
      className="col-start-1 row-start-3 justify-self-end @min-[28rem]/key-value:col-start-3 @min-[28rem]/key-value:row-start-1"
      data-testid={hasTestId ? `${testId}-delete-${index}` : undefined}
      disabled={disabled}
      onClick={() => onDelete(index)}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      <X size={16} />
    </Button>
  );
  const addAction =
    onAdd && isLast ? (
      <Button
        className="col-span-full"
        data-slot="add-button"
        data-testid={hasTestId ? `${testId}-add` : undefined}
        disabled={disabled}
        onClick={onAdd}
        size="sm"
        type="button"
        variant="outline"
      >
        <Plus size={14} />
        {addButtonLabel}
      </Button>
    ) : null;
  return (
    <KeyValueRowLayout
      addAction={addAction}
      keyControl={keyControl}
      keyError={<KeyValueError message={keyError} />}
      removeAction={removeAction}
      valueControl={valueControl}
      valueError={<KeyValueError message={error?.value} />}
    />
  );
}

export function KeyValueField({
  value = EMPTY_KEY_VALUE_PAIRS,
  onChange,
  errors,
  label,
  description,
  addButtonLabel = 'Add',
  keyFieldProps = DEFAULT_KEY_FIELD_PROPS,
  valueFieldProps = DEFAULT_VALUE_FIELD_PROPS,
  showAddButton = true,
  disabled,
  maxItems,
  testId,
}: KeyValueFieldProps) {
  const labelId = useId();
  const descriptionId = `${labelId}-description`;
  const containerRef = useRef<HTMLFieldSetElement>(null);
  const { onAdd, onRemove } = useInputListFocus(containerRef);

  const duplicateIndices = findDuplicateIndices(value, (pair) => pair.key);

  const isAtLimit = maxItems !== undefined && value.length >= maxItems;

  const handleAdd = () => {
    onChange?.([...value, { key: '', value: '' }]);
    onAdd();
  };

  const handleKeyChange = (index: number, key: string) => {
    const current = value[index];
    if (!current) {
      return;
    }
    const updated = [...value];
    updated[index] = { ...current, key };
    onChange?.(updated);
  };

  const handleValueChange = (index: number, val: string) => {
    const current = value[index];
    if (!current) {
      return;
    }
    const updated = [...value];
    updated[index] = { ...current, value: val };
    onChange?.(updated);
  };

  const handleDelete = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange?.(updated);
    onRemove(index);
  };

  return (
    <KeyValueLayout
      containerRef={containerRef}
      description={description}
      descriptionId={descriptionId}
      label={label}
      labelId={labelId}
      testId={testId}
    >
      {value.map((pair, index) => (
        <KeyValueRow
          addButtonLabel={addButtonLabel}
          disabled={disabled}
          error={errors?.[index]}
          index={index}
          isDuplicate={duplicateIndices.has(index)}
          isLast={index === value.length - 1}
          key={index}
          keyFieldProps={keyFieldProps}
          onAdd={showAddButton === true && !isAtLimit ? handleAdd : undefined}
          onDelete={handleDelete}
          onKeyChange={handleKeyChange}
          onValueChange={handleValueChange}
          pair={pair}
          testId={testId}
          valueFieldProps={valueFieldProps}
        />
      ))}
      {value.length === 0 && showAddButton === true && !isAtLimit ? (
        <Button
          data-slot="add-button"
          data-testid={testId !== undefined && testId !== '' ? `${testId}-add` : undefined}
          disabled={disabled}
          onClick={handleAdd}
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus size={14} />
          {addButtonLabel}
        </Button>
      ) : null}
    </KeyValueLayout>
  );
}
