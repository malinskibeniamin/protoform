'use client';

import { toggle } from '@ui-sdk/core/toggle';
import { createParts } from '@ui-sdk/react/primitive';
import { ToggleGroup as ConnectedToggleGroup, Toggle as GroupToggle } from '@ui-sdk/react/toggle';
import { type ComponentProps, createContext, createElement, useContext } from 'react';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(toggle), { root: 'button', icon: 'span' });
const GroupScope = createContext(false);
export function ToggleGroup<T extends string = string>({
  children,
  ...props
}: ComponentProps<typeof ConnectedToggleGroup<T>>) {
  const renderedProps: ComponentProps<typeof ConnectedToggleGroup<T>> = {
    ...props,
    children: (state) => {
      const content = typeof children === 'function' ? children(state) : children;
      return <GroupScope value>{content}</GroupScope>;
    },
  };
  return createElement(ConnectedToggleGroup<T>, renderedProps);
}
export function Toggle(props: ComponentProps<typeof GroupToggle>) {
  const grouped = useContext(GroupScope);
  return grouped === true ? createElement(GroupToggle, props) : createElement(parts.Root, definedProps(props));
}
export const ToggleIcon = parts.Icon;
export type * from '@ui-sdk/core/toggle';
