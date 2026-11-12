'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert/index';
import { Button } from '@/components/ui/button/index';
import { Calendar } from '@/components/ui/calendar/index';
import { Checkbox } from '@/components/ui/checkbox/index';
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '@/components/ui/collapsible/index';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field/index';
import { Input } from '@/components/ui/input/index';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group/index';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover/index';
import { Radio, RadioGroup, RadioIndicator } from '@/components/ui/radio-group/index';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectList,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/index';
import { Slider } from '@/components/ui/slider/index';
import { Switch } from '@/components/ui/switch/index';
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs/index';
import { Textarea } from '@/components/ui/textarea/index';
import { Toggle } from '@/components/ui/toggle/index';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group/index';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip/index';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import type { ProtoformUIComponentMap } from './ui-component-map';
import type { ProtoformUIProps } from './ui-props';

function Heading({ level, ...props }: ProtoformUIProps['Heading']) {
  const Tag = `h${level}` as const;
  return <Tag {...props} />;
}

function Text({ as: Tag = 'p', variant: _variant, ...props }: ProtoformUIProps['Text']) {
  return <Tag {...props} />;
}

function CopyButton({
  content,
  size,
  variant,
  onClick: _onClick,
  render: _render,
  ...props
}: ProtoformUIProps['CopyButton']) {
  const [error, setError] = React.useState<string>();
  const [copiedContent, setCopiedContent] = React.useState<string>();
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
        variant={variant === 'default' ? undefined : variant}
      />
      {error ? <span role="alert">{error}</span> : null}
      <span aria-live="polite">{copiedContent === content ? 'Copied' : ''}</span>
    </span>
  );
}

const HostSelectLabelContext = React.createContext<React.ReactNode>(undefined);
function HostSelectValue({ children, placeholder, ...props }: ProtoformUIProps['SelectValue']) {
  const label = React.useContext(HostSelectLabelContext);
  return (
    <SelectValue {...definedProps(props)} placeholder={typeof placeholder === 'string' ? placeholder : undefined}>
      {label ?? children ?? placeholder}
    </SelectValue>
  );
}

function HostSelect({ children, disabled, items, onValueChange, value }: ProtoformUIProps['Select']) {
  const label = items.find((item) => item.value === value)?.label;
  return (
    <HostSelectLabelContext value={label}>
      <Select
        disabled={disabled ?? false}
        items={items.map((item) => ({
          label: typeof item.label === 'string' ? item.label : (item.value ?? 'Not set'),
          value: JSON.stringify(item.value),
        }))}
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
    </HostSelectLabelContext>
  );
}

function HostSelectContent({ children, ...props }: ProtoformUIProps['SelectContent']) {
  return (
    <SelectContent {...definedProps(props)}>
      <SelectList>{children}</SelectList>
    </SelectContent>
  );
}
function HostSelectItem({ value, ...props }: ProtoformUIProps['SelectItem']) {
  return <SelectItem {...props} value={JSON.stringify(value)} />;
}

function HostRadioItem({ children, value, render: _render, ...props }: ProtoformUIProps['Radio']) {
  return (
    <Radio {...definedProps(props)} value={String(value ?? '')}>
      <span className="flex-1">{children}</span>
      <RadioIndicator />
    </Radio>
  );
}

function HostTextarea({ resize: _resize, ...props }: ProtoformUIProps['Textarea']) {
  return <Textarea {...props} />;
}

function HostTabsList({ variant: _variant, ...props }: ProtoformUIProps['TabsList']) {
  return <TabsList {...props} />;
}

function HostTabsTrigger({ variant: _variant, render: _render, ...props }: ProtoformUIProps['TabsTab']) {
  return <TabsTab {...definedProps({ ...props, onClick: undefined })} />;
}

function HostCalendar({ selected, onSelect, mode, testId, ...props }: ProtoformUIProps['Calendar']) {
  const value = selected
    ? `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selected.getDate()).padStart(2, '0')}`
    : null;
  return (
    <Calendar
      {...definedProps(props)}
      data-testid={testId ?? props['data-testid']}
      mode={mode}
      onValueChange={(next) => onSelect(typeof next === 'string' ? new Date(`${next}T12:00:00`) : undefined)}
      value={value}
    />
  );
}
function HostSlider({ onValueChange, defaultValue: _defaultValue, ...props }: ProtoformUIProps['Slider']) {
  return (
    <Slider
      {...definedProps(props)}
      onValueChange={(value) => onValueChange(typeof value === 'number' ? [value] : value)}
    />
  );
}
function HostToggleGroup({
  value,
  onValueChange,
  type: _type,
  defaultValue: _defaultValue,
  variant: _variant,
  ...props
}: ProtoformUIProps['ToggleGroup']) {
  return (
    <ToggleGroup
      {...definedProps(props)}
      onValueChange={(next) => onValueChange?.(next[0] ?? '')}
      value={value !== undefined && value !== '' ? [value] : []}
    />
  );
}
export const uiSdkHostComponents = {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Calendar: HostCalendar,
  Checkbox,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  CopyButton,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  Heading,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  Radio: HostRadioItem,
  Select: HostSelect,
  SelectContent: HostSelectContent,
  SelectGroup,
  SelectItem: HostSelectItem,
  SelectGroupLabel,
  SelectTrigger,
  SelectValue: HostSelectValue,
  Slider: HostSlider,
  Switch,
  Tabs,
  TabsPanel,
  TabsList: HostTabsList,
  TabsTab: HostTabsTrigger,
  Text,
  Textarea: HostTextarea,
  Toggle,
  ToggleGroup: HostToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} satisfies ProtoformUIComponentMap;
