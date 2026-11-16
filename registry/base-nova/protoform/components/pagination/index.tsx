'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import type React from 'react';
import { type Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

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

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/components/ui/shared/pagination';
export { PaginationLink, PaginationNext, PaginationPrevious };
