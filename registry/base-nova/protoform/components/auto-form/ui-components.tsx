"use client";

import React from "react";
import type {
  Alert as AlertComponent,
  AlertDescription as AlertDescriptionComponent,
  AlertTitle as AlertTitleComponent,
} from "@/components/ui/alert";
import type { Button as ButtonComponent } from "@/components/ui/button";
import type { Calendar as CalendarComponent } from "@/components/ui/calendar";
import type { Checkbox as CheckboxComponent } from "@/components/ui/checkbox";
import type {
  Choicebox as ChoiceboxComponent,
  ChoiceboxItem as ChoiceboxItemComponent,
  ChoiceboxItemContent as ChoiceboxItemContentComponent,
  ChoiceboxItemHeader as ChoiceboxItemHeaderComponent,
  ChoiceboxItemIndicator as ChoiceboxItemIndicatorComponent,
  ChoiceboxItemTitle as ChoiceboxItemTitleComponent,
} from "@/components/ui/choicebox";
import type {
  Collapsible as CollapsibleComponent,
  CollapsibleContent as CollapsibleContentComponent,
  CollapsibleTrigger as CollapsibleTriggerComponent,
} from "@/components/ui/collapsible";
import type { Combobox as ComboboxComponent } from "@/components/ui/combobox";
import type { CopyButton as CopyButtonComponent } from "@/components/ui/copy-button";
import type {
  Field as FieldComponent,
  FieldContent as FieldContentComponent,
  FieldDescription as FieldDescriptionComponent,
  FieldError as FieldErrorComponent,
  FieldLabel as FieldLabelComponent,
} from "@/components/ui/field";
import type { Input as InputComponent } from "@/components/ui/input";
import type {
  InputGroupAddon as InputGroupAddonComponent,
  InputGroupButton as InputGroupButtonComponent,
  InputGroup as InputGroupComponent,
  InputGroupInput as InputGroupInputComponent,
  InputGroupText as InputGroupTextComponent,
} from "@/components/ui/input-group";
import type { JSONField as JSONFieldComponent } from "@/components/ui/json-field";
import type { KeyValueField as KeyValueFieldComponent } from "@/components/ui/key-value-field";
import type { SimpleMultiSelect as SimpleMultiSelectComponent } from "@/components/ui/multi-select";
import type {
  Popover as PopoverComponent,
  PopoverContent as PopoverContentComponent,
  PopoverTrigger as PopoverTriggerComponent,
  PopoverTriggerProps,
} from "@/components/ui/popover";
import type {
  RadioGroup as RadioGroupComponent,
  RadioGroupItem as RadioGroupItemComponent,
} from "@/components/ui/radio-group";
import type {
  Select as SelectComponent,
  SelectContent as SelectContentComponent,
  SelectGroup as SelectGroupComponent,
  SelectItem as SelectItemComponent,
  SelectLabel as SelectLabelComponent,
  SelectTrigger as SelectTriggerComponent,
  SelectValue as SelectValueComponent,
} from "@/components/ui/select";
import type { Slider as SliderComponent } from "@/components/ui/slider";
import type { Switch as SwitchComponent } from "@/components/ui/switch";
import type {
  Tabs as TabsComponent,
  TabsContent as TabsContentComponent,
  TabsList as TabsListComponent,
  TabsTrigger as TabsTriggerComponent,
} from "@/components/ui/tabs";
import type { Textarea as TextareaComponent } from "@/components/ui/textarea";
import type { Toggle as ToggleComponent } from "@/components/ui/toggle";
import type {
  ToggleGroup as ToggleGroupComponent,
  ToggleGroupItem as ToggleGroupItemComponent,
} from "@/components/ui/toggle-group";
import type {
  Tooltip as TooltipComponent,
  TooltipContent as TooltipContentComponent,
  TooltipProvider as TooltipProviderComponent,
  TooltipTrigger as TooltipTriggerComponent,
} from "@/components/ui/tooltip";
import type { Heading as HeadingComponent, Text as TextComponent } from "@/components/ui/typography";
import type { ProtoformUIComponentMap } from "./ui-component-map";

type UIComponent = React.ElementType;

export type { ComboboxOption, ProtoformUIComponentMap } from "./ui-component-map";

const ProtoformUIContext = React.createContext<ProtoformUIComponentMap | undefined>(undefined);

export function ProtoformUIProvider({
  children,
  components,
}: {
  children: React.ReactNode;
  components: ProtoformUIComponentMap;
}) {
  return <ProtoformUIContext.Provider value={components}>{children}</ProtoformUIContext.Provider>;
}

export function useProtoformUIComponents(): ProtoformUIComponentMap {
  const components = React.use(ProtoformUIContext);
  if (!components) {
    throw new Error("ProtoformUIProvider is required to render Protoform controls.");
  }
  return components;
}

function createUIComponent<TComponent extends UIComponent>(
  name: keyof ProtoformUIComponentMap
): React.ComponentType<React.ComponentProps<TComponent>> {
  function InjectedUIComponent(props: React.ComponentProps<TComponent>) {
    const Component = useProtoformUIComponents()[name];
    return React.createElement(Component, props);
  }
  InjectedUIComponent.displayName = `Protoform${name}`;
  return InjectedUIComponent;
}

export const Alert = createUIComponent<typeof AlertComponent>("Alert");
export const AlertDescription = createUIComponent<typeof AlertDescriptionComponent>("AlertDescription");
export const AlertTitle = createUIComponent<typeof AlertTitleComponent>("AlertTitle");
export const Button = createUIComponent<typeof ButtonComponent>("Button");
export const Calendar = createUIComponent<typeof CalendarComponent>("Calendar");
export const Checkbox = createUIComponent<typeof CheckboxComponent>("Checkbox");
export const Choicebox = createUIComponent<typeof ChoiceboxComponent>("Choicebox");
export const ChoiceboxItem = createUIComponent<typeof ChoiceboxItemComponent>("ChoiceboxItem");
export const ChoiceboxItemContent = createUIComponent<typeof ChoiceboxItemContentComponent>("ChoiceboxItemContent");
export const ChoiceboxItemHeader = createUIComponent<typeof ChoiceboxItemHeaderComponent>("ChoiceboxItemHeader");
export const ChoiceboxItemIndicator =
  createUIComponent<typeof ChoiceboxItemIndicatorComponent>("ChoiceboxItemIndicator");
export const ChoiceboxItemTitle = createUIComponent<typeof ChoiceboxItemTitleComponent>("ChoiceboxItemTitle");
export const Collapsible = createUIComponent<typeof CollapsibleComponent>("Collapsible");
export const CollapsibleContent = createUIComponent<typeof CollapsibleContentComponent>("CollapsibleContent");
export const CollapsibleTrigger = createUIComponent<typeof CollapsibleTriggerComponent>("CollapsibleTrigger");
export const Combobox = createUIComponent<typeof ComboboxComponent>("Combobox");
export const CopyButton = createUIComponent<typeof CopyButtonComponent>("CopyButton");
export const Field = createUIComponent<typeof FieldComponent>("Field");
export const FieldContent = createUIComponent<typeof FieldContentComponent>("FieldContent");
export const FieldDescription = createUIComponent<typeof FieldDescriptionComponent>("FieldDescription");
export const FieldError = createUIComponent<typeof FieldErrorComponent>("FieldError");
export const FieldLabel = createUIComponent<typeof FieldLabelComponent>("FieldLabel");
export const Heading = createUIComponent<typeof HeadingComponent>("Heading");
export const Input = createUIComponent<typeof InputComponent>("Input");
export const InputGroup = createUIComponent<typeof InputGroupComponent>("InputGroup");
export const InputGroupAddon = createUIComponent<typeof InputGroupAddonComponent>("InputGroupAddon");
export const InputGroupButton = createUIComponent<typeof InputGroupButtonComponent>("InputGroupButton");
export const InputGroupInput = createUIComponent<typeof InputGroupInputComponent>("InputGroupInput");
export const InputGroupText = createUIComponent<typeof InputGroupTextComponent>("InputGroupText");
export const JSONField = createUIComponent<typeof JSONFieldComponent>("JSONField");
export const KeyValueField = createUIComponent<typeof KeyValueFieldComponent>("KeyValueField");
export const Popover = createUIComponent<typeof PopoverComponent>("Popover");
export const PopoverContent = createUIComponent<typeof PopoverContentComponent>("PopoverContent");
export const PopoverTrigger: React.ComponentType<PopoverTriggerProps> =
  createUIComponent<typeof PopoverTriggerComponent>("PopoverTrigger");
export const RadioGroup = createUIComponent<typeof RadioGroupComponent>("RadioGroup");
export const RadioGroupItem = createUIComponent<typeof RadioGroupItemComponent>("RadioGroupItem");
export const Select = createUIComponent<typeof SelectComponent>("Select");
export const SelectContent = createUIComponent<typeof SelectContentComponent>("SelectContent");
export const SelectGroup = createUIComponent<typeof SelectGroupComponent>("SelectGroup");
export const SelectItem = createUIComponent<typeof SelectItemComponent>("SelectItem");
export const SelectLabel = createUIComponent<typeof SelectLabelComponent>("SelectLabel");
export const SelectTrigger = createUIComponent<typeof SelectTriggerComponent>("SelectTrigger");
export const SelectValue = createUIComponent<typeof SelectValueComponent>("SelectValue");
export const SimpleMultiSelect = createUIComponent<typeof SimpleMultiSelectComponent>("SimpleMultiSelect");
export const Slider = createUIComponent<typeof SliderComponent>("Slider");
export const Switch = createUIComponent<typeof SwitchComponent>("Switch");
export const Tabs = createUIComponent<typeof TabsComponent>("Tabs");
export const TabsContent = createUIComponent<typeof TabsContentComponent>("TabsContent");
export const TabsList = createUIComponent<typeof TabsListComponent>("TabsList");
export const TabsTrigger = createUIComponent<typeof TabsTriggerComponent>("TabsTrigger");
export const Text = createUIComponent<typeof TextComponent>("Text");
export const Textarea = createUIComponent<typeof TextareaComponent>("Textarea");
export const Toggle = createUIComponent<typeof ToggleComponent>("Toggle");
export const ToggleGroup = createUIComponent<typeof ToggleGroupComponent>("ToggleGroup");
export const ToggleGroupItem = createUIComponent<typeof ToggleGroupItemComponent>("ToggleGroupItem");
export const Tooltip = createUIComponent<typeof TooltipComponent>("Tooltip");
export const TooltipContent = createUIComponent<typeof TooltipContentComponent>("TooltipContent");
export const TooltipProvider = createUIComponent<typeof TooltipProviderComponent>("TooltipProvider");
export const TooltipTrigger = createUIComponent<typeof TooltipTriggerComponent>("TooltipTrigger");
