import { Separator as SeparatorPrimitive } from '@base-ui/react/separator';
import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';

import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

const separatorVariants = cva(
  'shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'bg-border',
        item: 'my-2 bg-border',
        sidebar: 'mx-2 w-auto bg-border',
        group:
          'relative self-stretch bg-border data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto',
        strong: 'bg-border',
        subtle: 'bg-border/50',
      },
    },
  }
);

export type SeparatorVariant = VariantProps<typeof separatorVariants>['variant'];

type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive> &
  SharedProps & {
    variant?: SeparatorVariant;
    decorative?: boolean;
  };

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  variant,
  testId,
  ...props
}: SeparatorProps) {
  const a11yProps = decorative === true ? { 'aria-hidden': true, role: 'none' as const } : {};
  return (
    <SeparatorPrimitive
      className={(state) =>
        cn(separatorVariants({ variant }), typeof className === 'function' ? className(state) : className)
      }
      data-orientation={orientation}
      data-slot="separator"
      data-testid={testId}
      orientation={orientation}
      {...a11yProps}
      {...props}
    />
  );
}

export { Separator, separatorVariants };
