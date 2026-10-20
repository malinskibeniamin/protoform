'use client';

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { Check, CheckIcon, ChevronDownIcon, ChevronsUpDown, Plus, Search, X, XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input, InputEnd, InputStart } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { usePortalContainer } from '@/registry/base-nova/protoform/hooks/use-portal-container';
import type { PortalContentProps, PortalRootProps, SharedProps } from '@/registry/base-nova/protoform/lib/utils';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

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

function LegacyCombobox({
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

export function Combobox<Value, Multiple extends boolean | undefined = false, Item = Value>(
  props:
    | ComboboxProps
    | (ComboboxPrimitive.Root.Props<Value, Multiple, Item> & {
        options?: never;
        onChange?: never;
        onCreateOption?: never;
      })
) {
  if (props.options !== undefined) {
    return <LegacyCombobox {...props} />;
  }
  return <ComboboxPrimitive.Root {...props} />;
}

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />;
}

function ComboboxTrigger({ className, children, ...props }: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      className={(state) =>
        cn("[&_svg:not([class*='size-'])]:size-4", typeof className === 'function' ? className(state) : className)
      }
      data-slot="combobox-trigger"
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
    </ComboboxPrimitive.Trigger>
  );
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      className={className}
      data-slot="combobox-clear"
      render={<InputGroupButton size="icon-xs" variant="ghost" />}
      {...props}
    >
      <XIcon className="pointer-events-none" />
    </ComboboxPrimitive.Clear>
  );
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean;
  showClear?: boolean;
}) {
  return (
    <InputGroup className={cn('w-auto', typeof className === 'string' ? className : undefined)}>
      <ComboboxPrimitive.Input
        className={typeof className === 'function' ? className : undefined}
        render={<InputGroupInput disabled={disabled} />}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger === true && (
          <InputGroupButton
            className="group-has-data-[slot=combobox-clear]/input-group:hidden"
            data-slot="input-group-button"
            disabled={disabled}
            render={<ComboboxTrigger aria-label="Show options" />}
            size="icon-xs"
            variant="ghost"
          />
        )}
        {showClear === true && <ComboboxClear aria-label="Clear selection" disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  );
}

function ComboboxContent({
  className,
  side = 'bottom',
  sideOffset = 6,
  align = 'start',
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<ComboboxPrimitive.Positioner.Props, 'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor'>) {
  return (
    <ComboboxPrimitive.Portal container={usePortalContainer()}>
      <ComboboxPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <ComboboxPrimitive.Popup
          className={(state) =>
            cn(
              'group/combobox-content data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 relative max-h-(--available-height) w-(--anchor-width) min-w-[calc(var(--anchor-width)+--spacing(7))] max-w-(--available-width) origin-(--transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[chips=true]:min-w-(--anchor-width) data-closed:animate-out data-open:animate-in *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none',
              typeof className === 'function' ? className(state) : className
            )
          }
          data-chips={anchor !== undefined}
          data-slot="combobox-content"
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      className={(state) =>
        cn(
          'max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1 [scrollbar-width:none] data-empty:p-0',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-slot="combobox-list"
      {...props}
    />
  );
}

function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      className={(state) =>
        cn(
          "relative flex w-full cursor-default select-none items-center gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50 not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
          typeof className === 'function' ? className(state) : className
        )
      }
      data-slot="combobox-item"
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={<span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />}
      >
        <CheckIcon className="pointer-events-none" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return <ComboboxPrimitive.Group className={className} data-slot="combobox-group" {...props} />;
}

function ComboboxLabel({ className, ...props }: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      className={(state) =>
        cn('px-2 py-1.5 text-muted-foreground text-xs', typeof className === 'function' ? className(state) : className)
      }
      data-slot="combobox-label"
      {...props}
    />
  );
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />;
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      className={(state) =>
        cn(
          'hidden w-full justify-center py-2 text-center text-muted-foreground text-sm group-data-empty/combobox-content:flex',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-slot="combobox-empty"
      {...props}
    />
  );
}

function ComboboxSeparator({ className, ...props }: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      className={(state) =>
        cn('-mx-1 my-1 h-px bg-border', typeof className === 'function' ? className(state) : className)
      }
      data-slot="combobox-separator"
      {...props}
    />
  );
}

function ComboboxChips({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> & ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      className={(state) =>
        cn(
          'flex min-h-8 flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent bg-clip-padding px-2.5 py-1 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-data-[slot=combobox-chip]:px-1 has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-slot="combobox-chips"
      {...props}
    />
  );
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean;
}) {
  return (
    <ComboboxPrimitive.Chip
      className={(state) =>
        cn(
          'flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 whitespace-nowrap rounded-sm bg-muted px-1.5 font-medium text-foreground text-xs has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-data-[slot=combobox-chip-remove]:pr-0 has-disabled:opacity-50',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-slot="combobox-chip"
      {...props}
    >
      {children}
      {showRemove === true && (
        <ComboboxPrimitive.ChipRemove
          aria-label="Remove selection"
          className="-ml-1"
          data-slot="combobox-chip-remove"
          render={<Button size="icon-xs" type="button" variant="ghost" />}
        >
          <XIcon className="pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  );
}

function ComboboxChipsInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      className={(state) =>
        cn('min-w-16 flex-1 outline-none', typeof className === 'function' ? className(state) : className)
      }
      data-slot="combobox-chip-input"
      {...props}
    />
  );
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export {
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};
