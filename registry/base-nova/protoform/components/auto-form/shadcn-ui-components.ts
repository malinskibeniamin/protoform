import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Choicebox,
  ChoiceboxItem,
  ChoiceboxItemContent,
  ChoiceboxItemHeader,
  ChoiceboxItemIndicator,
  ChoiceboxItemTitle,
} from "@/components/ui/choicebox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Combobox } from "@/components/ui/combobox";
import { CopyButton } from "@/components/ui/copy-button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { JSONField } from "@/components/ui/json-field";
import { KeyValueField } from "@/components/ui/key-value-field";
import { SimpleMultiSelect } from "@/components/ui/multi-select";
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
import { Heading, Text } from "@/components/ui/typography";
import type { ProtoformUIComponentMap } from "./ui-component-map";

// Preserve legacy testId-based controls without leaking that custom prop into host primitives.
function legacyTestIds(Component: React.ElementType) {
  return function LegacyControl(props: Record<string, unknown>) {
    return React.createElement(Component, {
      ...props,
      ...(props["data-testid"] === undefined ? {} : { testId: props["data-testid"] }),
    });
  };
}

export const shadcnUIComponents = {
  Alert: legacyTestIds(Alert),
  AlertDescription: legacyTestIds(AlertDescription),
  AlertTitle: legacyTestIds(AlertTitle),
  Button: legacyTestIds(Button),
  Calendar: legacyTestIds(Calendar),
  Checkbox: legacyTestIds(Checkbox),
  Choicebox: legacyTestIds(Choicebox),
  ChoiceboxItem: legacyTestIds(ChoiceboxItem),
  ChoiceboxItemContent: legacyTestIds(ChoiceboxItemContent),
  ChoiceboxItemHeader: legacyTestIds(ChoiceboxItemHeader),
  ChoiceboxItemIndicator: legacyTestIds(ChoiceboxItemIndicator),
  ChoiceboxItemTitle: legacyTestIds(ChoiceboxItemTitle),
  Collapsible: legacyTestIds(Collapsible),
  CollapsibleContent: legacyTestIds(CollapsibleContent),
  CollapsibleTrigger: legacyTestIds(CollapsibleTrigger),
  Combobox: legacyTestIds(Combobox),
  CopyButton: legacyTestIds(CopyButton),
  Field: legacyTestIds(Field),
  FieldContent: legacyTestIds(FieldContent),
  FieldDescription: legacyTestIds(FieldDescription),
  FieldError: legacyTestIds(FieldError),
  FieldLabel: legacyTestIds(FieldLabel),
  Heading: legacyTestIds(Heading),
  Input: legacyTestIds(Input),
  InputGroup: legacyTestIds(InputGroup),
  InputGroupAddon: legacyTestIds(InputGroupAddon),
  InputGroupButton: legacyTestIds(InputGroupButton),
  InputGroupInput: legacyTestIds(InputGroupInput),
  InputGroupText: legacyTestIds(InputGroupText),
  JSONField: legacyTestIds(JSONField),
  KeyValueField: legacyTestIds(KeyValueField),
  Popover: legacyTestIds(Popover),
  PopoverContent: legacyTestIds(PopoverContent),
  PopoverTrigger: legacyTestIds(PopoverTrigger),
  RadioGroup: legacyTestIds(RadioGroup),
  RadioGroupItem: legacyTestIds(RadioGroupItem),
  Select: legacyTestIds(Select),
  SelectContent: legacyTestIds(SelectContent),
  SelectGroup: legacyTestIds(SelectGroup),
  SelectItem: legacyTestIds(SelectItem),
  SelectLabel: legacyTestIds(SelectLabel),
  SelectTrigger: legacyTestIds(SelectTrigger),
  SelectValue: legacyTestIds(SelectValue),
  SimpleMultiSelect: legacyTestIds(SimpleMultiSelect),
  Slider: legacyTestIds(Slider),
  Switch: legacyTestIds(Switch),
  Tabs: legacyTestIds(Tabs),
  TabsContent: legacyTestIds(TabsContent),
  TabsList: legacyTestIds(TabsList),
  TabsTrigger: legacyTestIds(TabsTrigger),
  Text: legacyTestIds(Text),
  Textarea: legacyTestIds(Textarea),
  Toggle: legacyTestIds(Toggle),
  ToggleGroup: legacyTestIds(ToggleGroup),
  ToggleGroupItem: legacyTestIds(ToggleGroupItem),
  Tooltip: legacyTestIds(Tooltip),
  TooltipContent: legacyTestIds(TooltipContent),
  TooltipProvider: legacyTestIds(TooltipProvider),
  TooltipTrigger: legacyTestIds(TooltipTrigger),
} satisfies ProtoformUIComponentMap;
