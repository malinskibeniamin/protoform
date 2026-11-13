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

export { SliderValue } from '@ui-sdk/react/slider';

export function SliderControl({ className, ...props }: UIProps<React.ComponentProps<typeof SDKSliderControl>>) {
  return (
    <SDKSliderControl
      {...definedProps(props)}
      className={(state) =>
        cn(
          'flex items-center',
          state.orientation === 'vertical' ? 'h-full w-5 justify-center' : 'h-5 w-full',
          typeof className === 'function' ? className(state) : className
        )
      }
    />
  );
}

export function SliderTrack({ className, ...props }: UIProps<React.ComponentProps<typeof SDKSliderTrack>>) {
  return (
    <SDKSliderTrack
      {...definedProps(props)}
      className={(state) =>
        cn(
          'relative rounded-full bg-muted',
          state.orientation === 'vertical' ? 'h-full w-1.5' : 'h-1.5 w-full',
          typeof className === 'function' ? className(state) : className
        )
      }
    />
  );
}

export function SliderIndicator({ className, ...props }: UIProps<React.ComponentProps<typeof SDKSliderIndicator>>) {
  return (
    <SDKSliderIndicator
      {...definedProps(props)}
      className={(state) =>
        cn('absolute rounded-full bg-primary', typeof className === 'function' ? className(state) : className)
      }
    />
  );
}

export function SliderThumb({ className, ...props }: UIProps<React.ComponentProps<typeof SDKSliderThumb>>) {
  return (
    <SDKSliderThumb
      {...definedProps(props)}
      className={(state) =>
        cn(
          'absolute size-4 rounded-full border border-primary bg-background shadow-sm has-focus-visible:ring-2 has-focus-visible:ring-ring',
          typeof className === 'function' ? className(state) : className
        )
      }
    />
  );
}
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
          'relative flex touch-none items-center select-none',
          state.orientation === 'vertical' ? 'h-full min-h-0 w-5 flex-col' : 'w-full',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-testid={testId ?? props['data-testid']}
    >
      {children ?? (
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            {thumbs.map((thumb) => (
              <SliderThumb
                aria-label={thumbs.length === 1 ? label : `${label ?? 'Value'} ${thumb.position + 1}`}
                index={thumb.position}
                key={thumb.id}
              />
            ))}
          </SliderTrack>
        </SliderControl>
      )}
    </SDKSlider>
  );
}
