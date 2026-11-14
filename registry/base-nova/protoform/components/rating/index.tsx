'use client';
import { createParts } from '@ui-sdk/react/primitive';
import type { ComponentProps } from 'react';
import { rating } from '@/components/ui/rating/primitive';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

const parts = createParts(rating, { root: 'div', star: 'button' });
export function Rating({ className, ...props }: UIProps<ComponentProps<typeof parts.Root>>) {
  return (
    <parts.Root
      {...definedProps(props)}
      className={(state) => cn('inline-flex gap-1', typeof className === 'function' ? className(state) : className)}
    />
  );
}
export function RatingStar({ className, ...props }: UIProps<ComponentProps<typeof parts.Star>>) {
  return (
    <parts.Star
      {...definedProps(props)}
      className={(state) =>
        cn(
          'flex size-9 items-center justify-center rounded-md border border-input text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring data-filled:bg-primary data-filled:text-primary-foreground',
          typeof className === 'function' ? className(state) : className
        )
      }
    />
  );
}
