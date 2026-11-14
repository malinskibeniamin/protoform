'use client';

import { type CommandItemProps, type CommandItemState, type CommandPageProps, command } from '@ui-sdk/core/command';
import {
  Command as DataCommand,
  CommandItems as DataCommandItems,
  CommandList as DataCommandList,
} from '@ui-sdk/react/command';
import { createParts, type PartProps, usePart } from '@ui-sdk/react/primitive';
import { type ComponentProps, createContext, createElement, Fragment, type ReactNode, useContext, useId } from 'react';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const primitive = withOptionSchema(command);
const parts = createParts(primitive, {
  input: 'input',
  item: 'div',
  'item-text': 'span',
  'item-icon': 'span',
  group: 'div',
  'group-label': 'div',
  separator: 'div',
  empty: 'div',
  status: 'div',
  shortcut: 'span',
});
const ItemLabel = createContext('');
export const Command = DataCommand;
export const CommandInput = parts.Input;
export const CommandGroup = parts.Group;
export const CommandGroupLabel = parts.GroupLabel;
export const CommandSeparator = parts.Separator;
export function CommandEmpty({ children, ...props }: Omit<ComponentProps<typeof parts.Empty>, 'stash'>) {
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
export const CommandStatus = parts.Status;
export const CommandItemIcon = parts.ItemIcon;
export const CommandList = DataCommandList;
export function CommandItem({
  children,
  label,
  value,
  ...props
}: CommandItemProps & Omit<PartProps<'div', CommandItemState>, 'value' | 'defaultValue' | 'onChange' | 'onSelect'>) {
  const generatedValue = useId();
  const itemValue = value ?? generatedValue;
  const renderedProps: ComponentProps<typeof parts.Item> = {
    ...definedProps(props),
    ...definedProps({ label, value: itemValue }),
    children: (state) => {
      const content = typeof children === 'function' ? children(state) : children;
      return <ItemLabel value={label ?? (typeof children === 'string' ? children : itemValue)}>{content}</ItemLabel>;
    },
  };
  return createElement(parts.Item, renderedProps);
}
export function CommandItemText({ children, ...props }: Omit<ComponentProps<typeof parts.ItemText>, 'text' | 'write'>) {
  const label = useContext(ItemLabel);
  const text = typeof children === 'string' ? children : label;
  const renderedProps: ComponentProps<typeof parts.ItemText> = {
    ...props,
    text,
    children:
      typeof children === 'string' || children === undefined
        ? (state) =>
            state.segments.map((segment, index) =>
              segment.match ? <mark key={`${text.slice(0, index)}:${segment.text}`}>{segment.text}</mark> : segment.text
            )
        : children,
  };
  return createElement(parts.ItemText, renderedProps);
}
export function CommandShortcut({ children, ...props }: ComponentProps<typeof parts.Shortcut>) {
  const renderedProps: ComponentProps<typeof parts.Shortcut> = {
    ...props,
    children: children ?? ((state) => state.text),
  };
  return createElement(parts.Shortcut, renderedProps);
}
export function CommandPage({ value, children }: CommandPageProps & { children?: ReactNode }) {
  return usePart(
    primitive,
    'page',
    definedProps({ value }),
    { render: () => createElement(Fragment, null, children) },
    'div'
  );
}
export const CommandItems = DataCommandItems;
export type * from '@ui-sdk/core/command';
