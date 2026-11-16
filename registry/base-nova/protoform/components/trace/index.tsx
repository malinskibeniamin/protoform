'use client';

import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible';
import { ChevronRightIcon } from 'lucide-react';
import type * as React from 'react';

import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { TraceIcon } from '@/components/ui/shared/trace';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

function TraceCollapsible({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Collapsible>, 'open'> &
  (
    | { open?: undefined }
    | {
        open: boolean;
        onOpenChange: NonNullable<React.ComponentProps<typeof Collapsible>['onOpenChange']>;
      }
  )) {
  return (
    <Collapsible
      className={className}
      data-slot="trace-collapsible"
      render={<div className="flex w-full min-w-0 flex-col" />}
      {...props}
    />
  );
}

function TraceCollapsibleTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return (
    <CollapsiblePrimitive.Trigger
      className={(state) =>
        cn(
          'group/trace-collapsible-trigger flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-md text-left text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&:has([data-status=error])]:text-destructive',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-slot="trace-collapsible-trigger"
      {...props}
    >
      {children}
      <TraceIcon className="group-aria-expanded/trace-collapsible-trigger:rotate-90">
        <ChevronRightIcon />
      </TraceIcon>
    </CollapsiblePrimitive.Trigger>
  );
}

function TraceCollapsibleContent({ className, children, ...props }: React.ComponentProps<typeof CollapsibleContent>) {
  return (
    <CollapsibleContent className="min-w-0 overflow-hidden" data-slot="trace-collapsible-content" {...props}>
      <div
        className={cn(
          'mt-2 mb-1 ml-[calc(--spacing(2)-1px)] min-w-0 border-l pr-1 pl-4 leading-relaxed wrap-break-word text-muted-foreground',
          className
        )}
        data-slot="trace-collapsible-content-inner"
      >
        {children}
      </div>
    </CollapsibleContent>
  );
}

export {
  Trace,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from '@/components/ui/shared/trace';
export { TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger };
