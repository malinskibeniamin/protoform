'use client';

import { type InputOptions, type InputState, input } from '@ui-sdk/core/input';
import { useFieldControl } from '@ui-sdk/react/field';
import { type PartProps, usePart, usePrimitive } from '@ui-sdk/react/primitive';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const primitive = withOptionSchema(input);
type InputProps = InputOptions & Omit<PartProps<'input', InputState>, 'value' | 'defaultValue' | 'onSelect'>;
export function Input({ value, defaultValue, onValueChange, controller, debug, ...props }: InputProps) {
  const field = useFieldControl(definedProps({ id: props.id }));
  const handle = usePrimitive(primitive, definedProps({ value, defaultValue, onValueChange, controller, debug }));
  const nativeProps = {
    ...props,
    ...definedProps({ name: props.name ?? field?.name }),
    ...definedProps({
      value,
      defaultValue,
      onChange: props.onChange ?? (value === undefined ? undefined : () => undefined),
    }),
  };
  return usePart(
    handle,
    'root',
    definedProps({ disabled: props.disabled ?? field?.disabled, readOnly: props.readOnly, required: props.required }),
    field === null ? nativeProps : field.props(nativeProps),
    'input'
  );
}
export type * from '@ui-sdk/core/input';
