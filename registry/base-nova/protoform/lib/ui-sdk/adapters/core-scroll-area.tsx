'use client';

import { scrollArea } from '@ui-sdk/core/scroll-area';
import { createParts } from '@ui-sdk/react/primitive';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(scrollArea), {
  root: 'div',
  viewport: 'div',
  content: 'div',
  scrollbar: 'div',
  thumb: 'div',
  corner: 'div',
  'scroll-to-end': 'button',
});
export const ScrollArea = parts.Root;
export const ScrollAreaViewport = parts.Viewport;
export const ScrollAreaContent = parts.Content;
export const ScrollAreaScrollbar = parts.Scrollbar;
export const ScrollAreaThumb = parts.Thumb;
export const ScrollAreaCorner = parts.Corner;
export const ScrollAreaScrollToEnd = parts.ScrollToEnd;
export type * from '@ui-sdk/core/scroll-area';
