'use client';

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { Select as SelectPrimitive } from '@base-ui/react/select';
import { Check, ChevronDownIcon, Search } from 'lucide-react';
import React from 'react';

import { Input } from '@/components/ui/input';
import { TagsValue } from '@/components/ui/tags';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useControllableState } from '@/registry/base-nova/protoform/hooks/use-controllable-state';
import { usePortalContainer } from '@/registry/base-nova/protoform/hooks/use-portal-container';
import {
  cn,
  type PortalContentProps,
  type PortalRootProps,
  type SharedProps,
} from '@/registry/base-nova/protoform/lib/utils';

export interface MultiSelectOptionItem {
  label?: React.ReactNode | undefined;
  selectedTestId?: string | undefined;
  testId?: string | undefined;
  value: string;
}

interface MultiSelectItemData extends MultiSelectOptionItem {
  disabled?: boolean | undefined;
  onDeselect?: ((value: string, item: MultiSelectOptionItem) => void) | undefined;
  onSelect?: ((value: string, item: MultiSelectOptionItem) => void) | undefined;
}

interface MultiSelectContextValue {
  disabled?: boolean | undefined;
  empty: boolean;
  itemCache: Map<string, MultiSelectItemData>;
  maxCount?: number | undefined;
  onDeselect: (value: string, item: MultiSelectOptionItem) => void;
  searchable: boolean;
  value: readonly string[];
}

const MultiSelectContext = React.createContext<MultiSelectContextValue | undefined>(undefined);
function useMultiSelect() {
  const context = React.useContext(MultiSelectContext);
  if (context === undefined) {
    throw new Error('useMultiSelect must be used within MultiSelectProvider');
  }
  return context;
}

type MultiSelectProps = PortalRootProps &
  SharedProps & {
    children?: React.ReactNode;
    value?: readonly string[] | undefined;
    onValueChange?: ((value: string[], items: MultiSelectOptionItem[]) => void) | undefined;
    onSelect?: ((value: string, item: MultiSelectOptionItem) => void) | undefined;
    onDeselect?: ((value: string, item: MultiSelectOptionItem) => void) | undefined;
    defaultValue?: string[] | undefined;
    onSearch?: ((keyword: string | undefined) => void) | undefined;
    filter?: boolean | ((keyword: string, current: string) => boolean) | undefined;
    disabled?: boolean | undefined;
    maxCount?: number | undefined;
    searchable?: boolean | undefined;
    items?: MultiSelectItemData[] | undefined;
  };

function MultiSelect({
  value: valueProp,
  defaultValue,
  open,
  defaultOpen,
  onOpenChange,
  onValueChange,
  onSelect,
  onDeselect,
  onSearch,
  filter,
  disabled,
  maxCount,
  children,
  searchable = true,
  items,
}: MultiSelectProps) {
  const [itemCache] = React.useState(() => new Map<string, MultiSelectItemData>());
  const itemsByValue = new Map((items ?? []).map((item) => [item.value, item]));
  const [value, setValue] = useControllableState<readonly string[]>({
    defaultProp: defaultValue ?? [],
    prop: valueProp,
    onChange: (next) =>
      onValueChange?.(
        [...next],
        next.flatMap((id) => {
          const item = itemsByValue.get(id) ?? itemCache.get(id);
          return item ? [item] : [];
        })
      ),
  });
  function changeSelection(next: string[]) {
    const previousValues = new Set(value);
    const nextValues = new Set(next);
    for (const id of next) {
      if (previousValues.has(id)) {
        continue;
      }
      const item = itemsByValue.get(id) ?? itemCache.get(id) ?? { value: id };
      itemCache.set(id, item);
      item.onSelect?.(id, item);
      onSelect?.(id, item);
    }
    for (const id of value) {
      if (nextValues.has(id)) {
        continue;
      }
      const item = itemsByValue.get(id) ?? itemCache.get(id) ?? { value: id };
      item.onDeselect?.(id, item);
      onDeselect?.(id, item);
    }
    setValue(next);
  }
  const context: MultiSelectContextValue = {
    disabled,
    empty: items?.length === 0,
    itemCache,
    maxCount,
    onDeselect: (id) => changeSelection(value.filter((selected) => selected !== id)),
    searchable,
    value,
  };
  const { contains } = ComboboxPrimitive.useFilter();
  const collection = ComboboxPrimitive.createItems(items, {
    getLabel: (item) => (typeof item.label === 'string' ? item.label : item.value),
    getValue: (item) => item.value,
  });
  return (
    <MultiSelectContext.Provider value={context}>
      {searchable === true ? (
        <ComboboxPrimitive.Root<string, true, MultiSelectItemData>
          autoHighlight
          defaultOpen={defaultOpen}
          disabled={disabled}
          filter={
            filter === false || onSearch
              ? null
              : (item, query) =>
                  typeof filter === 'function'
                    ? filter(query, item.value)
                    : contains(typeof item.label === 'string' ? item.label : item.value, query) ||
                      contains(item.value, query)
          }
          items={items ? collection : undefined}
          loopFocus
          modal={false}
          multiple
          onInputValueChange={(query, details) => {
            if (details.isItemPress) {
              details.cancel();
              return;
            }
            if (
              details.reason === 'input-change' ||
              details.reason === 'input-clear' ||
              details.reason === 'clear-press'
            ) {
              onSearch?.(query);
            }
          }}
          onOpenChange={onOpenChange}
          onValueChange={changeSelection}
          open={open}
          value={value}
        >
          {children}
        </ComboboxPrimitive.Root>
      ) : (
        <SelectPrimitive.Root<string, true>
          defaultOpen={defaultOpen}
          disabled={disabled}
          items={items?.map((item) => ({ label: item.label, value: item.value }))}
          modal={false}
          multiple
          onOpenChange={onOpenChange}
          onValueChange={changeSelection}
          open={open}
          value={value}
        >
          {children}
        </SelectPrimitive.Root>
      )}
    </MultiSelectContext.Provider>
  );
}

interface MultiSelectTriggerProps extends React.ComponentPropsWithoutRef<'div'>, SharedProps {
  width?: keyof typeof widthClasses;
}
const MultiSelectTrigger = React.forwardRef<HTMLDivElement, MultiSelectTriggerProps>(function renderMultiSelectTrigger(
  { className, children, testId, width, ...props },
  ref
) {
  const { disabled, searchable } = useMultiSelect();
  const Trigger = searchable ? ComboboxPrimitive.Trigger : SelectPrimitive.Trigger;
  return (
    <Trigger
      disabled={disabled}
      nativeButton={false}
      render={
        <div
          {...props}
          className={cn(
            'flex min-h-9 items-start justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive data-disabled:cursor-not-allowed data-disabled:opacity-50',
            width && widthClasses[width],
            className
          )}
          data-testid={testId}
          ref={ref}
        />
      }
      role="button"
    >
      {children}
      <ChevronDownIcon aria-hidden className="mt-1 size-4 shrink-0 opacity-50" />
    </Trigger>
  );
});
interface MultiSelectValueProps extends React.ComponentPropsWithoutRef<'div'>, SharedProps {
  maxDisplay?: number | undefined;
  maxItemLength?: number | undefined;
  options?: MultiSelectOption[] | undefined;
  placeholder?: string | undefined;
}

const MultiSelectValue = React.forwardRef<React.ComponentRef<'div'>, MultiSelectValueProps>(
  ({ className, placeholder, maxDisplay, maxItemLength, options, testId, ...props }, forwardRef) => {
    const { value, itemCache, onDeselect, disabled } = useMultiSelect();

    const renderRemain =
      maxDisplay !== undefined && maxDisplay !== 0 && value.length > maxDisplay ? value.length - maxDisplay : 0;
    const renderItems = renderRemain ? value.slice(0, maxDisplay) : value;

    if (value.length === 0) {
      return <span className="pointer-events-none text-muted-foreground">{placeholder}</span>;
    }

    return (
      <TooltipProvider>
        <div
          className={cn('flex flex-1 flex-wrap items-center gap-1 overflow-hidden', className)}
          {...props}
          ref={forwardRef}
        >
          {renderItems.map((itemValue) => {
            const item = findMultiSelectOption(options, itemValue) ?? itemCache.get(itemValue);

            const content = item?.label ?? itemValue;

            const child =
              maxItemLength !== undefined &&
              maxItemLength !== 0 &&
              typeof content === 'string' &&
              content.length > maxItemLength
                ? `${content.slice(0, maxItemLength)}...`
                : content;

            const shouldShowTooltip =
              maxItemLength !== undefined &&
              maxItemLength !== 0 &&
              typeof content === 'string' &&
              content.length > maxItemLength;

            const el = (
              <TagsValue
                key={itemValue}
                {...(disabled
                  ? {}
                  : {
                      onRemove: () => {
                        if (!item) {
                          return;
                        }

                        onDeselect(itemValue, item);
                      },
                    })}
                testId={
                  item?.selectedTestId ??
                  (testId !== undefined && testId !== '' ? `${testId}-selected-${itemValue}` : undefined)
                }
              >
                {child}
              </TagsValue>
            );

            if (shouldShowTooltip) {
              return (
                <Tooltip key={itemValue}>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">{el}</span>
                  </TooltipTrigger>
                  <TooltipContent align="start" className="z-[51]" side="bottom">
                    {content}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return el;
          })}
          {renderRemain ? (
            <span className="py-0.5 text-muted-foreground text-xs leading-4">+{renderRemain}</span>
          ) : null}
        </div>
      </TooltipProvider>
    );
  }
);

MultiSelectValue.displayName = 'MultiSelectValue';

const MultiSelectSearch = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof ComboboxPrimitive.Input> & SharedProps
>(function renderMultiSelectSearch({ testId, className, ...props }, ref) {
  return (
    <div className="flex items-center gap-2 border-b px-2 py-1">
      <Search aria-hidden className="size-4 text-muted-foreground" />
      <ComboboxPrimitive.Input
        aria-label="Search options"
        {...props}
        className={className}
        data-testid={testId}
        ref={ref}
        render={<Input testId={testId} variant="group" />}
      />
    </div>
  );
});

const MultiSelectList = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(function renderMultiSelectList(
  { className, ...props },
  ref
) {
  const { searchable } = useMultiSelect();
  const PrimitiveList = searchable ? ComboboxPrimitive.List : SelectPrimitive.List;
  return (
    <PrimitiveList
      {...props}
      className={cn('max-h-[min(24rem,var(--available-height))] overflow-y-auto p-1', className)}
      ref={ref}
    />
  );
});

interface MultiSelectContentProps
  extends React.ComponentProps<'div'>,
    Pick<React.ComponentProps<typeof ComboboxPrimitive.Popup>, 'initialFocus' | 'finalFocus'>,
    SharedProps {
  container?: HTMLElement | undefined;
  onOpenAutoFocus?: ((event: Event) => void) | undefined;
  render?: React.ReactElement | undefined;
}
const MultiSelectContent = React.forwardRef<HTMLDivElement, MultiSelectContentProps>(function renderMultiSelectContent(
  { className, children, container, testId, onOpenAutoFocus, initialFocus, ...props },
  ref
) {
  const { searchable } = useMultiSelect();
  const portalContainer = usePortalContainer();
  const Portal = searchable ? ComboboxPrimitive.Portal : SelectPrimitive.Portal;
  const popupProps = {
    ...props,
    className: cn(
      'min-w-(--anchor-width) origin-(--transform-origin) overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md transition data-ending-style:scale-95 data-starting-style:scale-95 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none',
      className
    ),
    'data-testid': testId,
    ref,
  };
  const resolvedInitialFocus = onOpenAutoFocus
    ? () => {
        const event = new Event('openAutoFocus', { cancelable: true });
        onOpenAutoFocus(event);
        return !event.defaultPrevented;
      }
    : initialFocus;
  return (
    <Portal container={container ?? portalContainer}>
      {searchable === true ? (
        <ComboboxPrimitive.Positioner align="start" className="z-50" sideOffset={4}>
          <ComboboxPrimitive.Popup aria-label="Select options" {...popupProps} initialFocus={resolvedInitialFocus}>
            {children}
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      ) : (
        <SelectPrimitive.Positioner align="start" alignItemWithTrigger={false} className="z-50" sideOffset={4}>
          <SelectPrimitive.Popup {...popupProps}>{children}</SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      )}
    </Portal>
  );
});

type MultiSelectItemProps = Omit<React.ComponentProps<typeof ComboboxPrimitive.Item>, 'value' | 'onSelect'> &
  Partial<MultiSelectItemData> &
  SharedProps;
const MultiSelectItem = React.forwardRef<HTMLDivElement, MultiSelectItemProps>(function renderMultiSelectItem(
  { value, label, children, disabled: disabledProp, onSelect, onDeselect, selectedTestId, testId, className, ...props },
  ref
) {
  const { value: selectedValues, maxCount, itemCache, searchable } = useMultiSelect();
  React.useEffect(
    function cacheItemMetadata() {
      if (value !== undefined) {
        itemCache.set(value, { label: label ?? children, onSelect, onDeselect, selectedTestId, testId, value });
      }
    },
    [value, label, children, onSelect, onDeselect, selectedTestId, testId, itemCache]
  );
  const disabled =
    disabledProp === true ||
    (maxCount !== undefined && !selectedValues.includes(value ?? '') && selectedValues.length >= maxCount);
  const Item = searchable ? ComboboxPrimitive.Item : SelectPrimitive.Item;
  const Indicator = searchable ? ComboboxPrimitive.ItemIndicator : SelectPrimitive.ItemIndicator;
  return (
    <Item
      {...props}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50',
        className
      )}
      data-testid={testId}
      disabled={disabled}
      ref={ref}
      value={value}
    >
      <span className="truncate">{children ?? label ?? value}</span>
      <Indicator className="ml-auto">
        <Check aria-hidden className="size-4" />
      </Indicator>
    </Item>
  );
});

const MultiSelectGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & SharedProps & { heading?: React.ReactNode; value?: string | undefined }
>(function renderMultiSelectGroup({ heading, children, testId, value: _value, ...props }, ref) {
  const { searchable } = useMultiSelect();
  const Group = searchable ? ComboboxPrimitive.Group : SelectPrimitive.Group;
  const PrimitiveGroupLabel = searchable ? ComboboxPrimitive.GroupLabel : SelectPrimitive.GroupLabel;
  return (
    <Group {...props} data-testid={testId} ref={ref}>
      {heading ? (
        <PrimitiveGroupLabel className="px-2 py-1.5 font-medium text-muted-foreground text-xs">
          {heading}
        </PrimitiveGroupLabel>
      ) : null}
      {children}
    </Group>
  );
});

const MultiSelectSeparator = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function renderMultiSelectSeparator(props, ref) {
    const { searchable } = useMultiSelect();
    const PrimitiveSeparator = searchable ? ComboboxPrimitive.Separator : SelectPrimitive.Separator;
    return <PrimitiveSeparator {...props} className={cn('my-1 h-px bg-border', props.className)} ref={ref} />;
  }
);
const MultiSelectEmpty = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(function renderMultiSelectEmpty(
  { children = 'No content', className, ...props },
  ref
) {
  const { searchable, empty } = useMultiSelect();
  if (!searchable) {
    return empty ? (
      <div
        {...props}
        className={cn('px-3 py-4 text-center text-muted-foreground text-sm', className)}
        ref={ref}
        role="status"
      >
        {children}
      </div>
    ) : null;
  }
  return (
    <ComboboxPrimitive.Empty
      {...props}
      className={cn('px-3 not-empty:py-4 text-center text-muted-foreground text-sm', className)}
      ref={ref}
    >
      {children}
    </ComboboxPrimitive.Empty>
  );
});

export interface MultiSelectOptionSeparator {
  key: string;
  type: 'separator';
}
export interface MultiSelectOptionGroup {
  children: MultiSelectOption[];
  heading?: React.ReactNode | undefined;
  key: string;
  testId?: string | undefined;
  value?: string | undefined;
}
export type MultiSelectOption = Partial<MultiSelectItemData> | MultiSelectOptionSeparator | MultiSelectOptionGroup;
function findMultiSelectOption(
  options: MultiSelectOption[] | undefined,
  value: string
): MultiSelectOptionItem | undefined {
  for (const option of options ?? []) {
    if ('type' in option) {
      continue;
    }
    if ('children' in option) {
      const found = findMultiSelectOption(option.children, value);
      if (found) {
        return found;
      }
    } else if (option.value === value) {
      return { ...option, value };
    }
  }
  return undefined;
}
function renderMultiSelectOptions(list: MultiSelectOption[], visibleValues?: Set<string>): React.ReactNode {
  if (visibleValues?.size === 0) {
    return null;
  }
  return list.map((option) => {
    if ('type' in option) {
      return <MultiSelectSeparator key={option.key} />;
    }
    if ('children' in option) {
      if (visibleValues && !flattenMultiSelectOptions(option.children).some((item) => visibleValues.has(item.value))) {
        return null;
      }
      const children = renderMultiSelectOptions(option.children, visibleValues);
      return (
        <MultiSelectGroup heading={option.heading} key={option.key} testId={option.testId}>
          {children}
        </MultiSelectGroup>
      );
    }
    if (visibleValues && !visibleValues.has(option.value ?? '')) {
      return null;
    }
    return (
      <MultiSelectItem key={option.value} {...option}>
        {option.label}
      </MultiSelectItem>
    );
  });
}
function FilteredMultiSelectOptions({ options }: { options: MultiSelectOption[] }) {
  const filtered = ComboboxPrimitive.useFilteredItems<MultiSelectItemData>();
  return renderMultiSelectOptions(options, new Set(filtered.map((item) => item.value)));
}
function flattenMultiSelectOptions(options: MultiSelectOption[]): MultiSelectItemData[] {
  return options.flatMap((option) => {
    if ('type' in option) {
      return [];
    }
    if ('children' in option) {
      return flattenMultiSelectOptions(option.children);
    }
    return option.value === undefined ? [] : [{ ...option, value: option.value }];
  });
}
type SimpleMultiSelectProps = React.AriaAttributes &
  PortalRootProps &
  SharedProps &
  Pick<PortalContentProps, 'container' | 'onOpenAutoFocus'> & {
    id?: string;
    options: MultiSelectOption[] | string[];
    value?: readonly string[];
    onValueChange?: (value: string[]) => void;
    onSearch?: ((query: string) => void) | undefined;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    maxCount?: number;
    maxDisplay?: number;
    searchable?: boolean;
    width?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
    emptyState?: React.ReactNode;
  };
const widthClasses = { auto: 'w-auto', full: 'w-full', lg: 'w-80', md: 'w-64', sm: 'w-48', xl: 'w-96' };
function SimpleMultiSelect({
  id,
  options,
  value,
  onValueChange,
  onSearch,
  placeholder = 'Select items…',
  className,
  disabled,
  maxCount,
  maxDisplay,
  searchable = true,
  width = 'md',
  container,
  open,
  defaultOpen,
  onOpenChange,
  onOpenAutoFocus,
  testId,
  emptyState = 'No items found',
  ...ariaProps
}: SimpleMultiSelectProps) {
  const normalizedOptions = options.map((option) =>
    typeof option === 'string' ? { label: option, value: option } : option
  );
  return (
    <MultiSelect
      defaultOpen={defaultOpen}
      disabled={disabled}
      items={flattenMultiSelectOptions(normalizedOptions)}
      maxCount={maxCount}
      onOpenChange={onOpenChange}
      onSearch={onSearch ? (query) => onSearch(query ?? '') : undefined}
      onValueChange={onValueChange}
      open={open}
      searchable={searchable}
      value={value}
    >
      <MultiSelectTrigger
        {...ariaProps}
        aria-label={ariaProps['aria-label'] ?? 'Multi-select trigger'}
        className={className}
        id={id}
        testId={testId !== undefined && testId !== '' ? `${testId}-control` : undefined}
        width={width}
      >
        <MultiSelectValue
          maxDisplay={maxDisplay}
          options={normalizedOptions}
          placeholder={placeholder}
          testId={testId}
        />
      </MultiSelectTrigger>
      <MultiSelectContent
        container={container}
        onOpenAutoFocus={onOpenAutoFocus}
        testId={testId !== undefined && testId !== '' ? `${testId}-content` : undefined}
      >
        {searchable === true ? (
          <MultiSelectSearch
            placeholder="Search…"
            testId={testId !== undefined && testId !== '' ? `${testId}-search` : undefined}
          />
        ) : null}
        <MultiSelectList>
          {searchable === true ? (
            <FilteredMultiSelectOptions options={normalizedOptions} />
          ) : (
            renderMultiSelectOptions(normalizedOptions)
          )}
        </MultiSelectList>
        <MultiSelectEmpty>{emptyState}</MultiSelectEmpty>
      </MultiSelectContent>
    </MultiSelect>
  );
}

export {
  MultiSelect,
  MultiSelectContent,
  MultiSelectEmpty,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectList,
  MultiSelectSearch,
  MultiSelectSeparator,
  MultiSelectTrigger,
  MultiSelectValue,
  renderMultiSelectOptions,
  SimpleMultiSelect,
};
