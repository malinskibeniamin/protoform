'use client';

import { Plus, X } from 'lucide-react';
import type React from 'react';
import { type ComponentType, type ReactNode, useId, useRef } from 'react';
import { KeyValueLayout, KeyValueRowLayout } from '@/components/ui/shared/control-layouts';
import { findDuplicateIndices, useInputListFocus } from '@/registry/base-nova/protoform/lib/input-utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

export interface KeyValueFieldRenderProps<Config> {
  config?: Config | undefined;
  disabled?: boolean | undefined;
  isInvalid: boolean;
  onChange: (value: string) => void;
  placeholder: string;
  testId?: string | undefined;
  value: string;
}
export interface KeyValueFieldControls<Config> {
  Button: ComponentType<
    React.PropsWithChildren<{
      'aria-label'?: string | undefined;
      className?: string | undefined;
      'data-list-add'?: string | undefined;
      'data-slot'?: string | undefined;
      'data-testid'?: string | undefined;
      disabled?: boolean | undefined;
      onClick?: (() => void) | undefined;
      size: 'sm' | 'icon-sm';
      type: 'button';
      variant: 'outline' | 'ghost';
    }>
  >;
  Field: ComponentType<KeyValueFieldRenderProps<Config>>;
}

export interface KeyValuePair {
  key: string;
  value: string;
}

const EMPTY_KEY_VALUE_PAIRS: KeyValuePair[] = [];

export interface KeyValueFieldError {
  key?: string | undefined;
  value?: string | undefined;
}

export interface KeyValueFieldProps<Config> extends SharedProps {
  addButtonLabel?: string;
  description?: ReactNode;
  disabled?: boolean | undefined;
  errors?: Array<KeyValueFieldError | undefined>;
  keyFieldProps?: Config;
  label?: ReactNode;
  maxItems?: number | undefined;
  onChange?: (value: KeyValuePair[]) => void;
  showAddButton?: boolean;
  value?: KeyValuePair[];
  valueFieldProps?: Config;
}

function KeyValueError({ message }: { message: string | undefined }) {
  if (message === undefined || message === '') {
    return null;
  }
  return <p className="text-sm text-destructive">{message}</p>;
}

function KeyValueRow<Config>({
  controls,
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
  controls: KeyValueFieldControls<Config>;
  pair: KeyValuePair;
  index: number;
  isDuplicate: boolean;
  isLast: boolean;
  error?: KeyValueFieldError | undefined;
  disabled?: boolean | undefined;
  keyFieldProps: Config | undefined;
  valueFieldProps: Config | undefined;
  testId?: string | undefined;
  addButtonLabel: string;
  onKeyChange: (index: number, key: string) => void;
  onValueChange: (index: number, val: string) => void;
  onDelete: (index: number) => void;
  onAdd?: (() => void) | undefined;
}) {
  const { Field: FieldRenderer, Button } = controls;
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
      placeholder="Key"
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
      placeholder="Value"
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
        data-list-add=""
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

export function KeyValueField<Config>({
  controls,
  value = EMPTY_KEY_VALUE_PAIRS,
  onChange,
  errors,
  label,
  description,
  addButtonLabel = 'Add',
  keyFieldProps,
  valueFieldProps,
  showAddButton = true,
  disabled,
  maxItems,
  testId,
}: KeyValueFieldProps<Config> & { controls: KeyValueFieldControls<Config> }) {
  const { Button } = controls;
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
          controls={controls}
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
          data-list-add=""
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
