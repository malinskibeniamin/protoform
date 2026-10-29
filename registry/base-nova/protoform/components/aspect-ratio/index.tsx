'use client';

import type { CSSProperties } from 'react';

import { cn } from '@/registry/base-nova/protoform/lib/utils';

function AspectRatio({
  ratio,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  ratio: number;
}) {
  const ratioStyle: CSSProperties & Record<`--${string}`, string | number | undefined> = {
    '--ratio': ratio,
  };
  return (
    <div
      className={cn('relative aspect-(--ratio)', className)}
      data-slot="aspect-ratio"
      style={ratioStyle}
      {...props}
    />
  );
}

export { AspectRatio };
