import React from 'react';
import {
  Choicebox,
  ChoiceboxItem,
  ChoiceboxItemContent,
  ChoiceboxItemHeader,
  ChoiceboxItemIndicator,
  ChoiceboxItemTitle,
} from '@/components/ui/choicebox';
import { Combobox } from '@/components/ui/combobox';
import { CopyButton } from '@/components/ui/copy-button';
import { JSONField } from '@/components/ui/json-field';
import { KeyValueField } from '@/components/ui/key-value-field';
import { SimpleMultiSelect } from '@/components/ui/multi-select';
import { Heading, Text } from '@/components/ui/typography';
import { shadcnHostComponents } from './shadcn-host';
import type { ProtoformUIComponentMap } from './ui-component-map';

function legacyTestIds(Component: React.ElementType) {
  return function LegacyControl(props: Record<string, unknown>) {
    return React.createElement(Component, {
      ...props,
      ...(props['data-testid'] === undefined ? {} : { testId: props['data-testid'] }),
    });
  };
}

export const shadcnUIComponents = {
  ...shadcnHostComponents,
  Choicebox: legacyTestIds(Choicebox),
  ChoiceboxItem: legacyTestIds(ChoiceboxItem),
  ChoiceboxItemContent: legacyTestIds(ChoiceboxItemContent),
  ChoiceboxItemHeader: legacyTestIds(ChoiceboxItemHeader),
  ChoiceboxItemIndicator: legacyTestIds(ChoiceboxItemIndicator),
  ChoiceboxItemTitle: legacyTestIds(ChoiceboxItemTitle),
  Combobox: legacyTestIds(Combobox),
  CopyButton: legacyTestIds(CopyButton),
  JSONField: legacyTestIds(JSONField),
  KeyValueField: legacyTestIds(KeyValueField),
  SimpleMultiSelect: legacyTestIds(SimpleMultiSelect),
  Heading: legacyTestIds(Heading),
  Text: legacyTestIds(Text),
} satisfies ProtoformUIComponentMap;
