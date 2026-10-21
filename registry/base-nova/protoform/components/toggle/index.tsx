import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

const toggleVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition hover:bg-muted hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=on]:bg-accent data-pressed:bg-accent data-[state=on]:text-accent-foreground data-pressed:text-accent-foreground dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: 'md',
      variant: 'ghost',
    },
    variants: {
      size: {
        default: 'h-9 min-w-9 px-2',
        lg: 'h-10 min-w-10 px-2.5',
        md: 'h-9 min-w-9 px-2',
        sm: 'h-8 min-w-8 px-1.5',
      },
      variant: {
        default: 'bg-transparent',
        ghost: 'bg-transparent',
        outline: '!border-input border bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground',
      },
    },
  }
);

type ToggleProps = React.ComponentProps<typeof TogglePrimitive> & VariantProps<typeof toggleVariants> & SharedProps;

function renderToggleButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>,
  state: { pressed?: boolean; disabled?: boolean }
) {
  const attrs: Record<string, unknown> = {
    'data-state': state.pressed === true ? 'on' : 'off',
  };
  if (state.disabled === true) {
    attrs['data-disabled'] = '';
  }
  return React.createElement('button', { ...props, ...attrs, type: props.type ?? 'button' });
}

function Toggle({ className, variant, size, testId, onPressedChange, ...props }: ToggleProps) {
  return (
    <TogglePrimitive
      className={(state) =>
        cn(toggleVariants({ className: typeof className === 'function' ? className(state) : className, size, variant }))
      }
      data-slot="toggle"
      data-testid={testId}
      onPressedChange={onPressedChange}
      render={renderToggleButton}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
