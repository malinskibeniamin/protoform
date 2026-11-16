'use client';
import type { AsyncOptionsStatus } from '@ui-sdk/core/async-options';
import type { ComboboxController } from '@ui-sdk/core/combobox';
import { SearchIcon, XIcon } from 'lucide-react';
import type React from 'react';
import { groupOptions, resolveLabel } from '@/components/ui/shared/combobox-options';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';
import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxCreate,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxStatus,
} from './parts';

export interface ComboboxOption {
  data?: unknown;
  disabled?: boolean | undefined;
  group?: string | undefined;
  groupTestId?: string | undefined;
  label: string;
  testId?: string | undefined;
  value: string;
}
export interface OptionComboboxProps extends React.AriaAttributes, SharedProps {
  className?: string | undefined;
  clearable?: boolean | undefined;
  controller?: ComboboxController | undefined;
  creatable?: boolean | undefined;
  createLabel?: string | undefined;
  disabled?: boolean | undefined;
  emptyState?: React.ReactNode;
  filter?: boolean | undefined;
  footer?: React.ReactNode;
  id?: string | undefined;
  inputTestId?: string | undefined;
  loading?: boolean | undefined;
  modal?: boolean | 'pointer' | undefined;
  onChange: (value: string) => void;
  onCreateOption?: ((value: string) => void) | undefined;
  onInputValueChange?: ((value: string) => void) | undefined;
  onLoadMore?: (() => void) | undefined;
  options: readonly ComboboxOption[];
  placeholder?: string | undefined;
  renderOption?: ((option: ComboboxOption) => React.ReactNode) | undefined;
  status?: AsyncOptionsStatus | undefined;
  value?: string | undefined;
}
export function OptionCombobox({
  options,
  controller,
  footer,
  value,
  onChange,
  onInputValueChange,
  onLoadMore,
  disabled,
  loading = false,
  status,
  modal,
  filter = true,
  clearable = true,
  creatable,
  onCreateOption,
  createLabel = 'Create',
  emptyState = 'No options found.',
  renderOption,
  placeholder,
  inputTestId,
  testId,
  className,
  ...inputProps
}: OptionComboboxProps) {
  const groups = groupOptions(options);
  const isLoading = status === undefined ? loading === true : status === 'loading';
  function renderOptions(items: readonly ComboboxOption[]) {
    return items.map((option) => (
      <ComboboxItem
        disabled={option.disabled}
        key={option.value}
        label={option.label}
        testId={option.testId}
        value={option.value}
      >
        {renderOption === undefined ? option.label : renderOption(option)}
      </ComboboxItem>
    ));
  }
  return (
    <Combobox
      autoHighlight="always"
      {...definedProps({
        onQueryChange: (query: string, details: { reason: string; source: string }) => {
          if (details.reason === 'input-change' || details.reason === 'clear-press' || details.source === 'agent') {
            onInputValueChange?.(query);
          }
        },
        onLoadMore,
        controller,
        disabled,
        modal,
      })}
      itemToLabel={(item) => resolveLabel(options, item)}
      onValueChange={(next) => onChange(next ?? '')}
      status={status ?? (isLoading ? 'loading' : 'idle')}
      value={value ?? null}
      {...(filter === true ? {} : { filter: false })}
    >
      <div className={cn('relative', className)}>
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <ComboboxInput
          {...definedProps(inputProps)}
          placeholder={placeholder}
          testId={inputTestId ?? testId}
          variant="search"
        />
        {clearable === true ? (
          <ComboboxClear aria-label="Clear selection" className="absolute top-1/2 right-2 -translate-y-1/2">
            <XIcon aria-hidden="true" className="size-3.5" />
          </ComboboxClear>
        ) : null}
      </div>
      <ComboboxContent>
        <ComboboxList>
          {groups === undefined
            ? renderOptions(options)
            : groups.map((group) => (
                <ComboboxGroup key={group.heading}>
                  <ComboboxGroupLabel testId={group.testId}>{group.heading}</ComboboxGroupLabel>
                  {renderOptions(group.options)}
                </ComboboxGroup>
              ))}
          {creatable === true ? (
            <ComboboxCreate
              onCreate={(query) => {
                onCreateOption?.(query);
                onChange(query);
                return query;
              }}
            >
              {(state) => `${createLabel} ${state.query}`}
            </ComboboxCreate>
          ) : null}
        </ComboboxList>
        {isLoading ? <ComboboxStatus>Loading…</ComboboxStatus> : <ComboboxEmpty>{emptyState}</ComboboxEmpty>}
        {footer}
      </ComboboxContent>
    </Combobox>
  );
}
