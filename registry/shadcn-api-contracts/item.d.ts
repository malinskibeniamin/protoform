import { useRender } from '@base-ui/react/use-render';
import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { Separator } from './separator';

declare function ItemGroup({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
declare function ItemSeparator({ className, ...props }: React.ComponentProps<typeof Separator>): React.JSX.Element;
declare const itemVariants: (
  props?: {
    variant?: 'default' | 'outline' | 'muted' | null | undefined;
    size?: 'default' | 'sm' | 'xs' | null | undefined;
  } & import('class-variance-authority/types').ClassProp
) => string;
declare function Item({
  className,
  variant,
  size,
  render,
  ...props
}: useRender.ComponentProps<'div'> & VariantProps<typeof itemVariants>): React.ReactElement;
declare const itemMediaVariants: (
  props?: {
    variant?: 'image' | 'default' | 'icon' | null | undefined;
  } & import('class-variance-authority/types').ClassProp
) => string;
declare function ItemMedia({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof itemMediaVariants>): React.JSX.Element;
declare function ItemContent({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
declare function ItemTitle({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
declare function ItemDescription({ className, ...props }: React.ComponentProps<'p'>): React.JSX.Element;
declare function ItemActions({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
declare function ItemHeader({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
declare function ItemFooter({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;

export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
};
