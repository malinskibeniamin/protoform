'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import type { VariantProps } from 'class-variance-authority';
import { markerVariants } from '@/components/ui/shared/marker-variants';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

function Marker({
  className,
  variant = 'default',
  render,
  ...props
}: useRender.ComponentProps<'div'> & VariantProps<typeof markerVariants>) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(
          markerVariants({
            variant,
            className,
          })
        ),
      },
      props
    ),
    render,
    state: {
      slot: 'marker',
      variant,
    },
  });
}

export { MarkerContent, MarkerIcon } from '@/components/ui/shared/marker';
export { markerVariants } from '@/components/ui/shared/marker-variants';
export { Marker };
