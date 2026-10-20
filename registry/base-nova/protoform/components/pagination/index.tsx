'use client';

import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';
import type React from 'react';
import { type Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      data-slot="pagination"
      {...props}
    />
  );
}
function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul className={cn('flex items-center gap-0.5', className)} data-slot="pagination-content" {...props} />;
}
function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}
type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>;
function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive === true ? 'page' : undefined}
      className={cn(buttonVariants({ size, variant: isActive === true ? 'outline' : 'ghost' }), className)}
      data-active={isActive}
      data-slot="pagination-link"
      {...props}
    />
  );
}
function PaginationPrevious({
  className,
  text = 'Previous',
  ...props
}: React.ComponentProps<typeof PaginationLink> & {
  text?: string;
}) {
  return (
    <PaginationLink aria-label="Go to previous page" className={className} size="md" {...props}>
      <ChevronLeftIcon className="rtl:-scale-x-100" data-icon="inline-start" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  );
}
function PaginationNext({
  className,
  text = 'Next',
  ...props
}: React.ComponentProps<typeof PaginationLink> & {
  text?: string;
}) {
  return (
    <PaginationLink aria-label="Go to next page" className={className} size="md" {...props}>
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon className="rtl:-scale-x-100" data-icon="inline-end" />
    </PaginationLink>
  );
}
function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      className={cn("flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4", className)}
      data-slot="pagination-ellipsis"
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
