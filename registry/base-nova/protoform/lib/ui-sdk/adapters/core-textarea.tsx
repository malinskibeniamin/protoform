'use client';

import { type TextareaOptions, type TextareaState, textarea } from '@ui-sdk/core/input';
import { useFieldControl } from '@ui-sdk/react/field';
import { type PartProps, usePart, usePrimitive } from '@ui-sdk/react/primitive';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const primitive = withOptionSchema(textarea);
type TextareaProps = TextareaOptions &
  Omit<PartProps<'textarea', TextareaState>, 'value' | 'defaultValue' | 'onSelect' | 'onSubmit'>;
export function Textarea({
  value,
  defaultValue,
  onValueChange,
  controller,
  debug,
  autoResize,
  onSubmit,
  submitShortcut,
  ...props
}: TextareaProps) {
  const field = useFieldControl(definedProps({ id: props.id }));
  const handle = usePrimitive(
    primitive,
    definedProps({ value, defaultValue, onValueChange, controller, debug, autoResize, onSubmit, submitShortcut })
  );
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
    'textarea'
  );
}
export type * from '@ui-sdk/core/input';
