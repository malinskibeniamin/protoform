import {
  Choicebox,
  ChoiceboxItem,
  ChoiceboxItemContent,
  ChoiceboxItemHeader,
  ChoiceboxItemIndicator,
  ChoiceboxItemTitle,
} from '@/components/ui/choicebox/index';
import { OptionCombobox } from '@/components/ui/combobox/index';
import { JSONField } from '@/components/ui/json-field/index';
import { KeyValueField } from '@/components/ui/key-value-field/index';
import { SimpleMultiSelect } from '@/components/ui/multi-select/index';
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
