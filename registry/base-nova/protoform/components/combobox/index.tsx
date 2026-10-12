'use client';

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { Check, ChevronsUpDown, Plus, Search, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input, InputEnd, InputStart } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { usePortalContainer } from '@/registry/base-nova/protoform/hooks/use-portal-container';
import type { PortalContentProps, PortalRootProps, SharedProps } from '@/registry/base-nova/protoform/lib/utils';

import { groupOptions, resolveLabel } from './combobox-utils';

export interface ComboboxOption {
  data?: unknown;
  disabled?: boolean | undefined;
  group?: string | undefined;
  groupTestId?: string | undefined;
  label: string;
  testId?: string | undefined;
  value: string;
}

export interface ComboboxProps
  extends React.AriaAttributes,
    SharedProps,
    Pick<PortalRootProps, 'defaultOpen'>,
    Pick<PortalContentProps, 'container'> {
  autocomplete?: boolean | undefined;
  className?: string | undefined;
  clearable?: boolean | undefined;
  creatable?: boolean | undefined;
  createLabel?: string | undefined;
  disabled?: boolean | undefined;
  emptyState?: React.ReactNode | undefined;
  filter?: boolean | undefined;
  id?: string | undefined;
  inputTestId?: string | undefined;
  loading?: boolean | undefined;
  onChange: (value: string) => void;
  onClose?: (() => void) | undefined;
  onCreateOption?: ((value: string) => void) | undefined;
  onInputValueChange?: ((value: string) => void) | undefined;
  onOpen?: (() => void) | undefined;
  options: readonly ComboboxOption[];
  placeholder?: string | undefined;
  preventAutoFocusOnOpen?: boolean | undefined;
  renderOption?: ((option: ComboboxOption) => React.ReactNode) | undefined;
  start?: React.ReactNode | null;
  value?: string | undefined;
}

const DEFAULT_START = <Search className="opacity-50" size={15} />;

function ComboboxOptionGroups({
  createOption,
  renderOption,
}: {
  createOption: ComboboxOption | undefined;
  renderOption: ComboboxProps['renderOption'];
}) {
  const options = ComboboxPrimitive.useFilteredItems<ComboboxOption>();
  const groups = groupOptions(options) ?? [{ heading: '', options }];
  return groups.map((group) => (
    <ComboboxPrimitive.Group data-testid={group.testId} key={group.heading}>
      {group.heading ? (
        <ComboboxPrimitive.GroupLabel className="px-2 py-1.5 font-medium text-muted-foreground text-xs">
          {group.heading}
        </ComboboxPrimitive.GroupLabel>
      ) : null}
      {group.options.map((option) => (
        <ComboboxPrimitive.Item
          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50"
          data-testid={option.testId}
          disabled={option.disabled}
          key={option.value}
          value={option.value}
        >
          {option === createOption ? (
            <>
              <Plus className="size-4 shrink-0" />
              <span>Create &quot;{option.label}&quot;</span>
            </>
          ) : (
            (renderOption?.(option) ?? option.label)
          )}
          <ComboboxPrimitive.ItemIndicator className="ml-auto">
            <Check aria-hidden className="size-4" />
          </ComboboxPrimitive.ItemIndicator>
        </ComboboxPrimitive.Item>
      ))}
    </ComboboxPrimitive.Group>
  ));
}

function ComboboxInputControl({
  start,
  clearable,
  className,
  inputTestId,
  id,
  placeholder,
  ...ariaProps
}: Pick<ComboboxProps, 'start' | 'clearable' | 'className' | 'inputTestId' | 'id' | 'placeholder'> &
  React.AriaAttributes) {
  return (
    <ComboboxPrimitive.Input
      {...ariaProps}
      data-testid={inputTestId}
      id={id}
      placeholder={placeholder}
      render={
        <Input containerClassName={className} testId={inputTestId}>
          {start !== null && start !== undefined ? <InputStart>{start}</InputStart> : null}
          <InputEnd>
            {clearable === true ? (
              <ComboboxPrimitive.Clear
                aria-label="Clear selection"
                render={<Button className="pointer-events-auto" size="icon-xs" type="button" variant="ghost" />}
              >
                <X size={15} />
              </ComboboxPrimitive.Clear>
            ) : null}
            <ChevronsUpDown className="opacity-50" size={15} />
          </InputEnd>
        </Input>
      }
    />
  );
}

function ComboboxOptionsPopup({
  container,
  preventAutoFocusOnOpen,
  loading,
  emptyState,
  creatable,
  createLabel,
  canCreate,
  createOption,
  renderOption,
}: Pick<
  ComboboxProps,
  'container' | 'preventAutoFocusOnOpen' | 'loading' | 'emptyState' | 'creatable' | 'createLabel' | 'renderOption'
> & {
  canCreate: boolean;
  createOption: ComboboxOption | undefined;
}) {
  const portalContainer = usePortalContainer();
  return (
    <ComboboxPrimitive.Portal container={container ?? portalContainer}>
      <ComboboxPrimitive.Positioner align="start" className="z-50" sideOffset={4}>
        <ComboboxPrimitive.Popup
          className="w-(--anchor-width) origin-(--transform-origin) rounded-lg border bg-popover text-popover-foreground shadow-md transition data-ending-style:scale-95 data-starting-style:scale-95 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none"
          initialFocus={preventAutoFocusOnOpen === true ? false : undefined}
        >
          <ComboboxPrimitive.Status>
            {loading === true ? (
              <div className="flex items-center gap-2 px-3 py-4 text-muted-foreground text-sm">
                <Spinner aria-hidden className="size-4" role="presentation" />
                <span>Loading…</span>
              </div>
            ) : null}
          </ComboboxPrimitive.Status>
          <ComboboxPrimitive.Empty className="px-3 not-empty:py-4 text-muted-foreground text-sm">
            {loading === true ? null : (emptyState ?? 'No options found.')}
          </ComboboxPrimitive.Empty>
          <ComboboxPrimitive.List
            aria-busy={loading}
            className="max-h-[min(300px,var(--available-height))] scroll-py-1 overflow-y-auto p-1"
          >
            <ComboboxOptionGroups createOption={createOption} renderOption={renderOption} />
          </ComboboxPrimitive.List>
          {creatable === true && !canCreate ? (
            <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground text-sm">
              <Plus className="size-4 opacity-50" />
              Type to create a new {createLabel}…
            </div>
          ) : null}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

export function Combobox({
  options,
  autocomplete: _autocomplete,
  value = '',
  onChange,
  placeholder,
  disabled,
  creatable,
  onCreateOption,
  createLabel = 'option',
  start = DEFAULT_START,
  clearable = true,
  className,
  onOpen,
  onClose,
  container,
  testId,
  defaultOpen = false,
  preventAutoFocusOnOpen = false,
  inputTestId,
  id,
  onInputValueChange,
  loading = false,
  emptyState,
  filter = true,
  renderOption,
  ...ariaProps
}: ComboboxProps) {
  const selectedLabel = resolveLabel(options, value);
  const [query, setQuery] = useState(selectedLabel);
  useEffect(
    function syncSelectedLabel() {
      setQuery(selectedLabel);
    },
    [selectedLabel]
  );
  const { contains } = ComboboxPrimitive.useFilter();
  const canCreate =
    Boolean(creatable) &&
    query.trim() !== '' &&
    !options.some((option) => option.value === query || option.label === query);
  const createOption: ComboboxOption | undefined = canCreate ? { label: query, value: query } : undefined;
  const items = ComboboxPrimitive.createItems(createOption ? [...options, createOption] : options, {
    getLabel: (option) => option.label,
    getValue: (option) => option.value,
  });
  return (
    <ComboboxPrimitive.Root<string, false, ComboboxOption>
      autoHighlight
      defaultOpen={defaultOpen}
      disabled={disabled}
      filter={filter === false ? null : (option, text) => contains(option.label, text) || contains(option.value, text)}
      inputValue={query}
      items={items}
      itemToStringLabel={(selectedValue) => resolveLabel(options, selectedValue)}
      loopFocus
      modal={false}
      onInputValueChange={(nextQuery, details) => {
        setQuery(nextQuery);
        if (details.reason === 'input-change' || details.reason === 'input-clear' || details.reason === 'clear-press') {
          onInputValueChange?.(nextQuery);
        }
      }}
      onOpenChange={(open) => {
        if (open) {
          onOpen?.();
        } else {
          onClose?.();
        }
      }}
      onValueChange={(nextValue) => {
        onChange(nextValue === value ? '' : (nextValue ?? ''));
        if (createOption && nextValue === createOption.value) {
          onCreateOption?.(nextValue);
        }
      }}
      value={value === '' ? null : value}
    >
      <ComboboxPrimitive.InputGroup data-testid={testId}>
        <ComboboxInputControl
          {...ariaProps}
          className={className}
          clearable={clearable}
          id={id}
          inputTestId={inputTestId}
          placeholder={placeholder}
          start={start}
        />
      </ComboboxPrimitive.InputGroup>
      <ComboboxOptionsPopup
        canCreate={canCreate}
        container={container}
        creatable={creatable}
        createLabel={createLabel}
        createOption={createOption}
        emptyState={emptyState}
        loading={loading}
        preventAutoFocusOnOpen={preventAutoFocusOnOpen}
        renderOption={renderOption}
      />
    </ComboboxPrimitive.Root>
  );
}
