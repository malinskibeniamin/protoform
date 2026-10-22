'use client';

import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

type SliderProps<Value extends number | readonly number[] = number[]> = SliderPrimitive.Root.Props<Value> & SharedProps;

function getThumbLabel(label: string | undefined, count: number, index: number): string | undefined {
  if (!(label !== undefined && label !== '')) {
    return undefined;
  }
  return count === 1 ? label : `${label} ${index + 1}`;
}

function Slider<Value extends number | readonly number[] = number[]>({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  testId,
  onValueChange,
  'aria-label': ariaLabel,
  ...props
}: SliderProps<Value>) {
  let values: readonly number[] = [min, max];
  if (value !== undefined) {
    values = typeof value === 'number' ? [value] : value;
  } else if (defaultValue !== undefined) {
    values = typeof defaultValue === 'number' ? [defaultValue] : defaultValue;
  }
  const thumbs = values.map((_thumbValue, index) => ({ index, key: `thumb-${index}` }));

  return (
    <SliderPrimitive.Root
      className={(state) =>
        cn(
          'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-slot="slider"
      data-testid={testId}
      defaultValue={defaultValue}
      max={max}
      min={min}
      onValueChange={onValueChange}
      value={value}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full grow touch-none items-center select-none data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col">
        <SliderPrimitive.Track
          className={cn(
            'relative grow overflow-hidden rounded-full bg-muted select-none data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1'
          )}
          data-slot="slider-track"
        >
          <SliderPrimitive.Indicator
            className="absolute bg-primary select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
            data-slot="slider-range"
          />
        </SliderPrimitive.Track>
        {thumbs.map((thumb) => (
          <SliderPrimitive.Thumb
            aria-label={getThumbLabel(ariaLabel, values.length, thumb.index)}
            className="relative block size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50"
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
