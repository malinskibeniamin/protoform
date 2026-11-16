'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import type { VariantProps } from 'class-variance-authority';
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { itemVariants } from '@/components/ui/shared/item-variants';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

const ItemGroupContext = React.createContext(false);
function ItemGroup({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  const list = useRender({
    defaultTagName: 'div',
    render,
    props: {
      ...mergeProps<'div'>(
        {
          role: 'list',
          className: cn(
            'group/item-group flex w-full flex-col gap-4 has-data-[size=sm]:gap-2.5 has-data-[size=xs]:gap-2',
            className
          ),
        },
        props
      ),
      'data-slot': 'item-group',
    },
  });
  return <ItemGroupContext.Provider value>{list}</ItemGroupContext.Provider>;
}

function ItemSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  const grouped = React.useContext(ItemGroupContext);
  const separator = (
    <Separator className={className} data-slot="item-separator" orientation="horizontal" variant="item" {...props} />
  );
  return grouped === true ? <li role="presentation">{separator}</li> : separator;
}

function Item({
  className,
  variant = 'default',
  size = 'default',
  render,
  ...props
}: useRender.ComponentProps<'div' | 'li'> & VariantProps<typeof itemVariants>) {
  const grouped = React.useContext(ItemGroupContext);
  return useRender({
    defaultTagName: grouped === true ? 'li' : 'div',
    props: mergeProps<'div' | 'li'>(
      {
        className: cn(
          itemVariants({
            variant,
            size,
            className,
          })
        ),
      },
      props
    ),
    render,
    state: {
      slot: 'item',
      variant,
      size,
    },
  });
}

export {
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/shared/item';
export { Item, ItemGroup, ItemSeparator };
