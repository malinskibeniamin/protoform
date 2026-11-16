'use client';

import { mergeProps, type PartProps, renderElement } from '@ui-sdk/react/primitive';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

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

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/shared/breadcrumb';
export { BreadcrumbLink };
