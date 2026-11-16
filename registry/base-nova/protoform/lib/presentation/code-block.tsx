'use client';

import type { VariantProps } from 'class-variance-authority';
import type React from 'react';
import { codeBlockLineVariants } from '@/components/ui/shared/code-block-variants';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

function CodeBlockHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex min-w-0 shrink-0 flex-wrap items-center gap-2 px-3 pt-3 text-muted-foreground group-data-[size=sm]/code-block:px-2.5 group-data-[size=sm]/code-block:pt-2.5 group-data-[variant=destructive]/code-block:text-destructive *:has-[>[data-slot=code-block-title]]:min-w-0',
        className
      )}
      data-slot="code-block-header"
      {...props}
    />
  );
}

function CodeBlockTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        "max-w-full min-w-0 truncate font-sans text-sm font-medium text-foreground group-data-[size=sm]/code-block:text-xs group-data-[variant=destructive]/code-block:text-destructive [&_svg]:pointer-events-none [&_svg]:me-1.5 [&_svg]:inline-block [&_svg]:align-middle [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      data-slot="code-block-title"
      {...props}
    />
  );
}

function CodeBlockActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        '-my-1 ms-auto -me-1.5 flex max-w-full shrink-0 flex-wrap items-center gap-1 [&:is([data-slot=code-block]>*)]:absolute [&:is([data-slot=code-block]>*)]:inset-e-2 [&:is([data-slot=code-block]>*)]:top-2 [&:is([data-slot=code-block]>*)]:z-10 [&:is([data-slot=code-block]>*)]:m-0 [&:is([data-slot=code-block]>*)]:opacity-0 [&:is([data-slot=code-block]>*)]:transition-opacity [&:is([data-slot=code-block]>*)]:group-focus-within/code-block:opacity-100 [&:is([data-slot=code-block]>*)]:group-hover/code-block:opacity-100 group-data-[size=sm]/code-block:[&:is([data-slot=code-block]>*)]:inset-e-1.5 group-data-[size=sm]/code-block:[&:is([data-slot=code-block]>*)]:top-1.5 [&:is([data-slot=code-block]>*)]:pointer-coarse:opacity-100 [&:is([data-slot=code-block]>*)]:*:[button]:bg-background [&:is([data-slot=code-block]>*)]:*:[button]:ring-1 [&:is([data-slot=code-block]>*)]:*:[button]:ring-foreground/10',
        className
      )}
      data-slot="code-block-actions"
      {...props}
    />
  );
}

function CodeBlockLine({
  className,
  variant = 'default',
  children,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof codeBlockLineVariants>) {
  const empty =
    children === undefined ||
    children === null ||
    children === '' ||
    (Array.isArray(children) && children.length === 0);

  return (
    <span
      className={cn(codeBlockLineVariants({ variant }), className)}
      data-slot="code-block-line"
      data-variant={variant}
      {...props}
    >
      <span className="min-w-0" data-slot="code-block-line-content">
        {empty === true ? '\n' : null}
        {children}
      </span>
    </span>
  );
}

function CodeBlockFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex min-w-0 shrink-0 items-center gap-2 px-3 pb-3 text-muted-foreground group-data-[size=sm]/code-block:px-2.5 group-data-[size=sm]/code-block:pb-2.5',
        className
      )}
      data-slot="code-block-footer"
      {...props}
    />
  );
}

export { CodeBlockActions, CodeBlockFooter, CodeBlockHeader, CodeBlockLine, CodeBlockTitle };
