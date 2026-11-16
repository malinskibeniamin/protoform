'use client';

import { ChevronRightIcon } from 'lucide-react';
import type * as React from 'react';
import { Collapsible, CollapsiblePanel } from '@/components/ui/sdk/collapsible/index';
import { stateClassName } from '@/components/ui/shared/state-class-name';
import { TraceIcon } from '@/components/ui/shared/trace';
import { CollapsibleTrigger } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/core-collapsible';
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

function TraceCollapsibleTrigger({ className, children, ...props }: React.ComponentProps<typeof CollapsibleTrigger>) {
  const renderChildren = typeof children === 'function' ? children : () => children;
  return (
    <CollapsibleTrigger
      className={stateClassName(
        'group/trace-collapsible-trigger flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-md text-left text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&:has([data-status=error])]:text-destructive',
        className
      )}
      data-slot="trace-collapsible-trigger"
      {...props}
    >
      {(state) => (
        <>
          {renderChildren(state)}
          <TraceIcon className="group-aria-expanded/trace-collapsible-trigger:rotate-90">
            <ChevronRightIcon />
          </TraceIcon>
        </>
      )}
    </CollapsibleTrigger>
  );
}

function TraceCollapsibleContent({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof CollapsiblePanel>, 'children'> & { children?: React.ReactNode }) {
  return (
    <CollapsiblePanel className="min-w-0 overflow-hidden" data-slot="trace-collapsible-content" {...props}>
      <div
        className={cn(
          'mt-2 mb-1 ml-[calc(--spacing(2)-1px)] min-w-0 border-l pr-1 pl-4 leading-relaxed wrap-break-word text-muted-foreground',
          className
        )}
        data-slot="trace-collapsible-content-inner"
      >
        {children}
      </div>
    </CollapsiblePanel>
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
