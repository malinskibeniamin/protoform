'use client';
import type React from 'react';
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollToEnd,
  ScrollAreaViewport,
} from '@/components/ui/scroll-area/index';
export function MessageScroller(props: React.ComponentProps<typeof ScrollArea>) {
  return <ScrollArea stickToEnd {...props} />;
}
export const MessageScrollerContent = ScrollAreaContent;
export const MessageScrollerViewport = ScrollAreaViewport;
export function MessageScrollerItem(props: React.ComponentProps<'div'>) {
  return <div {...props} />;
}
export function MessageScrollerButton(props: React.ComponentProps<typeof ScrollAreaScrollToEnd>) {
  return (
    <ScrollAreaScrollToEnd {...props} aria-label="Scroll to end">
      ↓
    </ScrollAreaScrollToEnd>
  );
}
