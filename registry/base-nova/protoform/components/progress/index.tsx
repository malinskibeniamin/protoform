'use client';

import {
  Progress as SDKProgress,
  ProgressIndicator as SDKProgressIndicator,
  ProgressLabel as SDKProgressLabel,
  ProgressTrack as SDKProgressTrack,
  ProgressValue as SDKProgressValue,
} from '@ui-sdk/react/progress';

import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

function Progress({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKProgress>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKProgress
      {...definedProps(props)}
      className={(state) =>
        cn('flex w-full flex-wrap gap-3', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ProgressIndicator({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKProgressIndicator>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKProgressIndicator
      {...definedProps(props)}
      className={(state) =>
        cn(
          'h-full bg-primary transition-all motion-reduce:transition-none',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ProgressLabel({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKProgressLabel>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKProgressLabel
      {...definedProps(props)}
      className={(state) => cn('text-sm font-medium', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ProgressTrack({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKProgressTrack>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKProgressTrack
      {...definedProps(props)}
      className={(state) =>
        cn(
          'relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ProgressValue({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKProgressValue>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKProgressValue
      {...definedProps(props)}
      className={(state) =>
        cn(
          'ml-auto text-sm text-muted-foreground tabular-nums',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue };
