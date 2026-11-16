'use client';

import type React from 'react';
import { stateClassName } from '@/components/ui/shared/state-class-name';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import {
  HoverCard as SDKHoverCard,
  HoverCardArrow as SDKHoverCardArrow,
  HoverCardContent as SDKHoverCardContent,
  HoverCardTrigger as SDKHoverCardTrigger,
} from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/core-hover-card';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

const HoverCard = SDKHoverCard;

function HoverCardArrow({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKHoverCardArrow>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKHoverCardArrow
      {...definedProps(props)}
      className={stateClassName('', className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function HoverCardContent({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKHoverCardContent>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKHoverCardContent
      {...definedProps(props)}
      className={stateClassName(
        'z-50 max-h-(--available-height) w-64 min-w-36 overflow-auto rounded-lg border border-border bg-popover p-1 p-4 text-popover-foreground shadow-md outline-none',
        className
      )}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function HoverCardTrigger({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKHoverCardTrigger>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKHoverCardTrigger
      {...definedProps(props)}
      className={stateClassName('', className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { HoverCard, HoverCardArrow, HoverCardContent, HoverCardTrigger };
