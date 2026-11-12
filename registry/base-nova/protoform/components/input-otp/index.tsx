'use client';

import {
  OTPInput as SDKOTPInput,
  OTPInputGroup as SDKOTPInputGroup,
  OTPInputSeparator as SDKOTPInputSeparator,
  OTPInputSlot as SDKOTPInputSlot,
} from '@ui-sdk/react/otp-input';

import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
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
      className={(state) =>
        cn('flex min-w-0 items-center gap-2', typeof className === 'function' ? className(state) : className)
      }
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
      className={(state) =>
        cn('flex min-w-0 items-center', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function OTPInputSeparator({
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
      className={(state) =>
        cn('px-1 text-muted-foreground', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
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
      className={(state) =>
        cn(
          'relative flex size-8 min-w-0 items-center justify-center border border-input text-sm first:rounded-l-md last:rounded-r-md data-active:ring-2 data-active:ring-ring',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { OTPInput, OTPInputGroup, OTPInputSeparator, OTPInputSlot };
