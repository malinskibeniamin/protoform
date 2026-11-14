'use client';

import { checkbox } from '@ui-sdk/core/checkbox';
import { CheckboxGroup as ConnectedCheckboxGroup, Checkbox as GroupCheckbox } from '@ui-sdk/react/checkbox';
import { createParts, usePart, usePrimitive } from '@ui-sdk/react/primitive';
import { type ComponentProps, createContext, createElement, useContext } from 'react';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const primitive = withOptionSchema(checkbox);
const parts = createParts(primitive, { indicator: 'span' });
const GroupScope = createContext(false);
type CheckboxProps = ComponentProps<typeof GroupCheckbox>;
export function CheckboxGroup<T extends string = string>({
  children,
  ...props
}: ComponentProps<typeof ConnectedCheckboxGroup<T>>) {
  const renderedProps: ComponentProps<typeof ConnectedCheckboxGroup<T>> = {
    ...props,
    children: (state) => {
      const content = typeof children === 'function' ? children(state) : children;
      return <GroupScope value>{content}</GroupScope>;
    },
  };
  return createElement(ConnectedCheckboxGroup<T>, renderedProps);
}
export function Checkbox(props: CheckboxProps) {
  const grouped = useContext(GroupScope);
  return grouped === true ? createElement(GroupCheckbox, props) : createElement(NativeCheckbox, props);
}
function NativeCheckbox({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  readOnly,
  required,
  name,
  value,
  form,
  controller,
  debug,
  parent,
  ...props
}: CheckboxProps) {
  const handle = usePrimitive(
    primitive,
    definedProps({
      checked,
      defaultChecked,
      onCheckedChange,
      disabled,
      readOnly,
      required,
      name,
      value,
      form,
      controller,
      debug,
      parent,
    })
  );
  const control = usePart(handle, 'root', {}, props, 'button');
  const input = usePart(handle, 'input', {}, {}, 'input');
  return (
    <>
      {control}
      {input}
    </>
  );
}
export const CheckboxIndicator = parts.Indicator;
export type * from '@ui-sdk/core/checkbox';
