'use client';

import { otpInput } from '@ui-sdk/core/otp-input';
import { createParts } from '@ui-sdk/react/primitive';
import { type ComponentProps, createElement } from 'react';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(otpInput), {
  root: 'div',
  control: 'input',
  group: 'div',
  slot: 'div',
  separator: 'div',
});
type InputNames = Pick<
  ComponentProps<'input'>,
  'id' | 'autoFocus' | 'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'aria-invalid'
>;
export function OTPInput({
  id,
  autoFocus,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  children,
  ...props
}: ComponentProps<typeof parts.Root> & InputNames) {
  const renderedProps: ComponentProps<typeof parts.Root> = {
    ...props,
    children: (state) => {
      const content = typeof children === 'function' ? children(state) : children;
      return (
        <>
          {content}
          {createElement(
            parts.Control,
            definedProps({
              id,
              autoFocus,
              'aria-label': label,
              'aria-labelledby': labelledBy,
              'aria-describedby': describedBy,
              'aria-invalid': invalid,
              onChange: () => undefined,
            })
          )}
        </>
      );
    },
  };
  return createElement(parts.Root, renderedProps);
}
export const OTPInputGroup = parts.Group;
export const OTPInputSeparator = parts.Separator;
export function OTPInputSlot({ children, ...props }: ComponentProps<typeof parts.Slot>) {
  const renderedProps: ComponentProps<typeof parts.Slot> = { ...props, children: children ?? ((state) => state.char) };
  return createElement(parts.Slot, renderedProps);
}
export type * from '@ui-sdk/core/otp-input';
