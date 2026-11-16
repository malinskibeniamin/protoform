'use client';

import type React from 'react';
import { stateClassName } from '@/components/ui/shared/state-class-name';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import {
  OTPInput as SDKOTPInput,
  OTPInputGroup as SDKOTPInputGroup,
  OTPInputSeparator as SDKOTPInputSeparator,
  OTPInputSlot as SDKOTPInputSlot,
} from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/core-otp-input';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

function OTPInput({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKOTPInput>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKOTPInput
      {...definedProps(props)}
      className={stateClassName('flex min-w-0 items-center gap-2', className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function OTPInputGroup({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKOTPInputGroup>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKOTPInputGroup
      {...definedProps(props)}
      className={stateClassName('flex min-w-0 items-center', className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function OTPInputSeparator({
  children = '−',
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKOTPInputSeparator>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKOTPInputSeparator
      {...definedProps(props)}
      className={stateClassName('px-1 text-muted-foreground', className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    >
      {children}
    </SDKOTPInputSeparator>
  );
}

function OTPInputSlot({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKOTPInputSlot>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKOTPInputSlot
      {...definedProps(props)}
      className={stateClassName(
        'relative flex size-8 min-w-0 items-center justify-center border border-input text-sm first:rounded-l-md last:rounded-r-md data-active:ring-2 data-active:ring-ring',
        className
      )}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { OTPInput, OTPInputGroup, OTPInputSeparator, OTPInputSlot };
