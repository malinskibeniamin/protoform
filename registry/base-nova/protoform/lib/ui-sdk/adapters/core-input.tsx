'use client';

import { type InputOptions, type InputState, input } from '@ui-sdk/core/input';
import { type PartProps, usePart, usePrimitive } from '@ui-sdk/react/primitive';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const primitive = withOptionSchema(input);
type InputProps = InputOptions & Omit<PartProps<'input', InputState>, 'value' | 'defaultValue' | 'onSelect'>;
export function Input({ value, defaultValue, onValueChange, controller, debug, ...props }: InputProps) {
  const handle = usePrimitive(primitive, definedProps({ value, defaultValue, onValueChange, controller, debug }));
  return usePart(
    handle,
    'root',
    definedProps({ disabled: props.disabled, readOnly: props.readOnly, required: props.required }),
    {
      ...props,
      ...definedProps({
        value,
        defaultValue,
        onChange: props.onChange ?? (value === undefined ? undefined : () => undefined),
      }),
    },
    'input'
  );
}
export type * from '@ui-sdk/core/input';
