'use client';

import {
  Collapsible as SDKCollapsible,
  CollapsiblePanel as SDKCollapsiblePanel,
  CollapsibleTrigger as SDKCollapsibleTrigger,
} from '@ui-sdk/react/collapsible';

import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

function Collapsible({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCollapsible>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCollapsible
      {...definedProps(props)}
      className={(state) => cn('w-full', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CollapsiblePanel({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCollapsiblePanel>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCollapsiblePanel
      {...definedProps(props)}
      className={(state) => cn('overflow-hidden', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CollapsibleTrigger({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCollapsibleTrigger>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCollapsibleTrigger
      {...definedProps(props)}
      className={(state) =>
        cn(
          'outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { Collapsible, CollapsiblePanel, CollapsibleTrigger };
