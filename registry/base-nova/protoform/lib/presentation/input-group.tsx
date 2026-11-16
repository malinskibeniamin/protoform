'use client';

import type { VariantProps } from 'class-variance-authority';
import React from 'react';
import { inputGroupAddonVariants } from '@/components/ui/shared/input-group-variants';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

function InputGroup({ className, testId, ...props }: React.ComponentProps<'div'> & SharedProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [hasBlockAlign, setHasBlockAlign] = React.useState(false);

  React.useEffect(() => {
    if (ref.current) {
      const blockAddon = ref.current.querySelector('[data-align="block-start"], [data-align="block-end"]');
      setHasBlockAlign(Boolean(blockAddon));
    }
  }, []);

  return (
    <div
      className={cn(
        'group/input-group relative flex w-full rounded-md border !border-input shadow-xs transition outline-none dark:bg-input/30',
        'h-9 min-w-0 has-[>textarea]:h-auto',

        hasBlockAlign === true ? 'h-auto flex-col items-stretch' : 'items-center',

        'has-[>[data-align=inline-start]]:[&>input]:pl-2',
        'has-[>[data-align=inline-end]]:[&>input]:pr-2',
        'has-[>[data-align=block-start]]:[&>input]:pb-3',
        'has-[>[data-align=block-end]]:[&>input]:pt-3',

        'has-[:is([data-slot=input-group-control]):focus-visible]:border-ring has-[:is([data-slot=input-group-control]):focus-visible]:ring-3 has-[:is([data-slot=input-group-control]):focus-visible]:ring-ring/50',

        'has-[:is([data-slot][aria-invalid=true])]:border-destructive has-[:is([data-slot][aria-invalid=true])]:ring-destructive/20 dark:has-[:is([data-slot][aria-invalid=true])]:ring-destructive/40',

        className
      )}
      data-slot="input-group"
      data-testid={testId}
      ref={ref}
      {...props}
    />
  );
}

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      className={cn(inputGroupAddonVariants({ align }), className)}
      data-align={align}
      data-slot="input-group-addon"
      onClick={(e) => {
        if (e.target instanceof Element && e.target.closest('button')) {
          return;
        }
        e.currentTarget.parentElement?.querySelector('input')?.focus();
      }}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupText };
