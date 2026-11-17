'use client';
import { createParts } from '@ui-sdk/react/primitive';
import type { ComponentProps } from 'react';
import { rating } from '@/components/ui/sdk/rating/primitive';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

function stateClassName<State>(
  classes: string,
  className: string | ((state: State) => string | undefined) | undefined
) {
  return (state: State) => cn(classes, typeof className === 'function' ? className(state) : className);
}

const parts = createParts(rating, { root: 'div', star: 'button' });
export function Rating({ className, ...props }: UIProps<ComponentProps<typeof parts.Root>>) {
  return <parts.Root {...definedProps(props)} className={stateClassName('inline-flex gap-1', className)} />;
}
export function RatingStar({ className, ...props }: UIProps<ComponentProps<typeof parts.Star>>) {
  return (
    <parts.Star
      {...definedProps(props)}
      className={stateClassName(
        'flex size-9 items-center justify-center rounded-md border border-input text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring data-filled:bg-primary data-filled:text-primary-foreground',
        className
      )}
    />
  );
}
