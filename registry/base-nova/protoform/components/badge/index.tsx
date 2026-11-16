import { useRender } from '@base-ui/react/use-render';
import type { VariantProps } from 'class-variance-authority';
import type React from 'react';
import { badgeVariants } from '@/components/ui/shared/badge-variants';
import { asChildToRender } from '@/registry/base-nova/protoform/lib/base-ui-compat';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
export type BadgeSize = VariantProps<typeof badgeVariants>['size'];

function Badge({
  className,
  variant,
  asChild = false,
  testId,
  icon,
  children,
  size,
  ref,
  render,
  ...props
}: useRender.ComponentProps<'span'> &
  SharedProps & {
    asChild?: boolean;
    icon?: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
  }) {
  const childProps = asChildToRender({ asChild, children, render });

  const renderContent = () => {
    if (asChild === true) {
      return children;
    }

    if (icon && children) {
      return (
        <>
          {icon}
          <span className="truncate">{children}</span>
        </>
      );
    }

    if (icon) {
      return icon;
    }

    if (children) {
      return <span className="truncate">{children}</span>;
    }

    return null;
  };

  return useRender({
    defaultTagName: 'span',
    render: childProps.render,
    ref,
    props: {
      ...props,
      className: cn(badgeVariants({ size, variant }), className),
      'data-slot': 'badge',
      'data-testid': testId,
      children: asChild === true ? undefined : renderContent(),
    },
  });
}

export { badgeVariants } from '@/components/ui/shared/badge-variants';
export { Badge };
