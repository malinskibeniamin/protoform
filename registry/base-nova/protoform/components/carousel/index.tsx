'use client';

import { useRender } from '@base-ui/react/use-render';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];
interface CarouselProps {
  opts?: CarouselOptions;
  orientation?: 'horizontal' | 'vertical';
  plugins?: CarouselPlugin;
  setApi?: ((api: CarouselApi) => void) | undefined;
}
type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & Omit<CarouselProps, 'setApi'> & { setApi?: (api: CarouselApi) => void };
const CarouselContext = React.createContext<CarouselContextProps | null>(null);
function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (context === null) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }
  return context;
}
function useEmblaControls({ orientation = 'horizontal', opts, setApi, plugins }: CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins
  );
  const scrollState = React.useSyncExternalStore(
    (onChange) => {
      if (api === undefined) {
        return () => undefined;
      }
      api.on('select', onChange);
      api.on('reInit', onChange);
      return () => {
        api.off('select', onChange);
        api.off('reInit', onChange);
      };
    },
    () => (api?.canScrollPrev() === true ? 1 : 0) + (api?.canScrollNext() === true ? 2 : 0),
    () => 0
  );
  const canScrollPrev = scrollState % 2 === 1;
  const canScrollNext = scrollState >= 2;

  const scrollPrev = () => {
    api?.scrollPrev();
  };
  const scrollNext = () => {
    api?.scrollNext();
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      (event.target instanceof HTMLElement &&
        event.target.closest('input, textarea, select, [contenteditable="true"]') !== null)
    ) {
      return;
    }
    const previousKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    if (event.key === previousKey) {
      event.preventDefault();
      scrollPrev();
    } else if (event.key === nextKey) {
      event.preventDefault();
      scrollNext();
    }
  };
  React.useImperativeHandle(
    (instance: CarouselApi | null) => {
      if (instance !== null && instance !== undefined) {
        setApi?.(instance);
      }
    },
    () => api,
    [api]
  );
  return { carouselRef, api, opts, orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext, handleKeyDown };
}
function Carousel({
  className,
  children,
  orientation = 'horizontal',
  opts,
  setApi,
  plugins,
  ref,
  onKeyDownCapture,
  ...props
}: React.ComponentProps<'div'> & CarouselProps) {
  const controls = useEmblaControls({ orientation, opts, setApi, plugins });
  const surface = useRender({
    defaultTagName: 'div',
    ref,
    props: {
      'aria-label': 'Carousel',
      'aria-roledescription': 'carousel',
      role: 'region',
      ...props,
      className: cn('relative', className),
      'data-slot': 'carousel',
      onKeyDownCapture: (event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDownCapture?.(event);
        controls.handleKeyDown(event);
      },
      children,
    },
  });
  return <CarouselContext.Provider value={controls}>{surface}</CarouselContext.Provider>;
}

function CarouselContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div className="overflow-hidden" data-slot="carousel-content" ref={carouselRef}>
      <div className={cn('flex', orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col', className)} {...props} />
    </div>
  );
}
function CarouselItem({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  const { orientation } = useCarousel();
  return useRender({
    defaultTagName: 'div',
    render,
    props: {
      ...props,
      role: 'group',
      'aria-roledescription': 'slide',
      className: cn('min-w-0 shrink-0 grow-0 basis-full', orientation === 'horizontal' ? 'pl-4' : 'pt-4', className),
      'data-slot': 'carousel-item',
    },
  });
}

function CarouselNavigationButton({
  className,
  direction,
  orientation,
  ...props
}: React.ComponentProps<'button'> & {
  direction: 'previous' | 'next';
  orientation: 'horizontal' | 'vertical' | undefined;
}) {
  let placement = 'inset-y-0 -left-12 my-auto';
  if (direction === 'next') {
    placement = 'inset-y-0 -right-12 my-auto';
  }
  if (orientation === 'vertical') {
    placement =
      direction === 'previous'
        ? '-top-12 left-1/2 -translate-x-1/2 rotate-90'
        : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90';
  }
  return useRender({
    defaultTagName: 'button',
    props: {
      ...props,
      type: props.type ?? 'button',
      className: cn('absolute touch-manipulation', placement, className),
    },
  });
}

function CarouselPrevious({
  className,
  variant = 'outline',
  size = 'icon-sm',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  return (
    <Button
      className={className}
      data-slot="carousel-previous"
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      render={<CarouselNavigationButton direction="previous" orientation={orientation} />}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      <ChevronLeftIcon className="rtl:-scale-x-100" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}
function CarouselNext({
  className,
  variant = 'outline',
  size = 'icon-sm',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  return (
    <Button
      className={className}
      data-slot="carousel-next"
      disabled={!canScrollNext}
      onClick={scrollNext}
      render={<CarouselNavigationButton direction="next" orientation={orientation} />}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      <ChevronRightIcon className="rtl:-scale-x-100" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

export { Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel };
