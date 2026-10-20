'use client';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { cva, type VariantProps } from 'class-variance-authority';
import { type HTMLMotionProps, motion } from 'motion/react';
import type React from 'react';
import { useState } from 'react';

import { splitMotionProps } from '@/registry/base-nova/protoform/lib/base-ui-compat';
import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

const pathDrawClassName =
  '[stroke-dasharray:1] [stroke-dashoffset:1] opacity-0 transition-[stroke-dashoffset,opacity] duration-200 ease-out data-[visible=true]:[stroke-dashoffset:0] data-[visible=true]:opacity-100 data-[visible=true]:delay-100';

const checkboxVariants = cva(
  'peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border outline-none transition-colors after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 motion-safe:active:scale-95 motion-safe:hover:scale-105 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
  {
    defaultVariants: {
      variant: 'primary',
    },
    variants: {
      variant: {
        outline:
          '!border-input data-[state=checked]:border-foreground data-[state=indeterminate]:border-foreground data-[state=checked]:bg-transparent data-[state=indeterminate]:bg-transparent data-[state=checked]:text-foreground data-[state=indeterminate]:text-foreground',
        primary:
          '!border-input data-[state=checked]:border-primary data-[state=indeterminate]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:text-primary-foreground',
        secondary:
          '!border-input data-[state=checked]:border-secondary data-[state=indeterminate]:border-secondary data-[state=checked]:bg-secondary data-[state=indeterminate]:bg-secondary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:text-primary-foreground',
      },
    },
  }
);

type PrimitiveCheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>;
type CheckboxProps = Omit<PrimitiveCheckboxProps, 'checked' | 'defaultChecked'> &
  Omit<HTMLMotionProps<'button'>, keyof PrimitiveCheckboxProps> &
  VariantProps<typeof checkboxVariants> &
  SharedProps & {
    checked?: boolean | 'indeterminate' | undefined;
    defaultChecked?: boolean | 'indeterminate' | undefined;
  };

function Checkbox({
  className,
  variant,
  testId,
  checked,
  defaultChecked,
  indeterminate,
  onCheckedChange,
  nativeButton,
  render,
  children,
  ...props
}: CheckboxProps) {
  const [uncontrolledIndeterminate, setUncontrolledIndeterminate] = useState(defaultChecked === 'indeterminate');
  const handleCheckedChange: NonNullable<PrimitiveCheckboxProps['onCheckedChange']> = (next, details) => {
    onCheckedChange?.(next, details);
    if (!details.isCanceled && checked === undefined) {
      setUncontrolledIndeterminate(false);
    }
  };
  const separated = splitMotionProps(props);
  const renderRoot: NonNullable<PrimitiveCheckboxProps['render']> = (rootProps, state) => {
    const Root: React.ElementType = nativeButton === false ? 'span' : 'button';
    let dataState = 'unchecked';
    if (state.checked) {
      dataState = 'checked';
    }
    if (state.indeterminate) {
      dataState = 'indeterminate';
    }
    return <Root {...rootProps} data-state={dataState} />;
  };
  return (
    <CheckboxPrimitive.Root
      {...separated.native}
      checked={checked === 'indeterminate' ? false : checked}
      className={(state) =>
        cn(checkboxVariants({ variant }), typeof className === 'function' ? className(state) : className)
      }
      data-slot="checkbox"
      data-testid={testId}
      defaultChecked={defaultChecked === 'indeterminate' ? false : defaultChecked}
      indeterminate={
        indeterminate ?? (checked === 'indeterminate' || (checked === undefined && uncontrolledIndeterminate))
      }
      nativeButton={nativeButton ?? render === undefined}
      onCheckedChange={handleCheckedChange}
      render={render ?? renderRoot}
    >
      <motion.span className="contents" {...separated.motion}>
        {children}
        <CheckboxPrimitive.Indicator className="group/indicator size-3.5" keepMounted render={<span />}>
          <svg
            aria-hidden="true"
            className="size-3.5"
            data-slot="checkbox-indicator"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            viewBox="0 0 24 24"
          >
            <path
              className={cn(
                pathDrawClassName,
                'group-data-indeterminate/indicator:hidden group-data-checked/indicator:opacity-100 group-data-checked/indicator:[stroke-dashoffset:0]'
              )}
              d="M4.5 12.75l6 6 9-13.5"
              pathLength={1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className={cn(
                pathDrawClassName,
                'group-data-indeterminate/indicator:opacity-100 group-data-indeterminate/indicator:[stroke-dashoffset:0]'
              )}
              d="M5 12h14"
              pathLength={1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CheckboxPrimitive.Indicator>
      </motion.span>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox, type CheckboxProps, checkboxVariants };
