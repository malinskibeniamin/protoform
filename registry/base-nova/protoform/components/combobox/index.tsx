'use client';

import { useCommandState } from 'cmdk';
import { Check, ChevronsUpDown, Plus, Search, X } from 'lucide-react';
import type React from 'react';
import { memo, useCallback, useEffect, useId, useMemo, useReducer, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Input, InputEnd, InputStart } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import {
  cn,
  type PortalContentProps,
  type PortalRootProps,
  type SharedProps,
} from '@/registry/base-nova/protoform/lib/utils';

import {
  CREATE_ITEM_PREFIX,
  computeNextHighlight,
  filterOptions,
  findFirstMatch,
  getNavigableValues,
  groupOptions,
  resolveLabel,
} from './combobox-utils';
import { comboboxReducer, createInitialState } from './use-combobox-reducer';

const NO_HIGHLIGHT = '__no_highlight__';

const preventDefault = (e: { preventDefault: () => void }) => e.preventDefault();

function ActiveDescendantBridge({ onIdChange }: { onIdChange: (id: string | undefined) => void }) {
  const selectedItemId = useCommandState((state) => state.selectedItemId);
  useEffect(() => {
    onIdChange(selectedItemId);
  }, [selectedItemId, onIdChange]);
  return null;
}

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
  extends SharedProps,
    Pick<PortalRootProps, 'defaultOpen'>,
    Pick<PortalContentProps, 'container'> {
  autocomplete?: boolean | undefined;
  className?: string | undefined;
  clearable?: boolean | undefined;
  creatable?: boolean | undefined;
  createLabel?: string | undefined;
  disabled?: boolean | undefined;
  emptyState?: React.ReactNode | undefined;
  id?: string | undefined;
  inputTestId?: string | undefined;
  loading?: boolean | undefined;
  onChange: (value: string) => void;
  onClose?: (() => void) | undefined;
  onCreateOption?: ((value: string) => void) | undefined;
  onInputValueChange?: ((value: string) => void) | undefined;
  onOpen?: (() => void) | undefined;
  options: ComboboxOption[];
  placeholder?: string | undefined;
  preventAutoFocusOnOpen?: boolean | undefined;
  renderOption?: ((option: ComboboxOption) => React.ReactNode) | undefined;
  start?: React.ReactNode | null;
  value?: string | undefined;
}

const DEFAULT_START = <Search className="opacity-50" size={15} />;

function ComboboxEmptyState({ loading, emptyState }: Pick<ComboboxProps, 'loading' | 'emptyState'>) {
  if (loading === true) {
    return (
      <div aria-busy="true" className="flex items-center gap-2 px-3 py-4 text-muted-foreground text-sm" role="status">
        <Spinner className="size-4" />
        <span>Loading…</span>
      </div>
    );
  }
  return <CommandEmpty>{emptyState ?? 'No options found.'}</CommandEmpty>;
}

function ComboboxOptionGroups({
  options,
  selectedValue,
  onSelect,
  renderOption,
}: {
  options: ComboboxOption[];
  selectedValue: string;
  onSelect: (option: ComboboxOption) => void;
  renderOption: ComboboxProps['renderOption'];
}) {
  const groupedOptions = groupOptions(options);
  return (
    <>
      {(groupedOptions ?? [{ heading: '', options }]).map((group) => (
        <CommandGroup heading={group.heading || undefined} key={group.heading || 'default'} testId={group.testId}>
          {group.options.map((option) => (
            <CommandItem
              disabled={option.disabled ?? false}
              key={option.value}
              onSelect={() => onSelect(option)}
              testId={option.testId}
              value={option.label}
            >
              {renderOption ? renderOption(option) : option.label}
              <Check className={cn('ml-auto', selectedValue === option.value ? 'opacity-100' : 'opacity-0')} />
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </>
  );
}

export const Combobox = memo(
  ({
    options,
    value: controlledValue = '',
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
    renderOption,
  }: ComboboxProps) => {
    'use no memo';

    const [state, dispatch] = useReducer(comboboxReducer, { controlledValue, defaultOpen, options }, (init) =>
      createInitialState(init.options, init.controlledValue, init.defaultOpen)
    );
    const { open, inputValue, highlightedValue, activeDescendantId, userHasTyped } = state;

    const inputRef = useRef<HTMLInputElement>(null);
    const listId = useId();
    const hasStart = start !== null && start !== undefined;

    const controlledLabel = useMemo(() => resolveLabel(options, controlledValue), [controlledValue, options]);
    const filteredOptions = useMemo(
      () => filterOptions(options, inputValue, controlledLabel),
      [options, inputValue, controlledLabel]
    );
    const canCreate =
      Boolean(creatable) && inputValue.trim().length > 0 && !options.some((option) => option.value === inputValue);
    const navigableValues = useMemo(
      () => getNavigableValues(filteredOptions, canCreate, inputValue),
      [filteredOptions, canCreate, inputValue]
    );
    const showClearButton = clearable === true && controlledValue !== '' && disabled !== true;

    useEffect(() => {
      dispatch({ controlledLabel, type: 'SYNC_CONTROLLED' });
    }, [controlledLabel]);

    useEffect(() => {
      if (!(inputRef.current && open && preventAutoFocusOnOpen !== true)) {
        return;
      }
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const { length } = inputRef.current.value;
          inputRef.current.setSelectionRange(length, length);
        }
      }, 0);
      return () => clearTimeout(timer);
    }, [open, preventAutoFocusOnOpen]);

    const prevOpenRef = useRef(open);
    useEffect(() => {
      if (prevOpenRef.current !== open) {
        if (open) {
          onOpen?.();
        } else {
          onClose?.();
        }
        prevOpenRef.current = open;
      }
    }, [open, onOpen, onClose]);

    const handleActiveDescendantChange = useCallback(
      (descendantId: string | undefined) => dispatch({ id: descendantId, type: 'SET_ACTIVE_DESCENDANT' }),
      []
    );

    const handleHighlightChange = useCallback(
      (value: string) => dispatch({ nextHighlight: value, type: 'NAVIGATE' }),
      []
    );

    const selectOption = useCallback(
      (option: ComboboxOption) => {
        if (option.disabled === true) {
          return;
        }
        if (controlledValue === option.value) {
          onChange('');
          dispatch({ type: 'TOGGLE_OFF' });
        } else {
          onChange(option.value);
          dispatch({ label: option.label, type: 'SELECT' });
        }
      },
      [onChange, controlledValue]
    );

    const handleCreatableSubmit = useCallback(() => {
      onChange(inputValue);
      dispatch({ inputValue, type: 'CREATE_SUBMIT' });
      onCreateOption?.(inputValue);
    }, [inputValue, onChange, onCreateOption]);

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        dispatch({ type: 'CLEAR' });
        inputRef.current?.focus();
      },
      [onChange]
    );

    const handlePopoverOpenChange = useCallback(
      (newOpen: boolean) => {
        if (disabled === true) {
          return;
        }
        dispatch(newOpen ? { type: 'OPEN' } : { type: 'CLOSE' });
      },
      [disabled]
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        dispatch({ firstMatch: findFirstMatch(options, newValue), type: 'TYPE', value: newValue });
        onInputValueChange?.(newValue);
      },
      [options, onInputValueChange]
    );

    const handleInputClick = useCallback(() => {
      if (!open) {
        dispatch({ type: 'INPUT_CLICK' });
      }
    }, [open]);

    const handleComboboxInputBlur = useCallback(() => {
      if (inputValue.trim() === '' && controlledValue !== '' && userHasTyped) {
        onChange('');
        dispatch({ type: 'BLUR_CLEAR' });
      } else if (inputValue !== controlledLabel) {
        const matchesOption = options.some((opt) => opt.value === inputValue || opt.label === inputValue);
        if (creatable !== true || (!matchesOption && inputValue.trim() === '')) {
          dispatch({ controlledLabel, type: 'BLUR_REVERT' });
        }
      }
    }, [inputValue, controlledValue, controlledLabel, options, creatable, onChange, userHasTyped]);

    const handleArrowKey = useCallback(
      (event: React.KeyboardEvent, direction: 1 | -1) => {
        event.preventDefault();
        if (!open) {
          dispatch({ type: 'ARROW_OPEN' });
          return;
        }
        dispatch({
          nextHighlight: computeNextHighlight(navigableValues, highlightedValue, direction),
          type: 'NAVIGATE',
        });
      },
      [open, navigableValues, highlightedValue]
    );

    const handleEnterKey = useCallback(
      (event: React.KeyboardEvent) => {
        if (!open) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();

        const isCreateHighlighted = highlightedValue.toLowerCase().startsWith(CREATE_ITEM_PREFIX.toLowerCase());

        if (isCreateHighlighted && canCreate) {
          handleCreatableSubmit();
        } else {
          const option = filteredOptions.find((o) => o.label.toLowerCase() === highlightedValue.toLowerCase());
          if (option) {
            selectOption(option);
          } else if (inputValue.trim() === '' && controlledValue !== '') {
            onChange('');
            dispatch({ type: 'ENTER_CLEAR' });
          } else if (creatable === true && canCreate) {
            handleCreatableSubmit();
          } else {
            dispatch({ controlledLabel, type: 'ENTER_REVERT' });
          }
        }
      },
      [
        open,
        highlightedValue,
        canCreate,
        handleCreatableSubmit,
        filteredOptions,
        selectOption,
        inputValue,
        controlledValue,
        controlledLabel,
        onChange,
        creatable,
      ]
    );

    const handleEscapeKey = useCallback(
      (event: React.KeyboardEvent) => {
        if (open) {
          event.preventDefault();
          dispatch({ type: 'CLOSE' });
        } else if (controlledValue !== '') {
          event.preventDefault();
          event.stopPropagation();
          onChange('');
          dispatch({ type: 'ESCAPE_CLEAR' });
        }
      },
      [open, controlledValue, onChange]
    );

    const handleArrowRightKey = useCallback(
      (event: React.KeyboardEvent) => {
        const input = inputRef.current;
        if (input && input.selectionStart === input.value.length && open && highlightedValue) {
          const option = filteredOptions.find((o) => o.label.toLowerCase() === highlightedValue.toLowerCase());
          if (option) {
            event.preventDefault();
            selectOption(option);
          }
        }
      },
      [open, highlightedValue, filteredOptions, selectOption]
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
          case 'ArrowDown':
            return handleArrowKey(event, 1);
          case 'ArrowUp':
            return handleArrowKey(event, -1);
          case 'Enter':
            return handleEnterKey(event);
          case 'Escape':
            return handleEscapeKey(event);
          case 'ArrowRight':
            return handleArrowRightKey(event);
          default:
            return;
        }
      },
      [handleArrowKey, handleEnterKey, handleEscapeKey, handleArrowRightKey]
    );

    return (
      <Popover onOpenChange={handlePopoverOpenChange} open={open} testId={testId}>
        <PopoverTrigger asChild nativeButton={false}>
          <Input
            aria-activedescendant={open ? activeDescendantId : undefined}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded={open}
            autoComplete="off"
            autoCorrect="off"
            className="relative w-full"
            containerClassName={className}
            disabled={disabled}
            id={id}
            onBlur={handleComboboxInputBlur}
            onChange={handleInputChange}
            onClick={handleInputClick}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            ref={inputRef}
            role="combobox"
            spellCheck={false}
            testId={inputTestId}
            type="text"
            value={inputValue}
          >
            {hasStart ? <InputStart>{start}</InputStart> : null}
            <InputEnd>
              {showClearButton ? (
                <Button
                  aria-label="Clear selection"
                  className="pointer-events-auto"
                  onClick={handleClear}
                  onMouseDown={preventDefault}
                  size="icon-xs"
                  tabIndex={-1}
                  type="button"
                  variant="ghost"
                >
                  <X size={15} />
                </Button>
              ) : null}
              <ChevronsUpDown className="opacity-50" size={15} />
            </InputEnd>
          </Input>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--anchor-width) p-0"
          container={container}
          initialFocus={preventAutoFocusOnOpen === true ? false : undefined}
          onMouseDown={preventDefault}
        >
          <Command
            loop
            onValueChange={handleHighlightChange}
            shouldFilter={false}
            size="full"
            value={highlightedValue || NO_HIGHLIGHT}
            variant="minimal"
          >
            <ActiveDescendantBridge onIdChange={handleActiveDescendantChange} />
            <CommandList id={listId}>
              <ComboboxEmptyState emptyState={emptyState} loading={loading} />
              <ComboboxOptionGroups
                onSelect={selectOption}
                options={filteredOptions}
                renderOption={renderOption}
                selectedValue={controlledValue}
              />
              {canCreate ? (
                <CommandGroup>
                  <CommandItem forceMount onSelect={handleCreatableSubmit} value={`${CREATE_ITEM_PREFIX}${inputValue}`}>
                    <Plus className="size-4 shrink-0" />
                    <span className="truncate">Create &quot;{inputValue}&quot;</span>
                  </CommandItem>
                </CommandGroup>
              ) : null}
              {creatable === true && !canCreate ? (
                <CommandGroup>
                  <CommandItem disabled forceMount value="__create_prompt__">
                    <Plus className="size-4 shrink-0 opacity-50" />
                    <span className="truncate text-muted-foreground">Type to create a new {createLabel}...</span>
                  </CommandItem>
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
Combobox.displayName = 'Combobox';
