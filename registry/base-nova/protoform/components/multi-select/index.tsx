'use client';
import type React from 'react';
import { Fragment, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectEmpty,
  SelectGroup,
  SelectGroupLabel,
  SelectInput,
  SelectItem,
  SelectList,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/index';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';
export interface MultiSelectOptionItem {
  disabled?: boolean | undefined;
  label?: React.ReactNode;
  selectedTestId?: string | undefined;
  testId?: string | undefined;
  value: string;
}
export interface MultiSelectOptionGroup {
  children: MultiSelectOptionItem[];
  heading?: React.ReactNode;
  key?: string;
  testId?: string;
}
export interface MultiSelectOptionSeparator {
  key: string;
  type: 'separator';
}
export type MultiSelectOption = MultiSelectOptionItem | MultiSelectOptionGroup | MultiSelectOptionSeparator;
export interface SimpleMultiSelectProps extends React.AriaAttributes, SharedProps {
  className?: string;
  defaultOpen?: boolean;
  disabled?: boolean;
  emptyState?: React.ReactNode;
  id?: string | undefined;
  maxCount?: number;
  onSearch?: ((query: string) => void) | undefined;
  onValueChange?: (value: string[]) => void;
  options: MultiSelectOption[] | string[];
  placeholder?: string;
  searchable?: boolean;
  value?: readonly string[];
  width?: 'full' | 'auto' | 'sm' | 'md' | 'lg' | 'xl';
}
export function SimpleMultiSelect({
  options,
  value: controlledValue,
  onValueChange,
  defaultOpen = false,
  maxCount,
  onSearch,
  placeholder = 'Select items…',
  disabled = false,
  searchable = true,
  width = 'md',
  emptyState = 'No items found',
  testId,
  className,
  ...triggerProps
}: SimpleMultiSelectProps) {
  const resolvedTestId = testId ?? triggerProps['data-testid'];
  const [localValue, setLocalValue] = useState<string[]>([]);
  const value = controlledValue ?? localValue;
  const normalized = options.map((option) => (typeof option === 'string' ? { value: option, label: option } : option));
  const items = normalized.flatMap((option) => {
    if ('children' in option) {
      return option.children;
    }
    if ('type' in option) {
      return [];
    }
    return [option];
  });
  const selectedValues = new Set(value);
  const itemsByValue = new Map(items.map((item) => [item.value, item]));
  function renderItems(groupItems: MultiSelectOptionItem[]) {
    return groupItems.map((option) => (
      <SelectItem
        disabled={
          option.disabled === true ||
          (maxCount !== undefined && value.length >= maxCount && !selectedValues.has(option.value))
        }
        key={option.value}
        label={typeof option.label === 'string' ? option.label : option.value}
        testId={option.testId}
        value={option.value}
      >
        {option.label ?? option.value}
      </SelectItem>
    ));
  }
  return (
    <Select
      {...definedProps({
        onValueChange: (next: string[]) => {
          setLocalValue(next);
          onValueChange?.(next);
        },
        onQueryChange: onSearch,
      })}
      defaultOpen={defaultOpen}
      disabled={disabled}
      multiple
      value={[...(value ?? [])]}
    >
      <SelectTrigger
        {...definedProps(triggerProps)}
        aria-label={triggerProps['aria-label'] ?? 'Multi-select trigger'}
        className={className}
        data-width={width}
        testId={resolvedTestId !== undefined && resolvedTestId !== '' ? `${resolvedTestId}-control` : undefined}
      >
        <SelectValue placeholder={placeholder} testId={resolvedTestId}>
          {() =>
            value.length === 0
              ? placeholder
              : value.map((selected, selectedIndex) => {
                  const option = itemsByValue.get(selected);
                  return (
                    <Fragment key={selected}>
                      <span
                        data-testid={
                          option?.selectedTestId ??
                          (resolvedTestId === undefined ? undefined : `${resolvedTestId}-selected-${selected}`)
                        }
                      >
                        {option?.label ?? selected}
                      </span>
                      {selectedIndex < value.length - 1 ? ', ' : null}
                    </Fragment>
                  );
                })
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        testId={resolvedTestId !== undefined && resolvedTestId !== '' ? `${resolvedTestId}-content` : undefined}
      >
        {searchable === true ? (
          <SelectInput
            aria-label="Search options"
            placeholder="Search…"
            testId={resolvedTestId !== undefined && resolvedTestId !== '' ? `${resolvedTestId}-search` : undefined}
          />
        ) : null}
        <SelectList>
          {normalized.map((option) => {
            if ('children' in option) {
              return (
                <SelectGroup key={option.key ?? String(option.heading)}>
                  <SelectGroupLabel testId={option.testId}>{option.heading}</SelectGroupLabel>
                  {renderItems(option.children)}
                </SelectGroup>
              );
            }
            if ('type' in option) {
              return null;
            }
            return renderItems([option]);
          })}
        </SelectList>
        <SelectEmpty>{emptyState}</SelectEmpty>
      </SelectContent>
    </Select>
  );
}
