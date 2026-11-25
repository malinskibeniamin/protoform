import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { Circle } from 'lucide-react';
import type React from 'react';

import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

type RadioGroupOrientation = 'vertical' | 'horizontal';

type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive> &
  SharedProps & {
    orientation?: RadioGroupOrientation;
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

type RadioGroupIndicatorProps = React.ComponentProps<typeof RadioPrimitive.Indicator>;

function RadioGroupIndicator({ className, ...props }: RadioGroupIndicatorProps) {
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
      <span
        className="flex animate-in items-center justify-center duration-150 fade-in-0 zoom-in-95 motion-reduce:animate-none"
        data-slot="radio-group-indicator-circle"
      >
        <Circle className="size-2 fill-current stroke-none" />
      </span>
    </RadioPrimitive.Indicator>
  );
}

type PrimitiveRadioProps = React.ComponentProps<typeof RadioPrimitive.Root>;
type RadioGroupItemProps = PrimitiveRadioProps & SharedProps & { variant?: 'card' | 'default' };

function RadioGroupItem({
  children,
  className,
  testId,
  variant = 'default',
  nativeButton,
  render,
  ...props
}: RadioGroupItemProps) {
  const renderRoot: NonNullable<PrimitiveRadioProps['render']> = (rootProps, state) => {
    const Root: React.ElementType = nativeButton === false ? 'span' : 'button';
    return <Root {...rootProps} data-state={state.checked ? 'checked' : 'unchecked'} />;
  };
  return (
    <RadioPrimitive.Root
      {...props}
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
      {children}
      {variant === 'card' ? (
        <span
          aria-hidden="true"
          className="flex aspect-square size-5 shrink-0 items-center justify-center rounded-full border !border-input text-selected"
        >
          <RadioGroupIndicator data-slot="radio-group-item-indicator" />
        </span>
      ) : (
        <RadioGroupIndicator data-slot="radio-group-item-indicator" />
      )}
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
