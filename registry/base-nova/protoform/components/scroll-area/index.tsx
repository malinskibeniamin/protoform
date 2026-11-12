'use client';

import {
  ScrollArea as SDKScrollArea,
  ScrollAreaContent as SDKScrollAreaContent,
  ScrollAreaCorner as SDKScrollAreaCorner,
  ScrollAreaScrollbar as SDKScrollAreaScrollbar,
  ScrollAreaScrollToEnd as SDKScrollAreaScrollToEnd,
  ScrollAreaThumb as SDKScrollAreaThumb,
  ScrollAreaViewport as SDKScrollAreaViewport,
} from '@ui-sdk/react/scroll-area';

import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

function ScrollArea({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKScrollArea>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKScrollArea
      {...definedProps(props)}
      className={(state) =>
        cn('relative overflow-hidden', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ScrollAreaContent({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKScrollAreaContent>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKScrollAreaContent
      {...definedProps(props)}
      className={(state) => cn('min-w-full', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ScrollAreaCorner({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKScrollAreaCorner>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKScrollAreaCorner
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ScrollAreaScrollbar({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKScrollAreaScrollbar>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKScrollAreaScrollbar
      {...definedProps(props)}
      className={(state) =>
        cn(
          'flex touch-none p-0.5 select-none data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:w-2.5',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ScrollAreaScrollToEnd({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKScrollAreaScrollToEnd>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKScrollAreaScrollToEnd
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ScrollAreaThumb({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKScrollAreaThumb>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKScrollAreaThumb
      {...definedProps(props)}
      className={(state) =>
        cn('relative flex-1 rounded-full bg-border', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ScrollAreaViewport({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKScrollAreaViewport>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKScrollAreaViewport
      {...definedProps(props)}
      className={(state) =>
        cn(
          'size-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaScrollToEnd,
  ScrollAreaThumb,
  ScrollAreaViewport,
};
