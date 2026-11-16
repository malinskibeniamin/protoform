import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ProtoformUIComponentMap } from './ui-component-map';
import type { ProtoformUIProps } from './ui-props';

function Heading({ level, ...props }: ProtoformUIProps['Heading']) {
  const Tag = `h${level}` as const;
  return <Tag {...props} />;
}
function Text({ as: Tag = 'p', variant: _variant, ...props }: ProtoformUIProps['Text']) {
  return <Tag {...props} />;
}
function CopyButton({ content, size, variant, ...props }: ProtoformUIProps['CopyButton']) {
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [copiedContent, setCopiedContent] = React.useState<string | undefined>(undefined);
  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setError(undefined);
      setCopiedContent(content);
    } catch {
      setError('Could not copy. Select and copy the text manually.');
      setCopiedContent(undefined);
    }
  }
  return (
    <span>
      <Button
        {...props}
        onClick={copy}
        size={size === 'default' ? undefined : size}
        type="button"
        variant={variant === 'help' ? 'ghost' : variant}
      />
      {error === undefined ? null : <span role="alert">{error}</span>}
      <span aria-live="polite">{copiedContent === content ? 'Copied' : ''}</span>
    </span>
  );
}

function legacyTestIds(Component: React.ElementType) {
  return function LegacyControl(props: Record<string, unknown>) {
    return React.createElement(Component, {
      ...props,
      ...(props['data-testid'] === undefined ? {} : { testId: props['data-testid'] }),
    });
  };
}

function FormButton({ variant, ...props }: ProtoformUIProps['Button']) {
  return (
    <Button
      {...props}
      variant={variant === 'help' ? 'ghost' : variant}
      {...(variant === 'help' ? { 'data-slot': 'help-trigger' } : {})}
    />
  );
}

function TextInput({ onValueChange, onChange, ...props }: ProtoformUIProps['Input']) {
  return (
    <Input
      {...props}
      onChange={(event) => {
        onChange?.(event);
        if (!event.defaultPrevented) {
          onValueChange?.(event.currentTarget.value);
        }
      }}
    />
  );
}
function GroupTextInput({ onValueChange, onChange, ...props }: ProtoformUIProps['InputGroupInput']) {
  return (
    <InputGroupInput
      {...props}
      onChange={(event) => {
        onChange?.(event);
        if (!event.defaultPrevented) {
          onValueChange?.(event.currentTarget.value);
        }
      }}
    />
  );
}
function TextareaInput({ onValueChange, onChange, ...props }: ProtoformUIProps['Textarea']) {
  return (
    <Textarea
      {...props}
      onChange={(event) => {
        onChange?.(event);
        if (!event.defaultPrevented) {
          onValueChange?.(event.currentTarget.value);
        }
      }}
    />
  );
}
const SelectionLabel = React.createContext<React.ReactNode>(undefined);
function FormSelect({ children, disabled, items, onValueChange, value }: ProtoformUIProps['Select']) {
  return (
    <SelectionLabel value={items.find((item) => item.value === value)?.label}>
      <Select
        disabled={disabled ?? false}
        items={items.map((item) => ({ label: item.label, value: JSON.stringify(item.value) }))}
        onValueChange={(next) => {
          if (typeof next !== 'string') {
            return;
          }
          const decoded: unknown = JSON.parse(next);
          if (decoded === null || typeof decoded === 'string') {
            onValueChange(decoded);
          } else {
            throw new TypeError('Invalid Protoform selection');
          }
        }}
        value={value === null && items.every((item) => item.value !== null) ? null : JSON.stringify(value)}
      >
        {children}
      </Select>
    </SelectionLabel>
  );
}
function FormSelectItem({ value, ...props }: ProtoformUIProps['SelectItem']) {
  return <SelectItem {...props} value={JSON.stringify(value)} />;
}
function FormSelectValue({ children, placeholder, testId, ...props }: ProtoformUIProps['SelectValue']) {
  const label = React.useContext(SelectionLabel);
  return (
    <div {...props} data-testid={testId ?? props['data-testid']}>
      <SelectValue placeholder={placeholder}>{label ?? children ?? placeholder}</SelectValue>
    </div>
  );
}

export const shadcnHostComponents = {
  Provider: TooltipProvider,
  Alert: legacyTestIds(Alert),
  AlertDescription: legacyTestIds(AlertDescription),
  AlertTitle: legacyTestIds(AlertTitle),
  Button: legacyTestIds(FormButton),
  Calendar: legacyTestIds(Calendar),
  Checkbox: legacyTestIds(Checkbox),
  Collapsible: legacyTestIds(Collapsible),
  CollapsiblePanel: legacyTestIds(CollapsibleContent),
  CollapsibleTrigger: legacyTestIds(CollapsibleTrigger),
  CopyButton: legacyTestIds(CopyButton),
  Field: legacyTestIds(Field),
  FieldContent: legacyTestIds(FieldContent),
  FieldDescription: legacyTestIds(FieldDescription),
  FieldError: legacyTestIds(FieldError),
  FieldLabel: legacyTestIds(FieldLabel),
  Heading: legacyTestIds(Heading),
  Input: legacyTestIds(TextInput),
  InputGroup: legacyTestIds(InputGroup),
  InputGroupAddon: legacyTestIds(InputGroupAddon),
  InputGroupButton: legacyTestIds(InputGroupButton),
  InputGroupInput: legacyTestIds(GroupTextInput),
  InputGroupText: legacyTestIds(InputGroupText),
  Popover: legacyTestIds(Popover),
  PopoverContent: legacyTestIds(PopoverContent),
  PopoverTrigger: legacyTestIds(PopoverTrigger),
  RadioGroup: legacyTestIds(RadioGroup),
  Radio: legacyTestIds(RadioGroupItem),
  Select: legacyTestIds(FormSelect),
  SelectContent: legacyTestIds(SelectContent),
  SelectGroup: legacyTestIds(SelectGroup),
  SelectItem: legacyTestIds(FormSelectItem),
  SelectGroupLabel: legacyTestIds(SelectLabel),
  SelectTrigger: legacyTestIds(SelectTrigger),
  SelectValue: legacyTestIds(FormSelectValue),
  Slider: legacyTestIds(Slider),
  Switch: legacyTestIds(Switch),
  Tabs: legacyTestIds(Tabs),
  TabsPanel: legacyTestIds(TabsContent),
  TabsList: legacyTestIds(TabsList),
  TabsTab: legacyTestIds(TabsTrigger),
  Text: legacyTestIds(Text),
  Textarea: legacyTestIds(TextareaInput),
  Toggle: legacyTestIds(Toggle),
  ToggleGroup: legacyTestIds(ToggleGroup),
  ToggleGroupItem: legacyTestIds(ToggleGroupItem),
  Tooltip: legacyTestIds(Tooltip),
  TooltipContent: legacyTestIds(TooltipContent),
  TooltipTrigger: legacyTestIds(TooltipTrigger),
} satisfies ProtoformUIComponentMap;
