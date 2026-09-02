"use client";

import { Plus, X } from "lucide-react";
import { type ReactNode, useMemo, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxProps } from "@/components/ui/combobox";
import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findDuplicateIndices, useInputListFocus } from "@/registry/base-nova/protoform/lib/input-utils";
import type { SharedProps } from "@/registry/base-nova/protoform/lib/utils";

export interface KeyValuePair {
  key: string;
  value: string;
}

const EMPTY_KEY_VALUE_PAIRS: KeyValuePair[] = [];

type InputFieldConfig = { mode?: "input" } & Omit<InputProps, "value" | "onChange" | "disabled" | "aria-invalid">;
type ComboboxFieldConfig = { mode: "combobox" } & Omit<ComboboxProps, "value" | "onChange" | "disabled">;
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
  if (config.mode === "combobox") {
    const { mode: _m, ...comboboxProps } = config;
    return <Combobox {...comboboxProps} disabled={disabled} onChange={onChange} testId={testId} value={value} />;
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

function ErrorRow({ keyError, valueError }: { keyError?: string | undefined; valueError?: string | undefined }) {
  if (!(keyError || valueError)) {
    return null;
  }
  return (
    <>
      {keyError ? <p className="-mt-1 text-destructive text-sm">{keyError}</p> : <span />}
      {valueError ? <p className="-mt-1 text-destructive text-sm">{valueError}</p> : <span />}
      <span />
    </>
  );
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
  const isKeyInvalid = Boolean(error?.key) || Boolean(pair.value && !pair.key) || isDuplicate;
  const isValueInvalid = Boolean(error?.value) || Boolean(pair.key && !pair.value);

  return (
    <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
      <FieldRenderer
        config={keyFieldProps}
        disabled={disabled}
        isInvalid={isKeyInvalid}
        onChange={(val) => onKeyChange(index, val)}
        testId={testId ? `${testId}-key-${index}` : undefined}
        value={pair.key}
      />
      <FieldRenderer
        config={valueFieldProps}
        disabled={disabled}
        isInvalid={isValueInvalid}
        onChange={(val) => onValueChange(index, val)}
        testId={testId ? `${testId}-value-${index}` : undefined}
        value={pair.value}
      />
      <Button
        aria-label="Delete key-value pair"
        data-testid={testId ? `${testId}-delete-${index}` : undefined}
        disabled={disabled}
        onClick={() => onDelete(index)}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <X size={16} />
      </Button>
      <ErrorRow keyError={isDuplicate ? "Duplicate key" : error?.key} valueError={error?.value} />
      {onAdd && isLast ? (
        <Button
          className="col-span-2"
          data-slot="add-button"
          data-testid={testId ? `${testId}-add` : undefined}
          disabled={disabled}
          onClick={onAdd}
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus size={14} />
          {addButtonLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function KeyValueField({
  value = EMPTY_KEY_VALUE_PAIRS,
  onChange,
  errors,
  label,
  description,
  addButtonLabel = "Add",
  keyFieldProps = { placeholder: "Key" },
  valueFieldProps = { placeholder: "Value" },
  showAddButton = true,
  disabled,
  maxItems,
  testId,
}: KeyValueFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { onAdd, onRemove } = useInputListFocus(containerRef);

  const duplicateIndices = useMemo(() => findDuplicateIndices(value, (pair) => pair.key), [value]);

  const isAtLimit = maxItems !== undefined && value.length >= maxItems;

  const handleAdd = () => {
    onChange?.([...value, { key: "", value: "" }]);
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
    <div className="flex flex-col gap-2" data-slot="key-value-field" data-testid={testId} ref={containerRef}>
      {label || description ? (
        <div className="flex flex-col gap-0.5">
          {label ? <Label className="font-medium">{label}</Label> : null}
          {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
        </div>
      ) : null}
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
          onAdd={showAddButton && !isAtLimit ? handleAdd : undefined}
          onDelete={handleDelete}
          onKeyChange={handleKeyChange}
          onValueChange={handleValueChange}
          pair={pair}
          testId={testId}
          valueFieldProps={valueFieldProps}
        />
      ))}
      {value.length === 0 && showAddButton && !isAtLimit ? (
        <Button
          data-slot="add-button"
          data-testid={testId ? `${testId}-add` : undefined}
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
    </div>
  );
}
