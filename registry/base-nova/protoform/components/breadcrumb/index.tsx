'use client';

import { mergeProps, type PartProps, renderElement } from '@ui-sdk/react/primitive';
import { ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';
import type React from 'react';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

function Breadcrumb({ className, ...props }: React.ComponentProps<'nav'>) {
  return <nav aria-label="breadcrumb" className={cn(className)} data-slot="breadcrumb" {...props} />;
}
function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      className={cn('flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground', className)}
      data-slot="breadcrumb-list"
      {...props}
    />
  );
}
function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li className={cn('inline-flex items-center gap-1', className)} data-slot="breadcrumb-item" {...props} />;
}
function BreadcrumbLink({ className, render, ...props }: PartProps<'a'>) {
  return renderElement(
    'a',
    {
      ...mergeProps(
        {
          className: cn('transition-colors hover:text-foreground', className),
        },
        props
      ),
      'data-slot': 'breadcrumb-link',
    },
    render,
    {
      slot: 'breadcrumb-link',
    }
  );
}
function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-current="page"
      className={cn('font-normal text-foreground', className)}
      data-slot="breadcrumb-page"
      {...props}
    />
  );
}
function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      aria-hidden="true"
      className={cn('[&>svg]:size-3.5', className)}
      data-slot="breadcrumb-separator"
      role="presentation"
      {...props}
    >
      {children ?? <ChevronRightIcon className="rtl:-scale-x-100" />}
    </li>
  );
}
function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden="true"
      className={cn('flex size-5 items-center justify-center [&>svg]:size-4', className)}
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
