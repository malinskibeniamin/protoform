'use client';

import { combobox } from '@ui-sdk/core/combobox';
import {
  Combobox as ConnectedRoot,
  type ComboboxInput as NativeInput,
  ComboboxChip as RetainedComboboxChip,
  ComboboxChipRemove as RetainedComboboxChipRemove,
  ComboboxChips as RetainedComboboxChips,
  ComboboxChipsOverflow as RetainedComboboxChipsOverflow,
  ComboboxContent as RetainedComboboxContent,
  ComboboxCreate as RetainedComboboxCreate,
  ComboboxItemIcon as RetainedComboboxItemIcon,
  ComboboxItems as RetainedComboboxItems,
  ComboboxItemText as RetainedComboboxItemText,
  ComboboxList as RetainedComboboxList,
  ComboboxSelectAll as RetainedComboboxSelectAll,
  ComboboxValueIcon as RetainedComboboxValueIcon,
} from '@ui-sdk/react/combobox';
import { createParts, usePart } from '@ui-sdk/react/primitive';
import { type ComponentProps, createElement, Fragment, useId } from 'react';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const primitive = withOptionSchema(combobox);
const parts = createParts(primitive, {
  label: 'label',
  input: 'input',
  item: 'div',
  'item-indicator': 'span',
  'item-text': 'span',
  group: 'div',
  'group-label': 'div',
  separator: 'div',
  status: 'div',
  clear: 'button',
  arrow: 'div',
  value: 'span',
  empty: 'div',
  trigger: 'button',
});
export const ComboboxLabel = parts.Label;
export const ComboboxItem = parts.Item;
export const ComboboxItemIndicator = parts.ItemIndicator;
export const ComboboxGroup = parts.Group;
export const ComboboxGroupLabel = parts.GroupLabel;
export const ComboboxSeparator = parts.Separator;
export const ComboboxStatus = parts.Status;
export const ComboboxClear = parts.Clear;
export const ComboboxArrow = parts.Arrow;
export const Combobox = ConnectedRoot;
export const ComboboxTrigger = parts.Trigger;
export function ComboboxInput(props: ComponentProps<typeof NativeInput>) {
  return createElement(parts.Input, definedProps(props));
}
export function ComboboxValue({
  children,
  ...props
}: ComponentProps<typeof import('@ui-sdk/react/combobox').ComboboxValue>) {
  const id = useId();
  return usePart(
    primitive,
    'value',
    { ...props, id },
    {
      render: (_elementProps, state) =>
        createElement(Fragment, null, typeof children === 'function' ? children(state) : (children ?? state.label)),
    },
    'span'
  );
}
export function ComboboxEmpty({ children, ...props }: Omit<ComponentProps<typeof parts.Empty>, 'stash'>) {
  return usePart(
    primitive,
    'empty',
    { stash: typeof children !== 'function' },
    {
      ...props,
      children: (state) => {
        if (typeof children === 'function') {
          return children(state);
        }
        return state.empty ? children : null;
      },
    },
    'div'
  );
}
export type * from '@ui-sdk/core/combobox';

export const ComboboxChip = RetainedComboboxChip;
export const ComboboxChipRemove = RetainedComboboxChipRemove;
export const ComboboxChips = RetainedComboboxChips;
export const ComboboxChipsOverflow = RetainedComboboxChipsOverflow;
export const ComboboxContent = RetainedComboboxContent;
export const ComboboxCreate = RetainedComboboxCreate;
export const ComboboxItemIcon = RetainedComboboxItemIcon;
export const ComboboxItems = RetainedComboboxItems;
export function ComboboxItemText(props: ComponentProps<typeof RetainedComboboxItemText>) {
  if (typeof props.children !== 'string') {
    return createElement(RetainedComboboxItemText, props);
  }
  const renderedProps = { ...props, children: props.children };
  return createElement(OwnedItemText, renderedProps);
}
function OwnedItemText({
  children,
  ...props
}: Omit<ComponentProps<typeof RetainedComboboxItemText>, 'children'> & { children: string }) {
  const id = useId();
  return usePart(
    primitive,
    'item-text',
    { id, text: children, write: false },
    {
      ...props,
      children: (state) =>
        state.segments.map((segment, index) =>
          segment.match ? <mark key={`${children.slice(0, index)}:${segment.text}`}>{segment.text}</mark> : segment.text
        ),
    },
    'span'
  );
}
export const ComboboxList = RetainedComboboxList;
export const ComboboxSelectAll = RetainedComboboxSelectAll;
export const ComboboxValueIcon = RetainedComboboxValueIcon;
