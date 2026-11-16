'use client';

import { mergeProps, type PartProps, renderElement } from '@ui-sdk/react/primitive';
import type { VariantProps } from 'class-variance-authority';
import { markerVariants } from '@/components/ui/shared/marker-variants';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

function Marker({
  className,
  variant = 'default',
  render,
  ...props
}: PartProps<'div'> & VariantProps<typeof markerVariants>) {
  return renderElement(
    'div',
    {
      ...mergeProps(
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
      'data-slot': 'marker',
      'data-variant': variant,
    },
    render,
    {
      slot: 'marker',
      variant,
    }
  );
}

export { MarkerContent, MarkerIcon } from '@/components/ui/shared/marker';
export { markerVariants } from '@/components/ui/shared/marker-variants';
export { Marker };
