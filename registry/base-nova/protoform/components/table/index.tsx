'use client';

import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';
import type React from 'react';
import { scrollTableWithKeyboard } from '@/components/ui/shared/table';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <ScrollAreaPrimitive.Root
      className="relative w-full min-w-0 focus-within:ring-2 focus-within:ring-ring"
      data-slot="table-container"
    >
      <ScrollAreaPrimitive.Viewport
        aria-label={props['aria-label'] ?? 'Scrollable table'}
        className="w-full min-w-0 overflow-x-auto outline-none"
        onKeyDown={scrollTableWithKeyboard}
        role="region"
        tabIndex={0}
      >
        <table className={cn('w-full caption-bottom text-sm', className)} data-slot="table" {...props} />
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar
        className="absolute inset-x-0 bottom-0 flex h-2 touch-none p-px select-none"
        orientation="horizontal"
      >
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  );
}

export {
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/shared/table';
export { Table };
