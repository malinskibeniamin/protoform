import { type PartProps, renderElement } from '@ui-sdk/react/primitive';
import type { VariantProps } from 'class-variance-authority';
import type React from 'react';
import { badgeVariants } from '@/components/ui/shared/badge-variants';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
export type BadgeSize = VariantProps<typeof badgeVariants>['size'];

function Badge({
  className,
  variant,
  testId,
  icon,
  children,
  size,
  render,
  ...props
}: Omit<PartProps<'span'>, 'children'> & { children?: React.ReactNode } & SharedProps & {
    icon?: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
  }) {
  return renderElement(
    'span',
    {
      ...props,
      className: cn(badgeVariants({ size, variant }), typeof className === 'function' ? className({}) : className),
      'data-slot': 'badge',
      'data-testid': testId ?? props['data-testid'],
      children: (
        <>
          {icon}
          {children}
        </>
      ),
    },
    render
  );
}

export { badgeVariants } from '@/components/ui/shared/badge-variants';
export { Badge };
