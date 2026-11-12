'use client';
import {
  Slider as SDKSlider,
  SliderControl as SDKSliderControl,
  SliderIndicator as SDKSliderIndicator,
  SliderThumb as SDKSliderThumb,
  SliderTrack as SDKSliderTrack,
} from '@ui-sdk/react/slider';
import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

export { SliderControl, SliderIndicator, SliderThumb, SliderTrack, SliderValue } from '@ui-sdk/react/slider';
export function Slider({
  children,
  className,
  testId,
  'aria-label': label,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSlider>> & SharedProps) {
  const values = props.value ?? props.defaultValue ?? 0;
  const thumbs = (Array.isArray(values) ? values : [values]).map((_, position) => ({
    id: `slider-thumb-${position}`,
    position,
  }));
  return (
    <SDKSlider
      {...definedProps(props)}
      aria-label={label}
      className={(state) =>
        cn(
          'relative flex w-full touch-none items-center select-none',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-testid={testId ?? props['data-testid']}
    >
      {children ?? (
        <SDKSliderControl className="flex h-5 w-full items-center">
          <SDKSliderTrack className="relative h-1.5 w-full rounded-full bg-muted">
            <SDKSliderIndicator className="absolute h-full rounded-full bg-primary" />
            {thumbs.map((thumb) => (
              <SDKSliderThumb
                aria-label={thumbs.length === 1 ? label : `${label ?? 'Value'} ${thumb.position + 1}`}
                className="absolute top-1/2 size-4 -translate-1/2 rounded-full border border-primary bg-background shadow-sm has-focus-visible:ring-2 has-focus-visible:ring-ring"
                index={thumb.position}
                key={thumb.id}
              />
            ))}
          </SDKSliderTrack>
        </SDKSliderControl>
      )}
    </SDKSlider>
  );
}
