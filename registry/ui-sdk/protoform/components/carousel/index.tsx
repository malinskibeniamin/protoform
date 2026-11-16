'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import type React from 'react';
import { stateClassName } from '@/components/ui/shared/state-class-name';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
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
} from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/core-carousel';
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
      className={stateClassName('flex', className)}
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
      className={stateClassName('', className)}
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
      className={stateClassName('', className)}
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
      className={stateClassName('min-w-0 shrink-0 grow-0 basis-full', className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CarouselNext({
  children,
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCarouselNext>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCarouselNext
      aria-label="Next slide"
      {...definedProps(props)}
      className={stateClassName(
        'absolute top-1/2 -right-8 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    >
      {children ?? <ChevronRightIcon aria-hidden="true" className="size-4 rtl:-scale-x-100" />}
    </SDKCarouselNext>
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
      className={stateClassName('', className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CarouselPrevious({
  children,
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCarouselPrevious>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCarouselPrevious
      aria-label="Previous slide"
      {...definedProps(props)}
      className={stateClassName(
        'absolute top-1/2 -left-8 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    >
      {children ?? <ChevronLeftIcon aria-hidden="true" className="size-4 rtl:-scale-x-100" />}
    </SDKCarouselPrevious>
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
      className={stateClassName('overflow-hidden', className)}
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
