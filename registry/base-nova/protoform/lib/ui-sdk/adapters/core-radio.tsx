'use client';

import {
  type RadioGroupOptions,
  type RadioGroupState,
  type RadioProps,
  type RadioState,
  radioGroup,
} from '@ui-sdk/core/radio';
import { createParts, type PartProps, usePart } from '@ui-sdk/react/primitive';
import { createElement } from 'react';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const primitive = withOptionSchema(radioGroup);
const parts = createParts(primitive, { group: 'div', indicator: 'span' });

export function RadioGroup<T extends string = string>({
  value,
  defaultValue,
  onValueChange,
  disabled,
  readOnly,
  required,
  name,
  form,
  loop,
  controller,
  debug,
  ...props
}: RadioGroupOptions<T> & Omit<PartProps<'div', RadioGroupState>, 'defaultValue' | 'onChange' | 'onSelect'>) {
  const options = definedProps({
    value,
    defaultValue,
    onValueChange,
    disabled,
    readOnly,
    required,
    name,
    form,
    loop,
    controller,
    debug,
  });
  return createElement(parts.Root<T>, options, createElement(parts.Group, definedProps(props)));
}

export function Radio({
  value,
  disabled,
  ...props
}: RadioProps & Omit<PartProps<'button', RadioState>, 'value' | 'onSelect'>) {
  const slotProps = definedProps({ value, disabled });
  const control = usePart(primitive, 'root', slotProps, props, 'button');
  const input = usePart(primitive, 'input', slotProps, {}, 'input');
  return (
    <>
      {control}
      {input}
    </>
  );
}
export const RadioIndicator = parts.Indicator;
export type * from '@ui-sdk/core/radio';
