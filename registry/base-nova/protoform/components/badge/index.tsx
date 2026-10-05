import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';

import { Slot } from '@/registry/base-nova/protoform/lib/base-ui-compat';
import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

const badgeVariants = cva(
  'inline-flex max-w-full shrink-0 items-center justify-center truncate rounded-md border font-medium transition selection:bg-selected selection:text-selected-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none',
  {
    defaultVariants: {
      size: 'md',
      variant: 'neutral',
    },
    variants: {
      size: {
        lg: 'h-8 gap-1.5 px-3 py-0 text-sm has-[>svg]:px-2 [&_svg]:size-4',
        md: 'h-6 gap-1 px-2 py-0 text-xs has-[>svg]:px-1.5 [&_svg]:size-3.5',
        sm: 'h-5 gap-1 px-1.5 py-0 text-xs has-[>svg]:px-1 [&_svg]:size-3',
      },
      variant: {
        accent: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        'accent-inverted': 'border-transparent bg-primary/10 text-primary [a&]:hover:bg-primary/15',
        'accent-outline': 'border-primary bg-transparent text-primary [a&]:hover:bg-primary/10',

        destructive:
          'border-transparent bg-destructive text-primary-foreground focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90',
        'destructive-inverted': 'border-transparent bg-destructive/10 text-destructive [a&]:hover:bg-destructive/10',
        'destructive-outline': 'border-destructive bg-transparent text-destructive [a&]:hover:bg-destructive/10',

        disabled: 'cursor-not-allowed border-transparent bg-muted text-muted-foreground',
        'disabled-inverted': 'cursor-not-allowed border-transparent bg-muted text-muted-foreground',
        'disabled-outline': 'cursor-not-allowed border-border bg-transparent text-muted-foreground',

        info: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        'info-inverted': 'border-transparent bg-primary/10 text-primary [a&]:hover:bg-primary/15',
        'info-outline': 'border-primary bg-transparent text-primary [a&]:hover:bg-primary/10',
        neutral: 'border-transparent bg-muted text-muted-foreground [a&]:hover:bg-foreground/15',
        'neutral-inverted': 'border-transparent bg-muted [a&]:hover:bg-muted',
        'neutral-outline': '!border-primary-foreground border [a&]:hover:bg-muted',

        outline: 'border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',

        primary: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        'primary-inverted': 'border-transparent bg-primary/10 text-primary [a&]:hover:bg-primary/20',
        'primary-outline': 'border-primary text-primary [a&]:hover:bg-primary/10',

        secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        'secondary-inverted': 'border-transparent bg-secondary/10 text-secondary-foreground [a&]:hover:bg-secondary/20',
        'secondary-outline': 'border-secondary text-secondary-foreground [a&]:hover:bg-secondary/10',

        simple: 'text-secondary-foreground [a&]:hover:bg-muted',
        'simple-inverted': 'text-secondary-foreground [a&]:hover:bg-muted',
        'simple-outline': '!border-primary-foreground border text-secondary-foreground [a&]:hover:bg-muted',

        success: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        'success-inverted': 'border-transparent bg-primary/10 text-primary [a&]:hover:bg-primary/15',
        'success-outline': 'border-primary bg-transparent text-primary [a&]:hover:bg-primary/10',

        warning: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        'warning-inverted': 'border-transparent bg-primary/10 text-primary [a&]:hover:bg-primary/10',
        'warning-outline': 'border-primary bg-transparent text-primary [a&]:hover:bg-primary/10',
      },
    },
  }
);

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
  ...props
}: React.ComponentProps<'span'> &
  SharedProps & {
    asChild?: boolean;
    icon?: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
  }) {
  const Comp = asChild === true ? Slot : 'span';

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

  return (
    <Comp
      className={cn(badgeVariants({ size, variant }), className)}
      data-slot="badge"
      data-testid={testId}
      ref={ref}
      {...props}
    >
      {renderContent()}
    </Comp>
  );
}

export { Badge, badgeVariants };
