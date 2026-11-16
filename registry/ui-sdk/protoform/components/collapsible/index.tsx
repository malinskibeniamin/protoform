'use client';

import type React from 'react';
import { stateClassName } from '@/components/ui/shared/state-class-name';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import {
  Collapsible as SDKCollapsible,
  CollapsiblePanel as SDKCollapsiblePanel,
  CollapsibleTrigger as SDKCollapsibleTrigger,
} from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/core-collapsible';
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
      className={stateClassName('w-full', className)}
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
      className={stateClassName('overflow-hidden', className)}
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
      className={stateClassName(
        'outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { Collapsible, CollapsiblePanel, CollapsibleTrigger };
