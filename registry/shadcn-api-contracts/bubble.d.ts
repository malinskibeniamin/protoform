import { useRender } from '@base-ui/react/use-render';
import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';

declare function BubbleGroup({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
declare const bubbleVariants: (
  props?: {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'muted' | 'tinted' | null | undefined;
  } & import('class-variance-authority/types').ClassProp
) => string;
declare function Bubble({
  variant,
  align,
  className,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof bubbleVariants> & {
    align?: 'start' | 'end';
  }): React.JSX.Element;
declare function BubbleContent({ className, render, ...props }: useRender.ComponentProps<'div'>): React.ReactElement;
declare function BubbleReactions({
  side,
  align,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  align?: 'start' | 'end';
  side?: 'top' | 'bottom';
}): React.JSX.Element;

export { Bubble, BubbleContent, BubbleGroup, BubbleReactions };
