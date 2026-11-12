import type React from 'react';
import type { ComboboxOption } from './ui-component-map';

type Shared = React.AriaAttributes & { 'data-testid'?: string | undefined; testId?: string | undefined };
type Container = React.ComponentProps<'div'> & Shared;
type Trigger = React.ComponentProps<'button'> & Shared & { render?: React.ReactElement };
type Button = Trigger & {
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-xs';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'help';
};
type Disclosure = Container & { open?: boolean; onOpenChange?: (open: boolean) => void };
type Text = React.HTMLAttributes<HTMLElement> &
  Shared & {
    as?: 'span' | 'div' | 'p';
    variant?: 'small' | 'labelStrongSmall';
  };
type Selection = Omit<Container, 'onChange'> & {
  disabled?: boolean | undefined;
  value?: string;
  onValueChange?: (value: string) => void;
};
type Checked = Trigger & {
  checked?: boolean;
  onCheckedChange?: (value: boolean | 'indeterminate') => void;
};
export interface ProtoformComboboxProps extends Shared {
  'aria-label'?: string | undefined;
  className?: string | undefined;
  clearable?: boolean;
  disabled?: boolean | undefined;
  emptyState?: React.ReactNode;
  filter?: boolean;
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
  Alert: Container & { variant?: 'default' | 'destructive' };
  AlertDescription: Container;
  AlertTitle: Container;
  Button: Button;
  Calendar: Shared & { mode: 'single'; selected?: Date | undefined; onSelect: (date: Date | undefined) => void };
  Checkbox: Checked;
  Choicebox: Selection;
  ChoiceboxItem: Trigger & { value: string };
  ChoiceboxItemContent: Container;
  ChoiceboxItemHeader: Container;
  ChoiceboxItemIndicator: Container;
  ChoiceboxItemTitle: Container;
  Collapsible: Disclosure;
  CollapsiblePanel: Container;
  CollapsibleTrigger: Trigger;
  Combobox: ProtoformComboboxProps;
  CopyButton: Button & { content: string };
  Field: Container;
  FieldContent: Container;
  FieldDescription: Container;
  FieldError: Container;
  FieldLabel: React.ComponentProps<'label'> & Shared;
  Heading: React.HTMLAttributes<HTMLHeadingElement> & Shared & { level: 1 | 2 | 3 | 4 | 5 | 6 };
  Input: React.ComponentProps<'input'> & Shared & { onValueChange?: (value: string) => void };
  InputGroup: Container;
  InputGroupAddon: Container & { align?: 'inline-start' | 'inline-end' | 'block-start' | 'block-end' };
  InputGroupButton: Button;
  InputGroupInput: React.ComponentProps<'input'> & Shared & { onValueChange?: (value: string) => void };
  InputGroupText: React.ComponentProps<'span'> & Shared;
  JSONField: Shared & {
    id?: string;
    label?: string;
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
    valueFieldProps?: { mode?: 'combobox'; options?: ComboboxOption[]; placeholder: string };
  };
  Popover: Disclosure;
  PopoverContent: Container;
  PopoverTrigger: Trigger;
  Radio: Trigger & { value: string; variant?: 'card' };
  RadioGroup: Selection;
  Select: Omit<Selection, 'value' | 'onValueChange'> & {
    items: { label: React.ReactNode; value: string | null }[];
    value: string | null;
    onValueChange: (value: string | null) => void;
  };
  SelectContent: Container;
  SelectGroup: Container;
  SelectGroupLabel: Container;
  SelectItem: Container & { value: string | null; disabled?: boolean };
  SelectTrigger: Trigger;
  SelectValue: Container & { placeholder?: React.ReactNode };
  SimpleMultiSelect: Shared & {
    onSearch?: ((query: string) => void) | undefined;
    disabled?: boolean;
    emptyState?: React.ReactNode;
    id?: string;
    onValueChange: (values: string[]) => void;
    options: (
      | ProtoformMultiSelectOption
      | { children: ProtoformMultiSelectOption[]; heading: React.ReactNode; testId: string }
    )[];
    placeholder: string;
    value: string[];
    width?: 'full';
  };
  Slider: Omit<Container, 'onChange'> & {
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
  TabsList: Container & { variant?: 'underline' };
  TabsPanel: Container & { value: string };
  TabsTab: Trigger & { value: string; variant?: 'underline' };
  Text: Text;
  Textarea: React.ComponentProps<'textarea'> &
    Shared & { resize?: 'vertical'; onValueChange?: (value: string) => void };
  Toggle: Button & { pressed?: boolean; onPressedChange?: (pressed: boolean) => void };
  ToggleGroup: Selection & { type: 'single'; variant?: 'outline' };
  ToggleGroupItem: Trigger & { value: string };
  Tooltip: Container;
  TooltipContent: Container;
  TooltipTrigger: Trigger;
}
