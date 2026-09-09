import type React from "react";
import type { ComboboxOption } from "./ui-component-map";

/** Renderer-owned contracts. Never import types from a consumer's UI implementation. */
type Shared = React.AriaAttributes & { "data-testid"?: string | undefined; testId?: string | undefined };
type Container = React.ComponentProps<"div"> & Shared;
type Trigger = React.ComponentProps<"button"> & Shared & { asChild?: boolean; render?: React.ReactElement };
type Button = Trigger & {
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-xs";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
};
type Disclosure = Container & { open?: boolean; onOpenChange?: (open: boolean) => void };
type Text = React.HTMLAttributes<HTMLElement> &
  Shared & {
    as?: "span" | "div" | "p";
    variant?: "small" | "labelStrongSmall";
  };
type Selection = Omit<Container, "onChange"> & {
  disabled?: boolean | undefined;
  value?: string;
  onValueChange?: (value: string) => void;
};
type Checked = Trigger & {
  checked?: boolean;
  onCheckedChange?: (value: boolean | "indeterminate") => void;
};
export interface ProtoformComboboxProps extends Shared {
  "aria-label"?: string | undefined;
  className?: string | undefined;
  clearable?: boolean;
  disabled?: boolean | undefined;
  emptyState?: React.ReactNode;
  id?: string;
  inputTestId?: string;
  loading?: boolean | undefined;
  onChange?: (value: string) => void;
  onInputValueChange?: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  renderOption?: (option: ComboboxOption) => React.ReactNode;
  value?: string;
}
export interface ProtoformMultiSelectOption {
  label?: React.ReactNode;
  selectedTestId?: string;
  testId?: string;
  value: string;
}
export interface ProtoformUIProps {
  Alert: Container & { variant?: "default" | "destructive" };
  AlertDescription: Container;
  AlertTitle: Container;
  Button: Button;
  Calendar: Shared & { mode: "single"; selected?: Date | undefined; onSelect: (date: Date | undefined) => void };
  Checkbox: Checked;
  Choicebox: Selection;
  ChoiceboxItem: Trigger & { value: string };
  ChoiceboxItemContent: Container;
  ChoiceboxItemHeader: Container;
  ChoiceboxItemIndicator: Container;
  ChoiceboxItemTitle: Container;
  Collapsible: Disclosure;
  CollapsibleContent: Container;
  CollapsibleTrigger: Trigger;
  Combobox: ProtoformComboboxProps;
  CopyButton: Button & { content: string };
  Field: Container;
  FieldContent: Container;
  FieldDescription: Container;
  FieldError: Container;
  FieldLabel: React.ComponentProps<"label"> & Shared;
  Heading: React.HTMLAttributes<HTMLHeadingElement> & Shared & { level: 1 | 2 | 3 | 4 | 5 | 6 };
  Input: React.ComponentProps<"input"> & Shared;
  InputGroup: Container;
  InputGroupAddon: Container & { align?: "inline-start" | "inline-end" | "block-start" | "block-end" };
  InputGroupButton: Button;
  InputGroupInput: React.ComponentProps<"input"> & Shared;
  InputGroupText: React.ComponentProps<"span"> & Shared;
  JSONField: Shared & {
    maxDepth?: number;
    onBlur?: (() => void) | undefined;
    onChange: (value: unknown) => void;
    schema: unknown;
    showPlaceholder?: boolean;
    value: unknown;
  };
  KeyValueField: Shared & {
    addButtonLabel?: string;
    disabled?: boolean | undefined;
    keyFieldProps?: { placeholder: string };
    maxItems?: number | undefined;
    onChange: (entries: { key: string; value: string }[]) => void;
    showAddButton?: boolean;
    value: { key: string; value: string }[];
    valueFieldProps?: { mode?: "combobox"; options?: ComboboxOption[]; placeholder: string };
  };
  Popover: Disclosure;
  PopoverContent: Container;
  PopoverTrigger: Trigger;
  RadioGroup: Selection;
  RadioGroupItem: Trigger & { value: string; variant?: "card" };
  Select: Omit<Selection, "value" | "onValueChange"> & {
    items?: { label: React.ReactNode; value: string | null }[];
    value: string | null;
    onValueChange: (value: string | null) => void;
  };
  SelectContent: Container;
  SelectGroup: Container;
  SelectItem: Container & { value: string | null; disabled?: boolean };
  SelectLabel: Container;
  SelectTrigger: Trigger;
  SelectValue: Container & { placeholder?: React.ReactNode };
  SimpleMultiSelect: Shared & {
    disabled?: boolean;
    id?: string;
    onValueChange: (values: string[]) => void;
    options: (
      | ProtoformMultiSelectOption
      | { children: ProtoformMultiSelectOption[]; heading: React.ReactNode; testId: string }
    )[];
    placeholder: string;
    value: string[];
    width?: "full";
  };
  Slider: Omit<Container, "onChange"> & {
    disabled?: boolean | undefined;
    id?: string;
    min?: number;
    max?: number;
    step?: number;
    value: number[];
    onValueChange: (values: number[]) => void;
  };
  Switch: Checked;
  Tabs: Selection;
  TabsContent: Container & { value: string };
  TabsList: Container & { variant?: "underline" };
  TabsTrigger: Trigger & { value: string; variant?: "underline" };
  Text: Text;
  Textarea: React.ComponentProps<"textarea"> & Shared & { resize?: "vertical" };
  Toggle: Button & { pressed?: boolean; onPressedChange?: (pressed: boolean) => void };
  ToggleGroup: Selection & { type: "single"; variant?: "outline" };
  ToggleGroupItem: Trigger & { value: string };
  Tooltip: Container;
  TooltipContent: Container;
  TooltipProvider: Shared & { children?: React.ReactNode; delayDuration?: number; skipDelayDuration?: number };
  TooltipTrigger: Trigger;
}
