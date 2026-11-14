'use client';

import { type ButtonActionDetails, type ButtonOptions, type ButtonState, button } from '@ui-sdk/core/button';
import { Button as ComposedActionButton } from '@ui-sdk/react/button';
import { type PartProps, usePart, usePrimitive } from '@ui-sdk/react/primitive';
import { createElement, type MouseEvent } from 'react';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const primitive = withOptionSchema(button);
type ButtonProps = ButtonOptions &
  Omit<PartProps<'button', ButtonState>, 'type' | 'onClick'> & {
    onClick?: (event: MouseEvent<HTMLElement>, details: ButtonActionDetails) => unknown;
  };

export function Button(props: ButtonProps) {
  if (props.render !== undefined && props.onClick !== undefined) {
    return createElement(ComposedActionButton, props);
  }
  return createElement(NativeButton, props);
}

function NativeButton({
  disabled,
  focusableWhenDisabled,
  type,
  pendingAnnouncement,
  debug,
  onClick,
  ...props
}: ButtonProps) {
  const handle = usePrimitive(
    primitive,
    definedProps({ disabled, focusableWhenDisabled, type, pendingAnnouncement, debug })
  );
  return usePart(
    handle,
    'root',
    {},
    {
      ...props,
      onClick: (event) => handle.api.internal.press(event.nativeEvent, (details) => onClick?.(event, details)),
    },
    'button'
  );
}

export type * from '@ui-sdk/core/button';
