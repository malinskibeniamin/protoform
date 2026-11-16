import {
  Choicebox,
  ChoiceboxItem,
  ChoiceboxItemContent,
  ChoiceboxItemHeader,
  ChoiceboxItemIndicator,
  ChoiceboxItemTitle,
} from '@/components/ui/sdk/choicebox/index';
import { OptionCombobox } from '@/components/ui/sdk/combobox/index';
import { JSONField } from '@/components/ui/sdk/json-field/index';
import { KeyValueField } from '@/components/ui/sdk/key-value-field/index';
import { SimpleMultiSelect } from '@/components/ui/sdk/multi-select/index';
import type { ProtoformUIComponentMap } from './ui-component-map';
import { uiSdkHostComponents } from './ui-sdk-host';
export const uiSdkComponents = {
  ...uiSdkHostComponents,
  Combobox: OptionCombobox,
  Choicebox,
  ChoiceboxItem,
  ChoiceboxItemContent,
  ChoiceboxItemHeader,
  ChoiceboxItemIndicator,
  ChoiceboxItemTitle,
  JSONField,
  KeyValueField,
  SimpleMultiSelect,
} satisfies ProtoformUIComponentMap;

export type { ProtoformUIComponentMap } from './ui-component-map';
