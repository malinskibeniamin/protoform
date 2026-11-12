'use client';

import {
  Resizable as SDKResizable,
  ResizableHandle as SDKResizableHandle,
  ResizablePanel as SDKResizablePanel,
} from '@ui-sdk/react/resizable';

import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

function Resizable({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKResizable>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKResizable
      {...definedProps(props)}
      className={(state) =>
        cn('flex min-h-0 w-full min-w-0', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ResizableHandle({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKResizableHandle>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKResizableHandle
      {...definedProps(props)}
      className={(state) =>
        cn(
          'relative flex w-1 items-center justify-center bg-border focus-visible:ring-2 focus-visible:ring-ring',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ResizablePanel({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKResizablePanel>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKResizablePanel
      {...definedProps(props)}
      className={(state) =>
        cn('min-w-0 overflow-hidden', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { Resizable, ResizableHandle, ResizablePanel };
