'use client';

import {
  Tooltip as SDKTooltip,
  TooltipArrow as SDKTooltipArrow,
  TooltipContent as SDKTooltipContent,
  TooltipShortcut as SDKTooltipShortcut,
  TooltipTrigger as SDKTooltipTrigger,
} from '@ui-sdk/react/tooltip';

import type React from 'react';
import { stateClassName } from '@/components/ui/shared/state-class-name';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

const Tooltip = SDKTooltip;

function TooltipArrow({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKTooltipArrow>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKTooltipArrow
      {...definedProps(props)}
      className={stateClassName('fill-foreground', className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function TooltipContent({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKTooltipContent>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKTooltipContent
      {...definedProps(props)}
      className={stateClassName(
        [
          'z-50 max-w-xs rounded-md px-3 py-1.5 text-xs shadow-md',
          variant === 'detail' ? 'bg-tooltip-detail text-tooltip-detail-foreground' : 'bg-foreground text-background',
        ],
        className
      )}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function TooltipShortcut({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKTooltipShortcut>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKTooltipShortcut
      {...definedProps(props)}
      className={stateClassName('', className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function TooltipTrigger({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKTooltipTrigger>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKTooltipTrigger
      {...definedProps(props)}
      className={stateClassName('', className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { Tooltip, TooltipArrow, TooltipContent, TooltipShortcut, TooltipTrigger };
