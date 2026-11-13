'use client';

import {
  Radio as SDKRadio,
  RadioGroup as SDKRadioGroup,
  RadioIndicator as SDKRadioIndicator,
} from '@ui-sdk/react/radio';

import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

function Radio({
  children,
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKRadio>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKRadio
      {...definedProps(props)}
      className={(state) =>
        cn(
          variant === 'choice' &&
            'flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg border border-input bg-transparent px-3 py-2.5 text-left text-sm outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-checked:border-primary/40 data-checked:bg-muted',
          variant === 'card' &&
            'flex min-h-12 w-full items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3 text-left focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 data-checked:border-primary data-checked:bg-muted',
          variant !== 'card' &&
            variant !== 'choice' &&
            'flex size-4 shrink-0 items-center justify-center rounded-full border border-input outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-checked:border-primary',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    >
      {children ?? <RadioIndicator />}
    </SDKRadio>
  );
}

const RadioGroup = SDKRadioGroup;

function RadioIndicator({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKRadioIndicator>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKRadioIndicator
      {...definedProps(props)}
      className={(state) =>
        cn('size-2 rounded-full bg-primary', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { Radio, RadioGroup, RadioIndicator };
