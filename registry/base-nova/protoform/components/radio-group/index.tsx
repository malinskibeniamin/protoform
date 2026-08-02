import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { Circle } from 'lucide-react';
import { AnimatePresence, type HTMLMotionProps, motion, type Transition } from 'motion/react';
import React from 'react';

import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

// Radix RadioGroup supported an `orientation` prop; Base UI's RadioGroup does not
// declare one. Preserve the public API by accepting it and forwarding as
// `aria-orientation` + data attribute.
type RadioGroupOrientation = 'vertical' | 'horizontal';

type RadioGroupProps = Omit<React.ComponentProps<typeof RadioGroupPrimitive>, 'onValueChange'> &
  SharedProps & {
    orientation?: RadioGroupOrientation;
    onValueChange?: (value: string) => void;
    transition?: Transition;
  };

function RadioGroup(allProps: RadioGroupProps) {
  const { className, orientation = 'vertical', testId, onValueChange, ...props } = allProps;

  const handleValueChange = React.useMemo(() => {
    if (!onValueChange) {
      return;
    }
    return (next: unknown) => onValueChange(next as string);
  }, [onValueChange]);

  // Radix parity: when consumers explicitly pass `value` (controlled mode) but
  // their source-of-truth starts as `undefined` (e.g. react-hook-form
  // `field.value` before the first change), Base UI's `useControlled` warns on
  // the undefined → string transition. Radix tolerated this silently. Normalize
  // undefined → '' only when `value` was explicitly passed — uncontrolled mode
  // via `defaultValue` (without `value`) keeps working unchanged.
  const hasValueProp = 'value' in allProps;
  const valueOverride = hasValueProp && allProps.value === undefined ? { value: '' } : undefined;

  return (
    <RadioGroupPrimitive
      aria-orientation={orientation}
      className={cn('grid w-full gap-2', orientation === 'horizontal' && 'grid-cols-2', className)}
      data-orientation={orientation}
      data-slot="radio-group"
      data-testid={testId}
      onValueChange={handleValueChange}
      {...props}
      {...valueOverride}
    />
  );
}

type RadioGroupIndicatorProps = React.ComponentProps<typeof RadioPrimitive.Indicator> & {
  transition: Transition;
};

function RadioGroupIndicator({ className, transition, ...props }: RadioGroupIndicatorProps) {
  return (
    <RadioPrimitive.Indicator
      className={cn('flex items-center justify-center data-[unchecked]:hidden', className)}
      data-slot="radio-group-indicator"
      keepMounted
      {...props}
    >
      <AnimatePresence>
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center"
          data-slot="radio-group-indicator-circle"
          exit={{ opacity: 0, scale: 0 }}
          initial={{ opacity: 0, scale: 0 }}
          key="radio-group-indicator-circle"
          transition={transition}
        >
          <Circle className="size-2 fill-current stroke-none" />
        </motion.div>
      </AnimatePresence>
    </RadioPrimitive.Indicator>
  );
}

type RadioGroupItemProps = React.ComponentProps<typeof RadioPrimitive.Root> &
  HTMLMotionProps<'button'> &
  SharedProps & {
    transition?: Transition;
    variant?: 'card' | 'default';
  };

function RadioGroupItem({
  children,
  className,
  transition = { duration: 0.15 },
  testId,
  variant = 'default',
  ...props
}: RadioGroupItemProps) {
  return (
    <RadioPrimitive.Root
      {...(props as React.ComponentProps<typeof RadioPrimitive.Root>)}
      nativeButton
      // biome-ignore lint/suspicious/noExplicitAny: Base UI render merges Root attrs for the consumer element
      render={(rootProps: Record<string, any>, state: { checked?: boolean; disabled?: boolean }) => (
        <motion.button
          {...rootProps}
          className={cn(
            variant === 'card'
              ? 'flex min-h-12 h-auto w-full items-center justify-between gap-4 rounded-lg border border-border/70 bg-background px-4 py-3 text-left text-foreground ring-offset-background transition-[border-color,box-shadow,background-color] hover:border-foreground/30 hover:shadow-xs data-[checked]:border-foreground data-[checked]:bg-muted/30 data-[checked]:shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              : '!border-input relative flex aspect-square size-4 cursor-pointer items-center justify-center rounded-full border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
            className
          )}
          data-slot="radio-group-item"
          data-state={state?.checked ? 'checked' : 'unchecked'}
          data-testid={testId}
          whileHover={variant === 'default' ? { scale: 1.05 } : undefined}
          whileTap={variant === 'default' ? { scale: 0.95 } : undefined}
        >
          {children}
          {variant === 'card' ? (
            <span
              aria-hidden="true"
              className="!border-input flex aspect-square size-5 shrink-0 items-center justify-center rounded-full border text-selected"
              data-state={state?.checked ? 'checked' : 'unchecked'}
            >
              <RadioGroupIndicator data-slot="radio-group-item-indicator" transition={transition} />
            </span>
          ) : (
            <RadioGroupIndicator data-slot="radio-group-item-indicator" transition={transition} />
          )}
        </motion.button>
      )}
    />
  );
}

export {
  RadioGroup,
  RadioGroupIndicator,
  type RadioGroupIndicatorProps,
  RadioGroupItem,
  type RadioGroupItemProps,
  type RadioGroupProps,
};
