'use client';

import { progress } from '@ui-sdk/core/progress';
import { createParts } from '@ui-sdk/react/primitive';
import { type ComponentProps, createElement } from 'react';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(progress), {
  root: 'div',
  track: 'div',
  indicator: 'div',
  label: 'span',
  value: 'span',
});
export const Progress = parts.Root;
export const ProgressTrack = parts.Track;
export const ProgressIndicator = parts.Indicator;
export const ProgressLabel = parts.Label;
export function ProgressValue({ children, ...props }: ComponentProps<typeof parts.Value>) {
  const renderedProps: ComponentProps<typeof parts.Value> = {
    ...props,
    children: children ?? ((state) => state.text),
  };
  return createElement(parts.Value, renderedProps);
}
export type * from '@ui-sdk/core/progress';
