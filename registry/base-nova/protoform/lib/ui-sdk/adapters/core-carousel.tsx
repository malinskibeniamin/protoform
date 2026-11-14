'use client';

import { carousel } from '@ui-sdk/core/carousel';
import { createParts } from '@ui-sdk/react/primitive';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(carousel), {
  root: 'div',
  viewport: 'div',
  content: 'div',
  item: 'div',
  previous: 'button',
  next: 'button',
  'indicator-group': 'div',
  indicator: 'button',
  'play-toggle': 'button',
});
export const Carousel = parts.Root;
export const CarouselViewport = parts.Viewport;
export const CarouselContent = parts.Content;
export const CarouselItem = parts.Item;
export const CarouselPrevious = parts.Previous;
export const CarouselNext = parts.Next;
export const CarouselIndicatorGroup = parts.IndicatorGroup;
export const CarouselIndicator = parts.Indicator;
export const CarouselPlayToggle = parts.PlayToggle;
export type * from '@ui-sdk/core/carousel';
