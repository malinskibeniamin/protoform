'use client';

import { select } from '@ui-sdk/core/select';
import { createParts, usePart } from '@ui-sdk/react/primitive';
import {
  Select as ConnectedRoot,
  SelectTrigger as ControllerTrigger,
  SelectContent as RetainedSelectContent,
  SelectItemIcon as RetainedSelectItemIcon,
  SelectItems as RetainedSelectItems,
  SelectItemText as RetainedSelectItemText,
  SelectList as RetainedSelectList,
  SelectSelectAll as RetainedSelectSelectAll,
  SelectValueIcon as RetainedSelectValueIcon,
} from '@ui-sdk/react/select';
import { type ComponentProps, createContext, createElement, useContext, useId } from 'react';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const primitive = withOptionSchema(select);
const parts = createParts(primitive, {
  label: 'div',
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
export const SelectLabel = parts.Label;
export const SelectItem = parts.Item;
export const SelectItemIndicator = parts.ItemIndicator;
export const SelectGroup = parts.Group;
export const SelectGroupLabel = parts.GroupLabel;
export const SelectSeparator = parts.Separator;
export const SelectStatus = parts.Status;
export const SelectClear = parts.Clear;
export const SelectArrow = parts.Arrow;
const RootPlaceholderContext = createContext<string | undefined>(undefined);
export function Select<T = string, Multiple extends boolean | undefined = false>(
  props: ComponentProps<typeof ConnectedRoot<T, Multiple>>
) {
  return (
    <RootPlaceholderContext value={props.placeholder}>
      {createElement(ConnectedRoot<T, Multiple>, props)}
    </RootPlaceholderContext>
  );
}
export function SelectTrigger({ controller, ...props }: ComponentProps<typeof ControllerTrigger>) {
  return controller === undefined
    ? createElement(parts.Trigger, definedProps(props))
    : createElement(ControllerTrigger, { ...props, controller });
}
export const SelectInput = parts.Input;
export function SelectValue({
  children,
  placeholder,
  maxLabels,
  getMoreLabel,
  id,
  ...props
}: Omit<ComponentProps<typeof parts.Value>, 'text'>) {
  const generatedId = useId();
  const root = useContext(RootPlaceholderContext);
  return usePart(
    primitive,
    'value',
    definedProps({ id: id ?? generatedId, placeholder, maxLabels, getMoreLabel, text: false }),
    {
      ...props,
      children: (state) => {
        if (typeof children === 'function') {
          return children(state);
        }
        if (children !== undefined && children !== null) {
          return children;
        }
        return state.placeholder ? (placeholder ?? root ?? '') : state.label;
      },
    },
    'span'
  );
}
export function SelectEmpty({ children, ...props }: Omit<ComponentProps<typeof parts.Empty>, 'stash'>) {
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
export type * from '@ui-sdk/core/select';

export const SelectContent = RetainedSelectContent;
export const SelectItemIcon = RetainedSelectItemIcon;
export const SelectItems = RetainedSelectItems;
export function SelectItemText(props: ComponentProps<typeof RetainedSelectItemText>) {
  if (typeof props.children !== 'string') {
    return createElement(RetainedSelectItemText, props);
  }
  const renderedProps = { ...props, children: props.children };
  return createElement(OwnedItemText, renderedProps);
}
function OwnedItemText({
  children,
  ...props
}: Omit<ComponentProps<typeof RetainedSelectItemText>, 'children'> & { children: string }) {
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
export const SelectList = RetainedSelectList;
export const SelectSelectAll = RetainedSelectSelectAll;
export const SelectValueIcon = RetainedSelectValueIcon;
