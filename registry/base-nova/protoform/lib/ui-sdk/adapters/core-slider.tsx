'use client';

import { slider } from '@ui-sdk/core/slider';
import { createParts } from '@ui-sdk/react/primitive';
import { type ComponentProps, createElement } from 'react';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(slider), {
  root: 'div',
  control: 'div',
  track: 'div',
  indicator: 'div',
  thumb: 'div',
  'thumb-input': 'input',
  value: 'output',
  input: 'input',
});
export function Slider({ children, ...props }: ComponentProps<typeof parts.Root>) {
  const renderedProps: ComponentProps<typeof parts.Root> = {
    ...props,
    children: (state) => {
      const content = typeof children === 'function' ? children(state) : children;
      return (
        <>
          {content}
          <parts.Input />
        </>
      );
    },
  };
  return createElement(parts.Root, renderedProps);
}
export const SliderControl = parts.Control;
export const SliderTrack = parts.Track;
export const SliderIndicator = parts.Indicator;
export function SliderThumb({
  children,
  index,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  ...props
}: ComponentProps<typeof parts.Thumb>) {
  const renderedProps: ComponentProps<typeof parts.Thumb> = {
    ...props,
    ...definedProps({ index }),
    children: (state) => {
      const content = typeof children === 'function' ? children(state) : children;
      return (
        <>
          {content}
          {createElement(
            parts.ThumbInput,
            definedProps({
              index,
              'aria-label': label,
              'aria-labelledby': labelledBy,
              'aria-describedby': describedBy,
            })
          )}
        </>
      );
    },
  };
  return createElement(parts.Thumb, renderedProps);
}
export function SliderValue({ children, ...props }: ComponentProps<typeof parts.Value>) {
  const renderedProps: ComponentProps<typeof parts.Value> = {
    ...props,
    children: children ?? ((state) => state.text),
  };
  return createElement(parts.Value, renderedProps);
}
export type * from '@ui-sdk/core/slider';
