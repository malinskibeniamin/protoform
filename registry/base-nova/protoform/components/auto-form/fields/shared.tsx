'use client';

import React from 'react';

import { useAutoFormRuntimeContext } from '../context';
import type { AutoFormFieldProps } from '../core-types';
import { getFieldUiConfig, NUMERIC_OPTION_PATTERN, readDataProviderId as readFieldDataProviderId } from '../helpers';
import { getAutoFormChoiceTestId, getAutoFormFieldTestId } from '../test-ids';
import type { AutoFormOptionGroup, AutoFormOptionItem } from '../types';
import { Input, InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '../ui-components';

const TIME_ZONE_SUFFIX_PATTERN = /([+-]\d{2}:\d{2}|Z)$/u;
const CALENDAR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/u;

function padTwoDigits(value: number): string {
  return String(value).padStart(2, '0');
}

function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime());
}

export function formatCalendarDate(value: Date): string {
  return `${String(value.getFullYear()).padStart(4, '0')}-${padTwoDigits(value.getMonth() + 1)}-${padTwoDigits(value.getDate())}`;
}

function formatLocalTime(value: Date): string {
  return `${padTwoDigits(value.getHours())}:${padTwoDigits(value.getMinutes())}`;
}

export function getControlLabel(label: AutoFormFieldProps['label'], field: AutoFormFieldProps['field']): string {
  return typeof label === 'string' || typeof label === 'number'
    ? String(label)
    : String(field.fieldConfig?.label ?? field.key);
}

export function useFieldTestIds(id: string) {
  const { testIdPrefix } = useAutoFormRuntimeContext();

  return React.useMemo(
    () => ({
      control: getAutoFormFieldTestId(testIdPrefix, id, 'control'),
      controlPart: (part: string) => getAutoFormFieldTestId(testIdPrefix, id, `control-${part}`),
      field: getAutoFormFieldTestId(testIdPrefix, id),
      group: (group: string | number) => getAutoFormChoiceTestId(testIdPrefix, id, 'group', group),
      option: (value: string | number) => getAutoFormChoiceTestId(testIdPrefix, id, 'option', value),
      selected: (value: string | number) => getAutoFormChoiceTestId(testIdPrefix, id, 'selected', value),
    }),
    [id, testIdPrefix]
  );
}

export function resolveControlTestId(inputProps: AutoFormFieldProps['inputProps'], fallback: string): string {
  return typeof inputProps.testId === 'string' ? inputProps.testId : fallback;
}

export function normalizeDateValue(value: unknown): string {
  if (typeof value === 'string') {
    if (TIME_ZONE_SUFFIX_PATTERN.test(value)) {
      const parsed = new Date(value);
      return isValidDate(parsed) ? formatCalendarDate(parsed) : '';
    }

    return value.includes('T') ? (value.split('T')[0] ?? '') : value;
  }

  if (value instanceof Date && isValidDate(value)) {
    return formatCalendarDate(value);
  }

  return '';
}

export function normalizeTimeValue(value: unknown): string {
  if (typeof value === 'string') {
    if (TIME_ZONE_SUFFIX_PATTERN.test(value)) {
      const parsed = new Date(value);
      return isValidDate(parsed) ? formatLocalTime(parsed) : '';
    }

    return value.includes('T') ? (value.split('T')[1]?.slice(0, 5) ?? '') : '';
  }

  if (value instanceof Date && isValidDate(value)) {
    return formatLocalTime(value);
  }

  return '';
}

export function parseCalendarDate(value: string): Date | undefined {
  const match = CALENDAR_DATE_PATTERN.exec(value);
  if (match === null) {
    return undefined;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  parsed.setFullYear(year, month - 1, day);
  if (
    !isValidDate(parsed) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return undefined;
  }
  return parsed;
}

export function buildTimestampValue(datePart: string, timePart: string): string {
  if (!datePart) {
    return '';
  }

  return `${datePart}T${timePart || '00:00'}`;
}

export function parseNumericProp(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function resolveNumericStep(inputProps: AutoFormFieldProps['inputProps'], fallbackValue?: number): number {
  const explicitStep = parseNumericProp(inputProps['step']);
  if (explicitStep !== undefined && explicitStep > 0) {
    return explicitStep;
  }

  const values = [parseNumericProp(inputProps['min']), parseNumericProp(inputProps['max']), fallbackValue].filter(
    (value): value is number => value !== undefined
  );
  return values.some((value) => !Number.isInteger(value)) ? 0.01 : 1;
}

export function normalizeNumberValue(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function getGroupedOptions(field: AutoFormFieldProps['field']): AutoFormOptionGroup[] | undefined {
  return getFieldUiConfig(field).optionGroups;
}

export function getFlatOptions(field: AutoFormFieldProps['field']): AutoFormOptionItem[] {
  const uiConfig = getFieldUiConfig(field);
  const labelOverrides = uiConfig.optionLabels;
  const optionGroups = getGroupedOptions(field);

  if (optionGroups && optionGroups.length > 0) {
    const options = optionGroups.flatMap((group) => group.options);
    if (labelOverrides) {
      return options.map((opt) => ({ ...opt, label: labelOverrides[opt.value] ?? opt.label }));
    }
    return options;
  }

  return (field.options || []).map(([value, label]) => ({
    label: labelOverrides?.[value] ?? label,
    value,
  }));
}

export function renderOptionLabel(option: AutoFormOptionItem | { label?: React.ReactNode; value: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {'icon' in option && option.icon ? <span className="shrink-0">{option.icon}</span> : null}
      <span className="truncate">{option.label ?? option.value}</span>
    </span>
  );
}

export function hasNumericOptions(field: AutoFormFieldProps['field']): boolean {
  const options = getFlatOptions(field);
  return options.length > 0 && options.every((option) => NUMERIC_OPTION_PATTERN.test(option.value));
}

export function StringLikeInput({
  error,
  icon,
  id,
  inputProps,
  placeholder,
  testId,
  type = 'text',
}: {
  error?: string | undefined;
  icon?: React.ReactNode | undefined;
  id: string;
  inputProps: AutoFormFieldProps['inputProps'];
  placeholder?: string | undefined;
  testId: string;
  type?: React.ComponentProps<typeof Input>['type'];
}) {
  const { ref: inputRef, ...controlProps } = inputProps;
  if (icon) {
    return (
      <InputGroup testId={testId}>
        <InputGroupAddon>
          <InputGroupText>{icon}</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          aria-invalid={Boolean(error)}
          disabled={controlProps.disabled}
          id={id}
          name={controlProps.name}
          onBlur={controlProps.onBlur}
          onChange={(event) => controlProps.onValueChange(event.target.value)}
          placeholder={placeholder}
          ref={inputRef}
          testId={`${testId}-input`}
          type={type}
          value={typeof controlProps.value === 'string' ? controlProps.value : ''}
        />
      </InputGroup>
    );
  }

  return (
    <Input
      aria-invalid={Boolean(error)}
      className={error !== undefined && error !== '' ? 'border-destructive' : ''}
      disabled={controlProps.disabled}
      id={id}
      name={controlProps.name}
      onBlur={controlProps.onBlur}
      onChange={(event) => controlProps.onValueChange(event.target.value)}
      placeholder={placeholder}
      ref={inputRef}
      testId={testId}
      type={type}
      value={typeof controlProps.value === 'string' ? controlProps.value : ''}
    />
  );
}

export function readDataProviderId(field: AutoFormFieldProps['field'] | undefined): string | undefined {
  return readFieldDataProviderId(field);
}
