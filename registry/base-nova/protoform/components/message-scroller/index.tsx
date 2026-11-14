'use client';
import { ScrollAreaContent, ScrollAreaScrollToEnd } from '@ui-sdk/react/scroll-area';
import { ArrowDownIcon } from 'lucide-react';
import type React from 'react';
import { ScrollArea, ScrollAreaViewport } from '@/components/ui/scroll-area/index';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
export function MessageScroller(props: React.ComponentProps<typeof ScrollArea>) {
  return <ScrollArea stickToEnd {...props} />;
}
export function MessageScrollerContent({ className, ...props }: React.ComponentProps<typeof ScrollAreaContent>) {
  return (
    <ScrollAreaContent
      {...props}
      className={(state) =>
        cn(
          'flex h-max min-h-full min-w-full flex-col gap-6',
          typeof className === 'function' ? className(state) : className
        )
      }
    />
  );
}
export const MessageScrollerViewport = ScrollAreaViewport;
export function MessageScrollerItem({ className, ...props }: React.ComponentProps<'div'>) {
  return <div {...props} className={cn('min-w-0 shrink-0', className)} />;
}
export function MessageScrollerButton({ className, ...props }: React.ComponentProps<typeof ScrollAreaScrollToEnd>) {
  return (
    <ScrollAreaScrollToEnd
      aria-label="Scroll to end"
      {...props}
      className={(state) =>
        cn(
          'absolute bottom-4 left-1/2 hidden size-8 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring data-visible:inline-flex',
          typeof className === 'function' ? className(state) : className
        )
      }
    >
      <ArrowDownIcon aria-hidden="true" className="size-4" />
    </ScrollAreaScrollToEnd>
  );
}
