import type React from "react";

type UIComponent = React.ElementType;

export interface ComboboxOption {
  data?: unknown;
  disabled?: boolean | undefined;
  group?: string | undefined;
  groupTestId?: string | undefined;
  label: string;
  testId?: string | undefined;
  value: string;
}

/** Exhaustive host-owned component boundary for Protoform's registry-installed renderer. */
export interface ProtoformUIComponentMap {
  Alert: UIComponent;
  AlertDescription: UIComponent;
  AlertTitle: UIComponent;
  Button: UIComponent;
  Calendar: UIComponent;
  Checkbox: UIComponent;
  Choicebox: UIComponent;
  ChoiceboxItem: UIComponent;
  ChoiceboxItemContent: UIComponent;
  ChoiceboxItemHeader: UIComponent;
  ChoiceboxItemIndicator: UIComponent;
  ChoiceboxItemTitle: UIComponent;
  Collapsible: UIComponent;
  CollapsibleContent: UIComponent;
  CollapsibleTrigger: UIComponent;
  Combobox: UIComponent;
  CopyButton: UIComponent;
  Field: UIComponent;
  FieldContent: UIComponent;
  FieldDescription: UIComponent;
  FieldError: UIComponent;
  FieldLabel: UIComponent;
  Heading: UIComponent;
  Input: UIComponent;
  InputGroup: UIComponent;
  InputGroupAddon: UIComponent;
  InputGroupButton: UIComponent;
  InputGroupInput: UIComponent;
  InputGroupText: UIComponent;
  JSONField: UIComponent;
  KeyValueField: UIComponent;
  Popover: UIComponent;
  PopoverContent: UIComponent;
  PopoverTrigger: UIComponent;
  RadioGroup: UIComponent;
  RadioGroupItem: UIComponent;
  Select: UIComponent;
  SelectContent: UIComponent;
  SelectGroup: UIComponent;
  SelectItem: UIComponent;
  SelectLabel: UIComponent;
  SelectTrigger: UIComponent;
  SelectValue: UIComponent;
  SimpleMultiSelect: UIComponent;
  Slider: UIComponent;
  Switch: UIComponent;
  Tabs: UIComponent;
  TabsContent: UIComponent;
  TabsList: UIComponent;
  TabsTrigger: UIComponent;
  Text: UIComponent;
  Textarea: UIComponent;
  Toggle: UIComponent;
  ToggleGroup: UIComponent;
  ToggleGroupItem: UIComponent;
  Tooltip: UIComponent;
  TooltipContent: UIComponent;
  TooltipProvider: UIComponent;
  TooltipTrigger: UIComponent;
}
