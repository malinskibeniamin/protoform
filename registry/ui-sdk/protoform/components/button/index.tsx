'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import { Spinner } from '@/components/ui/sdk/spinner/index';
import { buttonStyleOptions } from '@/components/ui/shared/button-variants';
import { stateClassName } from '@/components/ui/shared/state-class-name';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { Button as ButtonPrimitive } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/core-button';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

const buttonVariants = cva(
  [
    'group/button inline-flex shrink-0 items-center justify-center',
    'rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap',
    'transition-all outline-none select-none',
    'cursor-pointer',
    'disabled:pointer-events-none disabled:cursor-not-allowed',
    'disabled:opacity-50',
    'data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
    'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
    'selection:bg-selected selection:text-selected-foreground',
    'active:not-aria-[haspopup]:translate-y-px',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  ],
  {
    ...buttonStyleOptions,
    variants: {
      ...buttonStyleOptions.variants,
      variant: {
        ...buttonStyleOptions.variants.variant,
        help: 'rounded-full bg-transparent text-muted-foreground shadow-none hover:bg-muted hover:text-foreground',
      },
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export type ButtonProps = UIProps<React.ComponentProps<typeof ButtonPrimitive>> &
  VariantProps<typeof buttonVariants> &
  SharedProps & {
    icon?: React.ReactNode;
    isLoading?: boolean | undefined;
  };
function Button({
  className,
  variant,
  size,
  icon,
  isLoading = false,
  disabled,
  children,
  testId,
  type = 'button',
  ...props
}: ButtonProps) {
  const renderChildren = typeof children === 'function' ? children : () => children;
  const renderedIcon = isLoading === true ? <Spinner /> : icon;
  return (
    <ButtonPrimitive
      {...definedProps(props)}
      aria-busy={isLoading === true || undefined}
      className={stateClassName(buttonVariants({ variant, size }), className)}
      data-testid={testId ?? props['data-testid']}
      disabled={disabled === true || isLoading === true}
      type={type}
    >
      {(state) => (
        <>
          {renderedIcon}
          {renderChildren(state)}
        </>
      )}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
