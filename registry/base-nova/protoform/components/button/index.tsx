'use client';

import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import React, { type ElementType } from 'react';

import { useGroup } from '@/components/ui/group';
import { buttonStyleOptions } from '@/components/ui/shared/button-variants';
import { Spinner } from '@/components/ui/spinner';
import { Slot } from '@/registry/base-nova/protoform/lib/base-ui-compat';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

const buttonVariants = cva(
  [
    'group/button inline-flex shrink-0 items-center justify-center',
    'rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap',
    'transition-all outline-none select-none',
    'cursor-pointer',
    'data-[slot=help-trigger]:rounded-full data-[slot=help-trigger]:text-muted-foreground data-[slot=help-trigger]:shadow-none data-[slot=help-trigger]:hover:text-foreground',
    'disabled:pointer-events-none disabled:cursor-not-allowed',
    'disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
    'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
    'selection:bg-selected selection:text-selected-foreground',
    'active:not-aria-[haspopup]:translate-y-px',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  ],
  buttonStyleOptions
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export type ButtonProps = ButtonPrimitive.Props &
  ButtonVariants & {
    asChild?: boolean | undefined;
    as?: ElementType | undefined;
    to?: string | undefined;
    icon?: React.ReactNode | undefined;
    isLoading?: boolean | undefined;
    href?: string | undefined;
    target?: string | undefined;
    rel?: string | undefined;
  } & SharedProps;

function ButtonContent({ children, icon, isLoading }: Pick<ButtonProps, 'children' | 'icon' | 'isLoading'>) {
  const content = icon ? (
    <>
      {children}
      {icon}
    </>
  ) : (
    children
  );
  if (isLoading === true) {
    return (
      <>
        <span className="invisible contents">{content}</span>
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      </>
    );
  }
  return content;
}

type ButtonStyleProps = Pick<ButtonProps, 'className' | 'variant' | 'size' | 'icon' | 'isLoading'> & {
  positionClasses: string;
};

function getButtonClasses(
  { className, variant, size, icon, isLoading, positionClasses }: ButtonStyleProps,
  state: ButtonPrimitive.State
) {
  return cn(
    buttonVariants({ size, variant }),
    positionClasses,
    icon && 'gap-2',
    isLoading === true && 'relative',
    typeof className === 'function' ? className(state) : className
  );
}

function getButtonPositionClasses(attached: boolean, position: ReturnType<typeof useGroup>['position']) {
  if (!attached) {
    return 'rounded-lg';
  }
  if (position === 'first') {
    return 'rounded-r-none rounded-l-lg border-r-0';
  }
  if (position === 'last') {
    return 'rounded-r-lg rounded-l-none border-l-0';
  }
  if (position === 'middle') {
    return 'rounded-none border-r-0 border-l-0';
  }
  return 'rounded-lg';
}

function LegacyButton({
  as,
  asChild,
  children,
  className,
  variant,
  size,
  icon,
  isLoading,
  positionClasses,
  disabled,
  style,
  focusableWhenDisabled: _focusableWhenDisabled,
  ...props
}: ButtonProps & { positionClasses: string }) {
  const Component = as ?? Slot;
  const state: ButtonPrimitive.State = { disabled: disabled === true };
  return React.createElement(
    Component,
    {
      ...props,
      className: getButtonClasses({ className, variant, size, icon, isLoading, positionClasses }, state),
      disabled,
      style: typeof style === 'function' ? style(state) : style,
    },
    asChild === true ? (
      children
    ) : (
      <ButtonContent icon={icon} isLoading={isLoading}>
        {children}
      </ButtonContent>
    )
  );
}

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
      render,
      nativeButton,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const { attached, position } = useGroup();
    const isDisabled = disabled === true || isLoading;
    const positionClasses = getButtonPositionClasses(attached, position);
    const shared = {
      'aria-busy': isLoading === true ? true : undefined,
      'data-loading': isLoading === true ? true : undefined,
      'data-slot': 'button',
      'data-testid': testId,
      disabled: isDisabled,
      ref,
      type,
    } as const;
    const styleProps = { className, variant, size, icon, isLoading, positionClasses };
    if (asChild === true || as !== undefined) {
      return (
        <LegacyButton {...shared} {...props} {...styleProps} as={as} asChild={asChild} to={to}>
          {children}
        </LegacyButton>
      );
    }
    return (
      <ButtonPrimitive
        {...shared}
        {...props}
        className={(state) => getButtonClasses(styleProps, state)}
        nativeButton={nativeButton}
        render={render}
      >
        <ButtonContent icon={icon} isLoading={isLoading}>
          {children}
        </ButtonContent>
      </ButtonPrimitive>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
