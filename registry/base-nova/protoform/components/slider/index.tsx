"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import type React from "react";

import { cn, type SharedProps } from "@/registry/base-nova/protoform/lib/utils";

type SliderProps = Omit<React.ComponentProps<typeof SliderPrimitive.Root>, "value" | "defaultValue" | "onValueChange"> &
  SharedProps & {
    value?: number | readonly number[];
    defaultValue?: number | readonly number[];
    onValueChange?: (value: number[]) => void;
  };

function getThumbLabel(label: string | undefined, count: number, index: number): string | undefined {
  if (!label) {
    return undefined;
  }
  return count === 1 ? label : `${label} ${index + 1}`;
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  testId,
  onValueChange,
  "aria-label": ariaLabel,
  ...props
}: SliderProps) {
  let values: readonly number[] = [min, max];
  if (Array.isArray(value)) {
    values = value;
  } else if (Array.isArray(defaultValue)) {
    values = defaultValue;
  }
  const thumbs = values.map((thumbValue, index) => ({ index, key: `${thumbValue}:${index}` }));
  const handleValueChange = onValueChange
    ? (nextValue: number | readonly number[]) => {
        const asArray = Array.isArray(nextValue) ? [...nextValue] : [nextValue as number];
        onValueChange(asArray);
      }
    : undefined;

  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex w-full touch-none select-none items-center data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[disabled]:opacity-50",
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
            "relative grow select-none overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1 data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-1"
          )}
          data-slot="slider-track"
        >
          <SliderPrimitive.Indicator
            className="absolute select-none bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
            data-slot="slider-range"
          />
        </SliderPrimitive.Track>
        {thumbs.map((thumb) => (
          <SliderPrimitive.Thumb
            aria-label={getThumbLabel(ariaLabel, values.length, thumb.index)}
            className="relative block size-3 shrink-0 select-none rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] after:absolute after:-inset-2 hover:ring-3 focus-visible:outline-hidden focus-visible:ring-3 active:ring-3 disabled:pointer-events-none disabled:opacity-50"
            data-slot="slider-thumb"
            index={thumb.index}
            key={thumb.key}
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
