import type * as React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';

declare function Trace({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
declare function TraceLine({
  className,
  status,
  ...props
}: React.ComponentProps<'span'> & {
  status?: 'running' | 'error' | 'pending';
}): React.JSX.Element;
declare function TraceIcon({ className, ...props }: React.ComponentProps<'span'>): React.JSX.Element;
declare function TraceTitle({ className, ...props }: React.ComponentProps<'span'>): React.JSX.Element;
declare function TraceDescription({ className, ...props }: React.ComponentProps<'span'>): React.JSX.Element;
declare function TraceCollapsible({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Collapsible>, 'open'> &
  (
    | {
        open?: undefined;
      }
    | {
        open: boolean;
        onOpenChange: NonNullable<React.ComponentProps<typeof Collapsible>['onOpenChange']>;
      }
  )): React.JSX.Element;
declare function TraceCollapsibleTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CollapsibleTrigger>): React.JSX.Element;
declare function TraceCollapsibleContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CollapsibleContent>): React.JSX.Element;

export {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
};
