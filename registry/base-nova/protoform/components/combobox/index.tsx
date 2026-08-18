"use client";

import { useCommandState } from "cmdk";
import { Check, ChevronsUpDown, Plus, Search, X } from "lucide-react";
import type React from "react";
import { memo, useCallback, useEffect, useId, useMemo, useReducer, useRef } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/registry/base-nova/protoform/components/command";
import { Input, InputEnd, InputStart } from "@/registry/base-nova/protoform/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/base-nova/protoform/components/popover";
import { Spinner } from "@/registry/base-nova/protoform/components/spinner";
import {
  cn,
  type PortalContentProps,
  type PortalRootProps,
  type SharedProps,
} from "@/registry/base-nova/protoform/lib/utils";

import {
  CREATE_ITEM_PREFIX,
  computeNextHighlight,
  filterOptions,
  findFirstMatch,
  getNavigableValues,
  groupOptions,
  resolveLabel,
} from "./combobox-utils";
import { comboboxReducer, createInitialState } from "./use-combobox-reducer";

/**
 * Sentinel value to prevent cmdk from auto-selecting the first item.
 * cmdk auto-selects when value is falsy, so this truthy value that
 * matches no real option prevents any highlight on open.
 */
const NO_HIGHLIGHT = "__no_highlight__";

const preventDefault = (e: { preventDefault: () => void }) => e.preventDefault();

/**
 * Bridge component rendered inside <Command> to read cmdk's internal
 * selectedItemId via useCommandState (requires Command context).
 * Reports the DOM id of the highlighted item for aria-activedescendant.
 */
function ActiveDescendantBridge({ onIdChange }: { onIdChange: (id: string | undefined) => void }) {
  const selectedItemId = useCommandState((state) => state.selectedItemId);
  useEffect(() => {
    onIdChange(selectedItemId);
  }, [selectedItemId, onIdChange]);
  return null;
}

export interface ComboboxOption {
  /** Arbitrary payload passed back to `renderOption` for rich item rendering. */
  data?: unknown;
  /** When true, the option is rendered but cannot be selected. */
  disabled?: boolean | undefined;
  group?: string | undefined;
  groupTestId?: string | undefined;
  label: string;
  testId?: string | undefined;
  value: string;
}

export interface ComboboxProps
  extends SharedProps,
    Pick<PortalRootProps, "defaultOpen">,
    Pick<PortalContentProps, "container"> {
  /** @deprecated No longer used. The combobox now uses list-based navigation. Will be removed in next major version. */
  autocomplete?: boolean | undefined;
  className?: string | undefined;
  /** @default true - Show a clear (X) button when a value is selected */
  clearable?: boolean | undefined;
  /** If true, the combobox will allow the user to create a new option */
  creatable?: boolean | undefined;
  /** Noun used in the create prompt (e.g. "option", "context"). @default "option" */
  createLabel?: string | undefined;
  disabled?: boolean | undefined;
  /**
   * Override the default "No options found." empty state. Ignored when
   * `loading` is true.
   */
  emptyState?: React.ReactNode | undefined;
  inputTestId?: string | undefined;
  /**
   * When true, an inline spinner is rendered inside the popover and the
   * default "No options found." empty state is suppressed. Useful while
   * async options are being fetched.
   */
  loading?: boolean | undefined;
  onChange: (value: string) => void;
  onClose?: (() => void) | undefined;
  /** Callback function to create a new option */
  onCreateOption?: ((value: string) => void) | undefined;
  /**
   * Called on every keystroke with the current input text. Use to drive an
   * async/remote search; typically paired with a debounced fetch that
   * updates `options`.
   */
  onInputValueChange?: ((value: string) => void) | undefined;
  onOpen?: (() => void) | undefined;
  options: ComboboxOption[];
  placeholder?: string | undefined;
  preventAutoFocusOnOpen?: boolean | undefined;
  /**
   * Override the rendering of each option row. Defaults to rendering the
   * option label. The active check icon is still rendered by the component.
   */
  renderOption?: ((option: ComboboxOption) => React.ReactNode) | undefined;
  /** Content for the start slot of the input. Defaults to a search icon. Pass `null` to hide. */
  start?: React.ReactNode | null;
  value?: string | undefined;
}

const DEFAULT_START = <Search className="opacity-50" size={15} />;

export const Combobox = memo(
  ({
    options,
    value: controlledValue = "",
    onChange,
    placeholder,
    disabled,
    creatable,
    onCreateOption,
    createLabel = "option",
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
    onInputValueChange,
    loading = false,
    emptyState,
    renderOption,
  }: ComboboxProps) => {
    const [state, dispatch] = useReducer(comboboxReducer, { controlledValue, defaultOpen, options }, (init) =>
      createInitialState(init.options, init.controlledValue, init.defaultOpen)
    );
    const { open, inputValue, highlightedValue, activeDescendantId, userHasTyped } = state;

    const inputRef = useRef<HTMLInputElement>(null);
    const listId = useId();
    const hasStart = start !== null && start !== undefined;

    // Derived values (pure computations)
    const controlledLabel = useMemo(() => resolveLabel(options, controlledValue), [controlledValue, options]);
    const filteredOptions = useMemo(
      () => filterOptions(options, inputValue, controlledLabel),
      [options, inputValue, controlledLabel]
    );
    const groupedOptions = useMemo(() => groupOptions(filteredOptions), [filteredOptions]);
    const canCreate =
      !!creatable && inputValue.trim().length > 0 && !options.some((option) => option.value === inputValue);
    const navigableValues = useMemo(
      () => getNavigableValues(filteredOptions, canCreate, inputValue),
      [filteredOptions, canCreate, inputValue]
    );
    const showClearButton = clearable && controlledValue && !disabled;

    // ── Effects (genuine side effects only) ───────────────────────────

    // Sync inputValue when controlled value changes externally
    useEffect(() => {
      dispatch({ controlledLabel, type: "SYNC_CONTROLLED" });
    }, [controlledLabel]);

    // Focus input when popover opens
    useEffect(() => {
      if (!(inputRef.current && open && !preventAutoFocusOnOpen)) {
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

    // Fire onOpen/onClose callbacks (single-concern: only callbacks)
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

    // ── Handlers ──────────────────────────────────────────────────────

    const handleActiveDescendantChange = useCallback(
      (id: string | undefined) => dispatch({ id, type: "SET_ACTIVE_DESCENDANT" }),
      []
    );

    const handleHighlightChange = useCallback(
      (value: string) => dispatch({ nextHighlight: value, type: "NAVIGATE" }),
      []
    );

    const selectOption = useCallback(
      (option: ComboboxOption) => {
        if (option.disabled) {
          return;
        }
        if (controlledValue === option.value) {
          onChange("");
          dispatch({ type: "TOGGLE_OFF" });
        } else {
          onChange(option.value);
          dispatch({ label: option.label, type: "SELECT" });
        }
      },
      [onChange, controlledValue]
    );

    const handleCreatableSubmit = useCallback(() => {
      onChange(inputValue);
      dispatch({ inputValue, type: "CREATE_SUBMIT" });
      onCreateOption?.(inputValue);
    }, [inputValue, onChange, onCreateOption]);

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        dispatch({ type: "CLEAR" });
        inputRef.current?.focus();
      },
      [onChange]
    );

    const handlePopoverOpenChange = useCallback(
      (newOpen: boolean) => {
        if (disabled) {
          return;
        }
        dispatch(newOpen ? { type: "OPEN" } : { type: "CLOSE" });
      },
      [disabled]
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        dispatch({ firstMatch: findFirstMatch(options, newValue), type: "TYPE", value: newValue });
        onInputValueChange?.(newValue);
      },
      [options, onInputValueChange]
    );

    const handleInputClick = useCallback(() => {
      if (!open) {
        dispatch({ type: "INPUT_CLICK" });
      }
    }, [open]);

    const handleBlur = useCallback(() => {
      if (inputValue.trim() === "" && controlledValue && userHasTyped) {
        onChange("");
        dispatch({ type: "BLUR_CLEAR" });
      } else if (inputValue !== controlledLabel) {
        const matchesOption = options.some((opt) => opt.value === inputValue || opt.label === inputValue);
        if (!creatable || (!matchesOption && inputValue.trim() === "")) {
          dispatch({ controlledLabel, type: "BLUR_REVERT" });
        }
      }
    }, [inputValue, controlledValue, controlledLabel, options, creatable, onChange, userHasTyped]);

    // ── Keyboard handlers (decomposed per key) ────────────────────────

    const handleArrowKey = useCallback(
      (event: React.KeyboardEvent, direction: 1 | -1) => {
        event.preventDefault();
        if (!open) {
          dispatch({ type: "ARROW_OPEN" });
          return;
        }
        dispatch({
          nextHighlight: computeNextHighlight(navigableValues, highlightedValue, direction),
          type: "NAVIGATE",
        });
      },
      [open, navigableValues, highlightedValue]
    );

    const handleEnterKey = useCallback(
      (event: React.KeyboardEvent) => {
        if (!open) {
          return; // Let Enter propagate to form when closed
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
          } else if (inputValue.trim() === "" && controlledValue) {
            onChange("");
            dispatch({ type: "ENTER_CLEAR" });
          } else if (creatable && canCreate) {
            handleCreatableSubmit();
          } else {
            dispatch({ controlledLabel, type: "ENTER_REVERT" });
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
          dispatch({ type: "CLOSE" });
        } else if (controlledValue) {
          event.preventDefault();
          event.stopPropagation();
          onChange("");
          dispatch({ type: "ESCAPE_CLEAR" });
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
          case "ArrowDown":
            return handleArrowKey(event, 1);
          case "ArrowUp":
            return handleArrowKey(event, -1);
          case "Enter":
            return handleEnterKey(event);
          case "Escape":
            return handleEscapeKey(event);
          case "ArrowRight":
            return handleArrowRightKey(event);
          default:
            return undefined;
        }
      },
      [handleArrowKey, handleEnterKey, handleEscapeKey, handleArrowRightKey]
    );

    // ── Memoized props ────────────────────────────────────────────────

    const popoverStyle = useMemo(
      () => ({ width: inputRef.current?.clientWidth }),
      // Recalculate when open changes (ref width may have changed)
      []
    );

    const preventAutoFocusHandler = preventAutoFocusOnOpen ? preventDefault : undefined;

    // ── Render ────────────────────────────────────────────────────────

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
            className="relative w-full shadow-none"
            containerClassName={className}
            disabled={disabled}
            onBlur={handleBlur}
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
                <button
                  aria-label="Clear selection"
                  className="pointer-events-auto rounded-sm opacity-50 hover:opacity-100"
                  onClick={handleClear}
                  onMouseDown={preventDefault}
                  tabIndex={-1}
                  type="button"
                >
                  <X size={15} />
                </button>
              ) : null}
              <ChevronsUpDown className="opacity-50" size={15} />
            </InputEnd>
          </Input>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          container={container}
          onMouseDown={preventDefault}
          onOpenAutoFocus={preventAutoFocusHandler}
          style={popoverStyle}
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
              {loading ? (
                <div
                  aria-busy="true"
                  className="flex items-center gap-2 px-3 py-4 text-muted-foreground text-sm"
                  role="status"
                >
                  <Spinner className="size-4" />
                  <span>Loading…</span>
                </div>
              ) : (
                <CommandEmpty>{emptyState ?? "No options found."}</CommandEmpty>
              )}
              {(groupedOptions ?? [{ heading: "", options: filteredOptions }]).map((group) => (
                <CommandGroup
                  heading={group.heading || undefined}
                  key={group.heading || "default"}
                  testId={group.testId}
                >
                  {group.options.map((option) => (
                    <CommandItem
                      disabled={option.disabled ?? false}
                      key={option.value}
                      onSelect={() => selectOption(option)}
                      testId={option.testId}
                      value={option.label}
                    >
                      {renderOption ? renderOption(option) : option.label}
                      <Check
                        className={cn("ml-auto", controlledValue === option.value ? "opacity-100" : "opacity-0")}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
              {canCreate ? (
                <CommandGroup>
                  <CommandItem forceMount onSelect={handleCreatableSubmit} value={`${CREATE_ITEM_PREFIX}${inputValue}`}>
                    <Plus className="size-4 shrink-0" />
                    <span className="truncate">Create "{inputValue}"</span>
                  </CommandItem>
                </CommandGroup>
              ) : null}
              {creatable && !canCreate ? (
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
