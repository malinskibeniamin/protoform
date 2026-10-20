import { useRender } from '@base-ui/react/use-render';
import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';

declare const markerVariants: (
  props?: {
    variant?: 'separator' | 'default' | 'border' | null | undefined;
  } & import('class-variance-authority/types').ClassProp
) => string;
declare function Marker({
  className,
  variant,
  render,
  ...props
}: useRender.ComponentProps<'div'> & VariantProps<typeof markerVariants>): React.ReactElement;
declare function MarkerIcon({ className, ...props }: React.ComponentProps<'span'>): React.JSX.Element;
declare function MarkerContent({ className, ...props }: React.ComponentProps<'span'>): React.JSX.Element;

export { Marker, MarkerContent, MarkerIcon, markerVariants };
