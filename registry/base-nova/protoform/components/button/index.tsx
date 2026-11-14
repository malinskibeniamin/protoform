'use client';

import { Button as ButtonPrimitive } from '@ui-sdk/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';

import { Spinner } from '@/components/ui/spinner/index';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
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
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
    variants: {
      size: {
        default: 'h-8 gap-1.5 px-2.5 has-[>svg]:px-2 [&_svg]:size-4',
        rail: 'h-auto w-4 rounded-none p-0',
        icon: 'size-8 [&_svg]:size-4',
        'icon-lg': 'size-9 [&_svg]:size-4',
        'icon-sm': 'size-7 [&_svg]:size-3.5',
        'icon-xs': 'size-6 [&_svg:not([class*="size-"])]:size-3',
        lg: 'h-9 gap-1.5 px-2.5 has-[>svg]:px-2 [&_svg]:size-4',
        md: 'h-8 gap-1.5 px-2.5 has-[>svg]:px-2 [&_svg]:size-4',
        sm: 'h-7 gap-1 px-2.5 text-xs has-[>svg]:px-2 [&_svg]:size-3.5',
        xs: 'h-6 gap-1 px-2 text-xs has-[>svg]:px-1.5 [&_svg]:size-3',
      },
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:bg-primary/80',
        rail: 'rounded-none border-0 bg-transparent shadow-none transition-none hover:bg-transparent hover:after:bg-sidebar-border',
        calendar:
          'flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 bg-transparent leading-none font-normal text-foreground group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-selected group-data-[focused=true]/day:ring-3 group-data-[focused=true]/day:ring-selected/50 hover:bg-muted hover:text-foreground active:bg-muted/80 data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-selected data-[range-end=true]:text-selected-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md data-[range-start=true]:bg-selected data-[range-start=true]:text-selected-foreground data-[selected-single=true]:bg-selected data-[selected-single=true]:text-selected-foreground dark:hover:text-accent-foreground [&>span]:text-xs [&>span]:opacity-70',
        accent: [
          'bg-primary text-primary-foreground shadow-xs',
          'hover:bg-primary/90',
          'active:bg-primary/80',
          'disabled:bg-muted disabled:text-muted-foreground',
        ],
        'accent-ghost': [
          'bg-transparent text-primary',
          'hover:bg-primary/10 hover:text-primary',
          'active:bg-primary/15',
          'disabled:text-muted-foreground',
        ],
        'accent-outline': [
          'border !border-primary bg-transparent text-primary shadow-xs',
          'hover:border-primary/80 hover:bg-primary/10',
          'active:border-primary/70 active:bg-primary/15',
          'disabled:border-border disabled:text-muted-foreground',
        ],
        dashed: [
          'border-2 border-dashed !border-primary bg-transparent text-primary',
          'hover:border-primary/80 hover:bg-primary/5',
          'active:bg-primary/10',
          'disabled:border-border disabled:text-muted-foreground',
        ],
        destructive: [
          'bg-destructive text-primary-foreground shadow-xs',
          'hover:bg-destructive/90',
          'active:bg-destructive/80',
          'focus-visible:ring-destructive',
          'disabled:bg-muted disabled:text-muted-foreground',
        ],
        'destructive-ghost': [
          'bg-transparent text-destructive',
          'hover:bg-destructive/10 hover:text-destructive',
          'active:bg-destructive/10',
          'focus-visible:ring-destructive',
          'disabled:text-muted-foreground',
        ],
        'destructive-outline': [
          'border !border-destructive bg-transparent text-destructive shadow-xs',
          'hover:border-destructive/80 hover:bg-destructive/10',
          'active:border-destructive/70 active:bg-destructive/15',
          'focus-visible:ring-destructive',
          'disabled:border-border disabled:text-muted-foreground',
        ],
        help: 'rounded-full bg-transparent text-muted-foreground shadow-none hover:bg-muted hover:text-foreground',
        ghost: ['bg-transparent text-foreground', 'hover:bg-muted hover:text-foreground', 'active:bg-muted/80'],
        inverse: [
          'bg-foreground text-background shadow-xs',
          'hover:bg-foreground/90',
          'active:bg-foreground/80',
          'disabled:bg-muted disabled:text-muted-foreground',
        ],
        'inverse-ghost': [
          'bg-transparent text-primary-foreground',
          'hover:bg-primary-foreground/10',
          'active:bg-primary-foreground/15',
          'disabled:text-muted-foreground',
        ],
        'inverse-outline': [
          'border !border-primary-foreground bg-transparent text-primary-foreground shadow-xs',
          'hover:border-transparent hover:bg-primary-foreground/10',
          'active:border-transparent active:bg-primary-foreground/15',
          'disabled:border-muted-foreground disabled:text-muted-foreground',
        ],
        link: [
          'text-primary underline-offset-4',
          'hover:text-primary/80 hover:underline',
          'active:text-primary/60',
          'disabled:text-muted-foreground disabled:no-underline',
        ],
        outline: [
          'border border-input bg-background text-foreground shadow-xs',
          'hover:bg-muted hover:text-foreground',
          'active:bg-muted/80',
        ],
        primary: [
          'bg-primary text-primary-foreground shadow-xs',
          'hover:bg-primary/90',
          'active:bg-primary/80',
          undefined,
        ],
        secondary: [
          'bg-primary text-primary-foreground shadow-xs',
          'hover:bg-primary/90',
          'active:bg-primary/80',
          'disabled:bg-muted disabled:text-muted-foreground',
        ],
        'secondary-ghost': [
          'bg-transparent text-secondary-foreground',
          'hover:bg-secondary',
          'active:bg-secondary/80',
          'disabled:text-muted-foreground',
        ],
        'secondary-outline': [
          'border !border-primary-foreground text-secondary-foreground shadow-xs',
          'hover:border-ring hover:bg-secondary/50',
          'active:border-ring active:bg-secondary/80',
          'disabled:border-border disabled:text-muted-foreground',
        ],
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
      className={(state) =>
        cn(buttonVariants({ variant, size }), typeof className === 'function' ? className(state) : className)
      }
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
