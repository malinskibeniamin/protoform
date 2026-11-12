'use client';

import {
  Carousel as SDKCarousel,
  CarouselContent as SDKCarouselContent,
  CarouselIndicator as SDKCarouselIndicator,
  CarouselIndicatorGroup as SDKCarouselIndicatorGroup,
  CarouselItem as SDKCarouselItem,
  CarouselNext as SDKCarouselNext,
  CarouselPlayToggle as SDKCarouselPlayToggle,
  CarouselPrevious as SDKCarouselPrevious,
  CarouselViewport as SDKCarouselViewport,
} from '@ui-sdk/react/carousel';

import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

const Carousel = SDKCarousel;

function CarouselContent({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCarouselContent>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCarouselContent
      {...definedProps(props)}
      className={(state) => cn('flex', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CarouselIndicator({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCarouselIndicator>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCarouselIndicator
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CarouselIndicatorGroup({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCarouselIndicatorGroup>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCarouselIndicatorGroup
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CarouselItem({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCarouselItem>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCarouselItem
      {...definedProps(props)}
      className={(state) =>
        cn('min-w-0 shrink-0 grow-0 basis-full', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CarouselNext({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCarouselNext>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCarouselNext
      {...definedProps(props)}
      className={(state) =>
        cn(
          'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CarouselPlayToggle({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCarouselPlayToggle>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCarouselPlayToggle
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CarouselPrevious({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCarouselPrevious>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCarouselPrevious
      {...definedProps(props)}
      className={(state) =>
        cn(
          'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CarouselViewport({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCarouselViewport>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCarouselViewport
      {...definedProps(props)}
      className={(state) => cn('overflow-hidden', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselIndicatorGroup,
  CarouselItem,
  CarouselNext,
  CarouselPlayToggle,
  CarouselPrevious,
  CarouselViewport,
};
