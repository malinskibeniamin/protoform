'use client';
import type { VariantProps } from 'class-variance-authority';
import type React from 'react';
import { bubbleReactionsVariants, bubbleVariants } from '@/components/ui/shared/bubble-variants';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

function BubbleGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex min-w-0 flex-col gap-2', className)} data-slot="bubble-group" {...props} />;
}

function Bubble({
  variant = 'default',
  align = 'start',
  className,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof bubbleVariants> & {
    align?: 'start' | 'end';
  }) {
  return (
    <div
      className={cn(
        bubbleVariants({
          variant,
        }),
        className
      )}
      data-align={align}
      data-slot="bubble"
      data-variant={variant}
      {...props}
    />
  );
}

function BubbleReactions({
  side = 'bottom',
  align = 'end',
  className,
  ...props
}: React.ComponentProps<'div'> & {
  align?: 'start' | 'end';
  side?: 'top' | 'bottom';
}) {
  return (
    <div
      className={cn(
        bubbleReactionsVariants({
          side,
          align,
        }),
        className
      )}
      data-align={align}
      data-side={side}
      data-slot="bubble-reactions"
      {...props}
    />
  );
}

export { Bubble, BubbleGroup, BubbleReactions };
