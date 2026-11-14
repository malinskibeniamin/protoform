'use client';

import { type SwitchOptions, type SwitchState, switchPrimitive } from '@ui-sdk/core/switch';
import { createParts, type PartProps, usePart, usePrimitive } from '@ui-sdk/react/primitive';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const primitive = withOptionSchema(switchPrimitive);
const parts = createParts(primitive, { thumb: 'span' });
type SwitchProps = SwitchOptions &
  Omit<
    PartProps<'button', SwitchState>,
    'value' | 'name' | 'form' | 'defaultChecked' | 'defaultValue' | 'onChange' | 'onSelect'
  >;
export function Switch({
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
  ...props
}: SwitchProps) {
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
export const SwitchThumb = parts.Thumb;
export type * from '@ui-sdk/core/switch';
