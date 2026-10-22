import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { Circle } from 'lucide-react';
import { AnimatePresence, type HTMLMotionProps, motion, type Transition } from 'motion/react';
import type React from 'react';

import { splitMotionProps } from '@/registry/base-nova/protoform/lib/base-ui-compat';
import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

const DEFAULT_TRANSITION = { duration: 0.15 } satisfies Transition;

type RadioGroupOrientation = 'vertical' | 'horizontal';

type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive> &
  SharedProps & {
    orientation?: RadioGroupOrientation;

    transition?: Transition;
  };

function RadioGroup(allProps: RadioGroupProps) {
  const { className, orientation = 'vertical', testId, onValueChange, ...props } = allProps;

  const hasValueProp = 'value' in allProps;
  const valueOverride = hasValueProp && allProps.value === undefined ? { value: '' } : undefined;

  return (
    <RadioGroupPrimitive
      aria-orientation={orientation}
      className={(state) =>
        cn(
          'grid w-full gap-2',
          orientation === 'horizontal' && 'grid-cols-2',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-orientation={orientation}
      data-slot="radio-group"
      data-testid={testId}
      onValueChange={onValueChange}
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
      className={(state) =>
        cn(
          'flex items-center justify-center data-[unchecked]:hidden',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-slot="radio-group-indicator"
      keepMounted
      {...props}
    >
      <AnimatePresence>
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center"
          data-slot="radio-group-indicator-circle"
          exit={{ opacity: 0, scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.95 }}
          key="radio-group-indicator-circle"
          transition={transition}
        >
          <Circle className="size-2 fill-current stroke-none" />
        </motion.div>
      </AnimatePresence>
    </RadioPrimitive.Indicator>
  );
}

type PrimitiveRadioProps = React.ComponentProps<typeof RadioPrimitive.Root>;
type RadioGroupItemProps = PrimitiveRadioProps &
  Omit<HTMLMotionProps<'button'>, keyof PrimitiveRadioProps> &
  SharedProps & { transition?: Transition; variant?: 'card' | 'default' };

function RadioGroupItem({
  children,
  className,
  transition = DEFAULT_TRANSITION,
  testId,
  variant = 'default',
  nativeButton,
  render,
  ...props
}: RadioGroupItemProps) {
  const separated = splitMotionProps(props);
  const renderRoot: NonNullable<PrimitiveRadioProps['render']> = (rootProps, state) => {
    const Root: React.ElementType = nativeButton === false ? 'span' : 'button';
    return <Root {...rootProps} data-state={state.checked ? 'checked' : 'unchecked'} />;
  };
  return (
    <RadioPrimitive.Root
      {...separated.native}
      className={(state) =>
        cn(
          variant === 'card'
            ? 'flex h-auto min-h-12 w-full items-center justify-between gap-4 rounded-lg border border-border/70 bg-background px-4 py-3 text-left text-foreground ring-offset-background transition hover:border-foreground/30 hover:shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-foreground data-[checked]:bg-muted/30 data-[checked]:shadow-xs'
            : 'relative flex aspect-square size-4 cursor-pointer items-center justify-center rounded-full border !border-input outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground motion-safe:hover:scale-105 motion-safe:active:scale-95 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-slot="radio-group-item"
      data-testid={testId}
      nativeButton={nativeButton ?? render === undefined}
      render={render ?? renderRoot}
    >
      <motion.span className="contents" {...separated.motion}>
        {children}
        {variant === 'card' ? (
          <span
            aria-hidden="true"
            className="flex aspect-square size-5 shrink-0 items-center justify-center rounded-full border !border-input text-selected"
          >
            <RadioGroupIndicator data-slot="radio-group-item-indicator" transition={transition} />
          </span>
        ) : (
          <RadioGroupIndicator data-slot="radio-group-item-indicator" transition={transition} />
        )}
      </motion.span>
    </RadioPrimitive.Root>
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
