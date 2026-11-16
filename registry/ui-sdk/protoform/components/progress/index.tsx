'use client';

import type React from 'react';
import { stateClassName } from '@/components/ui/shared/state-class-name';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import {
  Progress as SDKProgress,
  ProgressIndicator as SDKProgressIndicator,
  ProgressLabel as SDKProgressLabel,
  ProgressTrack as SDKProgressTrack,
  ProgressValue as SDKProgressValue,
} from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/core-progress';
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
      className={stateClassName('flex w-full flex-wrap gap-3', className)}
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
      className={stateClassName('h-full bg-primary transition-all motion-reduce:transition-none', className)}
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
      className={stateClassName('text-sm font-medium', className)}
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
      className={stateClassName(
        'relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted',
        className
      )}
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
      className={stateClassName('ml-auto text-sm text-muted-foreground tabular-nums', className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue };
