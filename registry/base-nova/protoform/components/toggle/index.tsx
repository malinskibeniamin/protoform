'use client';

import { Toggle as SDKToggle, ToggleGroup as SDKToggleGroup, ToggleIcon as SDKToggleIcon } from '@ui-sdk/react/toggle';

import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

interface PresentationProps {
  size?: string | undefined;
  variant?: string | undefined;
}

const toggleSizes: Record<string, string> = {
  sm: 'h-8 min-w-8 px-1.5',
  lg: 'h-10 min-w-10 px-2.5',
};

function Toggle({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKToggle>> & SharedProps & PresentationProps) {
  return (
    <SDKToggle
      {...definedProps(props)}
      className={(state) =>
        cn(
          'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-transparent text-sm font-medium whitespace-nowrap outline-none hover:bg-muted hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-pressed:bg-accent data-pressed:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
          toggleSizes[size ?? 'md'] ?? 'h-9 min-w-9 px-2',
          size === undefined &&
            'group-data-[size=lg]/toggle-group:h-10 group-data-[size=lg]/toggle-group:min-w-10 group-data-[size=lg]/toggle-group:px-2.5 group-data-[size=sm]/toggle-group:h-8 group-data-[size=sm]/toggle-group:min-w-8 group-data-[size=sm]/toggle-group:px-1.5',
          variant === 'outline' && 'border !border-input shadow-xs hover:bg-accent hover:text-accent-foreground',
          variant === undefined &&
            'group-data-[variant=outline]/toggle-group:border group-data-[variant=outline]/toggle-group:border-input group-data-[variant=outline]/toggle-group:shadow-xs group-data-[variant=outline]/toggle-group:hover:bg-accent group-data-[variant=outline]/toggle-group:hover:text-accent-foreground',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ToggleGroup<T extends string = string>({
  className,
  testId,
  variant = 'ghost',
  size = 'md',
  ...props
}: UIProps<React.ComponentProps<typeof SDKToggleGroup<T>>> & SharedProps & PresentationProps) {
  return (
    <SDKToggleGroup<T>
      {...definedProps(props)}
      className={(state) =>
        cn(
          'group/toggle-group flex w-fit items-center gap-1',
          state.orientation === 'vertical' && 'flex-col',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ToggleIcon({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKToggleIcon>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKToggleIcon
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { Toggle, ToggleGroup, ToggleIcon };
