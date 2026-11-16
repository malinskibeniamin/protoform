'use client';

import { mergeProps, type PartProps, renderElement } from '@ui-sdk/react/primitive';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

function BubbleContent({ className, render, ...props }: PartProps<'div'>) {
  return renderElement(
    'div',
    {
      ...mergeProps(
        {
          className: cn(
            'w-fit max-w-full min-w-0 overflow-hidden rounded-xl border border-transparent px-3 py-2 text-sm leading-relaxed wrap-break-word group-data-[align=end]/bubble:self-end [button]:text-left [button,a]:transition-colors [button,a]:outline-none [button,a]:focus-visible:border-ring [button,a]:focus-visible:ring-3 [button,a]:focus-visible:ring-ring/50',
            className
          ),
        },
        props
      ),
      'data-slot': 'bubble-content',
    },
    render,
    {
      slot: 'bubble-content',
    }
  );
}

export { Bubble, BubbleGroup, BubbleReactions } from '@/components/ui/shared/bubble';
export { BubbleContent };
