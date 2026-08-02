'use client';

import { Slider as SliderPrimitive } from '@base-ui/react/slider';
import React from 'react';

import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

type SliderProps = Omit<React.ComponentProps<typeof SliderPrimitive.Root>, 'value' | 'defaultValue' | 'onValueChange'> &
  SharedProps & {
    value?: number | readonly number[];
    defaultValue?: number | readonly number[];
    onValueChange?: (value: number[]) => void;
  };

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  testId,
  onValueChange,
  'aria-label': ariaLabel,
  ...props
}: SliderProps) {
  const values = Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max];
  const handleValueChange = onValueChange
    ? (nextValue: number | readonly number[]) => {
        const asArray = Array.isArray(nextValue) ? [...nextValue] : [nextValue as number];
        onValueChange(asArray);
      }
    : undefined;

  return (
    <SliderPrimitive.Root
      className={cn(
        'relative flex w-full touch-none items-center select-none data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[disabled]:opacity-50',
        className
      )}
      data-slot="slider"
      data-testid={testId}
      defaultValue={defaultValue}
      max={max}
      min={min}
      onValueChange={handleValueChange}
      value={value}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full grow touch-none select-none items-center data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col">
        <SliderPrimitive.Track
          className={cn(
            'relative grow overflow-hidden rounded-full bg-muted select-none data-[orientation=horizontal]:h-1 data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-1'
          )}
          data-slot="slider-track"
        >
          <SliderPrimitive.Indicator
            className="absolute bg-primary select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
            data-slot="slider-range"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            aria-label={
              ariaLabel
                ? values.length === 1
                  ? ariaLabel
                  : `${ariaLabel} ${index + 1}`
                : undefined
            }
            className="relative block size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50"
            data-slot="slider-thumb"
            index={index}
            // biome-ignore lint/suspicious/noArrayIndexKey: part of slider implementation
            key={index}
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
