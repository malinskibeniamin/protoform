'use client';

import { type TextareaOptions, type TextareaState, textarea } from '@ui-sdk/core/input';
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
  const handle = usePrimitive(
    primitive,
    definedProps({ value, defaultValue, onValueChange, controller, debug, autoResize, onSubmit, submitShortcut })
  );
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
    'textarea'
  );
}
export type * from '@ui-sdk/core/input';
