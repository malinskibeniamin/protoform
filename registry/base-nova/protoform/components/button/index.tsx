'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import React, { type ElementType } from 'react';

import { useGroup } from '@/registry/base-nova/protoform/components/group';
import { Spinner } from '@/registry/base-nova/protoform/components/spinner';
import { Slot } from '@/registry/base-nova/protoform/lib/base-ui-compat';
import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

const buttonVariants = cva(
  [
    'group/button inline-flex shrink-0 items-center justify-center',
    'whitespace-nowrap rounded-lg border border-transparent bg-clip-padding text-sm font-medium',
    'transition-all outline-none select-none',
    'cursor-pointer',
    'disabled:pointer-events-none disabled:cursor-not-allowed',
    'disabled:opacity-50',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
    'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
    'selection:bg-selected selection:text-selected-foreground',
    'active:not-aria-[haspopup]:translate-y-px',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-primary-foreground shadow-xs',
          'hover:bg-primary/90',
          'active:bg-primary/80',
          undefined,
        ],
        secondary: [
          'bg-surface-primary text-inverse shadow-xs',
          'hover:bg-surface-primary-hover',
          'active:bg-surface-primary-pressed',
          'disabled:bg-background-disabled disabled:text-disabled',
        ],
        accent: [
          'bg-brand text-inverse shadow-xs',
          'hover:bg-surface-brand-hover',
          'active:bg-surface-brand-pressed',
          'disabled:bg-background-disabled disabled:text-disabled',
        ],
        destructive: [
          'bg-destructive text-inverse shadow-xs',
          'hover:bg-surface-error-hover',
          'active:bg-surface-error-pressed',
          'focus-visible:ring-destructive',
          'disabled:bg-background-disabled disabled:text-disabled',
        ],
        inverse: [
          'bg-surface-inverse text-secondary shadow-xs',
          'hover:bg-surface-inverse-hover',
          'active:bg-surface-inverse-pressed',
          'disabled:bg-surface-inverse-disabled disabled:text-disabled',
        ],
        outline: [
          'border border-input bg-background text-foreground shadow-xs',
          'hover:bg-muted hover:text-foreground',
          'active:bg-muted/80',
        ],
        'secondary-outline': [
          '!border-outline-inverse border text-secondary shadow-xs',
          'hover:border-outline-hover hover:bg-secondary-alpha-subtle',
          'active:border-outline-pressed active:bg-secondary-alpha-default',
          'disabled:border-outline-inverse-disabled disabled:text-disabled',
        ],
        'accent-outline': [
          '!border-brand border bg-transparent text-brand shadow-xs',
          'hover:border-outline-brand-hover hover:bg-brand-alpha-subtle',
          'active:border-outline-brand-pressed active:bg-brand-alpha-default',
          'disabled:border-border disabled:text-disabled',
        ],
        'destructive-outline': [
          '!border-destructive border bg-transparent text-destructive shadow-xs',
          'hover:border-outline-error-hover hover:bg-destructive-alpha-subtle',
          'active:border-outline-error-pressed active:bg-destructive-alpha-default',
          'focus-visible:ring-destructive',
          'disabled:border-border disabled:text-disabled',
        ],
        'inverse-outline': [
          '!border-inverse-primary border bg-transparent text-inverse-primary shadow-xs',
          'hover:border-transparent hover:bg-light-alpha-strong',
          'active:border-transparent active:bg-light-alpha-stronger',
          'disabled:border-inverse-disabled disabled:text-inverse-disabled',
        ],
        ghost: [
          'bg-transparent text-foreground',
          'hover:bg-muted hover:text-foreground',
          'active:bg-muted/80',
        ],
        'secondary-ghost': [
          'bg-transparent text-secondary',
          'hover:bg-surface-secondary-subtle',
          'active:bg-surface-secondary-subtle-hover',
          'disabled:text-disabled',
        ],
        'accent-ghost': [
          'bg-transparent text-brand',
          'hover:bg-surface-brand-subtle hover:text-brand',
          'active:bg-surface-brand-subtle-hover',
          'disabled:text-disabled',
        ],
        'destructive-ghost': [
          'bg-transparent text-destructive',
          'hover:bg-background-error-subtle hover:text-destructive',
          'active:bg-destructive-subtle',
          'focus-visible:ring-destructive',
          'disabled:text-disabled',
        ],
        'inverse-ghost': [
          'bg-transparent text-inverse-primary',
          'hover:bg-light-alpha-strong',
          'active:bg-light-alpha-stronger',
          'disabled:text-inverse-disabled',
        ],
        // Link variant
        link: [
          'text-primary underline-offset-4',
          'hover:text-primary/80 hover:underline',
          'active:text-primary/60',
          'disabled:text-disabled disabled:no-underline',
        ],
        // Dashed border variant
        dashed: [
          '!border-primary border-2 border-dashed bg-transparent text-primary',
          'hover:border-primary/80 hover:bg-primary/5',
          'active:bg-primary/10',
          'disabled:border-border disabled:text-disabled',
        ],
      },
      size: {
        xs: 'h-6 gap-1 px-2 text-xs has-[>svg]:px-1.5 [&_svg]:size-3',
        sm: 'h-7 gap-1 px-2.5 text-[0.8rem] has-[>svg]:px-2 [&_svg]:size-3.5',
        md: 'h-8 gap-1.5 px-2.5 has-[>svg]:px-2 [&_svg]:size-4',
        lg: 'h-9 gap-1.5 px-2.5 has-[>svg]:px-2 [&_svg]:size-4',
        icon: 'size-8 [&_svg]:size-4',
        'icon-xs': 'size-6 [&_svg]:size-3',
        'icon-sm': 'size-7 [&_svg]:size-3.5',
        'icon-lg': 'size-9 [&_svg]:size-4',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export type ButtonProps = React.ComponentProps<'button'> &
  ButtonVariants & {
    asChild?: boolean;
    as?: ElementType;
    to?: string;
    icon?: React.ReactNode;
    /**
     * Renders a centered spinner overlay while keeping the button at its
     * natural width. Also disables interaction and sets aria-busy.
     */
    isLoading?: boolean;
    // Support anchor element props when as="a"
    href?: string;
    target?: string;
    rel?: string;
  } & SharedProps;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      testId,
      as,
      to,
      icon,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = as ?? (asChild ? Slot : 'button');
    const { attached, position } = useGroup();

    let positionClasses = 'rounded-lg';
    if (attached && position === 'first') {
      positionClasses = 'rounded-r-none rounded-l-lg border-r-0';
    } else if (attached && position === 'last') {
      positionClasses = 'rounded-r-lg rounded-l-none border-l-0';
    } else if (attached && position === 'middle') {
      positionClasses = 'rounded-none border-r-0 border-l-0';
    }

    const isDisabled = disabled || isLoading;

    // When asChild is used with Slot, we can only pass ONE child element
    // to satisfy React.Children.only(). In asChild mode, users must include
    // icons inside children instead of using the icon prop.
    const renderContent = () => {
      if (asChild) {
        return children;
      }

      // Normal button mode - can have children + icon prop
      const content = icon ? (
        <>
          {children}
          {icon}
        </>
      ) : (
        children
      );

      if (isLoading) {
        return (
          <>
            <span className="invisible inline-flex items-center justify-center [gap:inherit]">{content}</span>
            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </span>
          </>
        );
      }

      return content;
    };

    return (
      <Comp
        aria-busy={isLoading || undefined}
        className={cn(
          buttonVariants({ variant, size, className }),
          positionClasses,
          icon && 'gap-2',
          isLoading && 'relative',
          className
        )}
        data-loading={isLoading || undefined}
        data-slot="button"
        data-testid={testId}
        disabled={isDisabled}
        ref={ref}
        to={to}
        {...props}
      >
        {renderContent()}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
