"use client";

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ProtoformUIComponentMap } from "./ui-component-map";
import type { ProtoformUIProps } from "./ui-props";

function Heading({ level, ...props }: ProtoformUIProps["Heading"]) {
  const Tag = `h${level}` as const;
  return <Tag {...props} />;
}

function Text({ as: Tag = "p", variant: _variant, ...props }: ProtoformUIProps["Text"]) {
  return <Tag {...props} />;
}

function CopyButton({ content, size, variant, ...props }: ProtoformUIProps["CopyButton"]) {
  const [error, setError] = React.useState<string>();
  const [copiedContent, setCopiedContent] = React.useState<string>();
  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setError(undefined);
      setCopiedContent(content);
    } catch {
      setError("Could not copy. Select and copy the text manually.");
      setCopiedContent(undefined);
    }
  }
  return (
    <span>
      <Button
        {...props}
        onClick={copy}
        size={size === "default" ? undefined : size}
        type="button"
        variant={variant === "default" ? undefined : variant}
      />
      {error ? <span role="alert">{error}</span> : null}
      <span aria-live="polite">{copiedContent === content ? "Copied" : ""}</span>
    </span>
  );
}

// Radix Select accepts nonempty strings, not null. Encode every value so a real
// option can never collide with the unset sentinel. Keep this out of primitives.
function HostSelect({ children, disabled, items, onValueChange, value }: ProtoformUIProps["Select"]) {
  return (
    <Select
      disabled={disabled}
      onValueChange={(next) => {
        if (typeof next !== "string") {
          return;
        }
        const decoded: unknown = JSON.parse(next);
        if (decoded === null || typeof decoded === "string") {
          onValueChange(decoded);
        } else {
          throw new TypeError("Invalid Protoform selection");
        }
      }}
      value={value === null && items && !items.some((item) => item.value === null) ? "" : JSON.stringify(value)}
    >
      {children}
    </Select>
  );
}

function HostSelectItem({ value, ...props }: ProtoformUIProps["SelectItem"]) {
  return <SelectItem {...props} value={JSON.stringify(value)} />;
}

function HostRadioItem({
  children,
  disabled,
  id,
  value,
  "data-testid": testId,
  "aria-label": ariaLabel,
}: ProtoformUIProps["RadioGroupItem"]) {
  return (
    <label className="flex items-center gap-2" htmlFor={id}>
      <RadioGroupItem aria-label={ariaLabel} data-testid={testId} disabled={disabled} id={id} value={value} />
      {children}
    </label>
  );
}

function HostTextarea({ resize: _resize, ...props }: ProtoformUIProps["Textarea"]) {
  return <Textarea {...props} />;
}

function HostTabsList({ variant: _variant, ...props }: ProtoformUIProps["TabsList"]) {
  return <TabsList {...props} />;
}

function HostTabsTrigger({ variant: _variant, ...props }: ProtoformUIProps["TabsTrigger"]) {
  // The renderer places this delegated trigger inside its host TabsList.
  return React.createElement(TabsTrigger, props);
}

/** Editable adapter for existing Radix-style shadcn controls. No primitives or theme are installed. */
export const shadcnHostComponents = {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Calendar,
  Checkbox,
  Collapsible,
  CollapsibleContent,
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
  RadioGroupItem: HostRadioItem,
  Select: HostSelect,
  SelectContent,
  SelectGroup,
  SelectItem: HostSelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList: HostTabsList,
  TabsTrigger: HostTabsTrigger,
  Text,
  Textarea: HostTextarea,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} satisfies ProtoformUIComponentMap;
