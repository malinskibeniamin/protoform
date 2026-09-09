"use client";

import React from "react";
import type { ProtoformUIComponentMap } from "./ui-component-map";
import type { ProtoformUIProps } from "./ui-props";

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

// AutoForm owns error associations even when consumer controls have no Field context.
export const AutoFormErrorDescriptionContext = React.createContext<string | undefined>(undefined);

function createUIComponent<TName extends keyof ProtoformUIProps>(
  name: TName,
  describesFieldError = false
): React.ComponentType<ProtoformUIProps[TName]> {
  function InjectedUIComponent(props: ProtoformUIProps[TName]) {
    const Component = useProtoformUIComponents()[name];
    const errorId = React.useContext(AutoFormErrorDescriptionContext);
    if (!Component) {
      throw new Error(`Protoform requires the "${name}" component. Supply it through AutoForm components.`);
    }
    const { testId, ...componentProps } = props;
    const ariaProps: React.AriaAttributes = props;
    return React.createElement(Component, {
      ...componentProps,
      ...(testId === undefined ? {} : { "data-testid": testId }),
      ...(describesFieldError && errorId
        ? { "aria-describedby": [ariaProps["aria-describedby"], errorId].filter(Boolean).join(" ") }
        : {}),
    });
  }
  InjectedUIComponent.displayName = `Protoform${name}`;
  return InjectedUIComponent;
}

export const Alert = createUIComponent("Alert");
export const AlertDescription = createUIComponent("AlertDescription");
export const AlertTitle = createUIComponent("AlertTitle");
export const Button = createUIComponent("Button");
export const Calendar = createUIComponent("Calendar");
export const Checkbox = createUIComponent("Checkbox");
export const Choicebox = createUIComponent("Choicebox");
export const ChoiceboxItem = createUIComponent("ChoiceboxItem");
export const ChoiceboxItemContent = createUIComponent("ChoiceboxItemContent");
export const ChoiceboxItemHeader = createUIComponent("ChoiceboxItemHeader");
export const ChoiceboxItemIndicator = createUIComponent("ChoiceboxItemIndicator");
export const ChoiceboxItemTitle = createUIComponent("ChoiceboxItemTitle");
export const Collapsible = createUIComponent("Collapsible");
export const CollapsibleContent = createUIComponent("CollapsibleContent");
export const CollapsibleTrigger = createUIComponent("CollapsibleTrigger");
export const Combobox = createUIComponent("Combobox");
export const CopyButton = createUIComponent("CopyButton");
export const Field = createUIComponent("Field");
export const FieldContent = createUIComponent("FieldContent");
export const FieldDescription = createUIComponent("FieldDescription");
export const FieldError = createUIComponent("FieldError");
export const FieldLabel = createUIComponent("FieldLabel");
export const Heading = createUIComponent("Heading");
export const Input = createUIComponent("Input", true);
export const InputGroup = createUIComponent("InputGroup");
export const InputGroupAddon = createUIComponent("InputGroupAddon");
export const InputGroupButton = createUIComponent("InputGroupButton");
export const InputGroupInput = createUIComponent("InputGroupInput", true);
export const InputGroupText = createUIComponent("InputGroupText");
export const JSONField = createUIComponent("JSONField");
export const KeyValueField = createUIComponent("KeyValueField");
export const Popover = createUIComponent("Popover");
export const PopoverContent = createUIComponent("PopoverContent");
export const PopoverTrigger = createUIComponent("PopoverTrigger");
export const RadioGroup = createUIComponent("RadioGroup");
export const RadioGroupItem = createUIComponent("RadioGroupItem");
export const Select = createUIComponent("Select");
export const SelectContent = createUIComponent("SelectContent");
export const SelectGroup = createUIComponent("SelectGroup");
export const SelectItem = createUIComponent("SelectItem");
export const SelectLabel = createUIComponent("SelectLabel");
export const SelectTrigger = createUIComponent("SelectTrigger");
export const SelectValue = createUIComponent("SelectValue");
export const SimpleMultiSelect = createUIComponent("SimpleMultiSelect");
export const Slider = createUIComponent("Slider");
export const Switch = createUIComponent("Switch");
export const Tabs = createUIComponent("Tabs");
export const TabsContent = createUIComponent("TabsContent");
export const TabsList = createUIComponent("TabsList");
export const TabsTrigger = createUIComponent("TabsTrigger");
export const Text = createUIComponent("Text");
export const Textarea = createUIComponent("Textarea", true);
export const Toggle = createUIComponent("Toggle");
export const ToggleGroup = createUIComponent("ToggleGroup");
export const ToggleGroupItem = createUIComponent("ToggleGroupItem");
export const Tooltip = createUIComponent("Tooltip");
export const TooltipContent = createUIComponent("TooltipContent");
export const TooltipProvider = createUIComponent("TooltipProvider");
export const TooltipTrigger = createUIComponent("TooltipTrigger");
