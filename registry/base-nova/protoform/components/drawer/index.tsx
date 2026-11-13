'use client';

import {
  Drawer as SDKDrawer,
  DrawerBackdrop as SDKDrawerBackdrop,
  DrawerClose as SDKDrawerClose,
  DrawerContent as SDKDrawerContent,
  DrawerDescription as SDKDrawerDescription,
  DrawerHandle as SDKDrawerHandle,
  DrawerOutlet as SDKDrawerOutlet,
  DrawerShortcut as SDKDrawerShortcut,
  DrawerTitle as SDKDrawerTitle,
  DrawerTrigger as SDKDrawerTrigger,
} from '@ui-sdk/react/drawer';

import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

const Drawer = SDKDrawer;

function DrawerBackdrop({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKDrawerBackdrop>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKDrawerBackdrop
      {...definedProps(props)}
      className={(state) =>
        cn(
          'fixed inset-0 z-50 m-0 bg-black/10 backdrop-blur-xs',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function DrawerClose({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKDrawerClose>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKDrawerClose
      {...definedProps(props)}
      className={(state) =>
        cn(
          'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function DrawerContent({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKDrawerContent>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKDrawerContent
      {...definedProps(props)}
      className={(state) =>
        cn(
          'relative z-50 flex max-h-dvh min-h-0 flex-col gap-4 border-border shadow-lg outline-none',
          variant === 'sidebar' ? 'bg-sidebar p-0 text-sidebar-foreground' : 'bg-background text-foreground',
          {
            bottom: 'w-full rounded-t-xl border-t',
            top: 'w-full rounded-b-xl border-b',
            left: 'h-dvh w-3/4 border-r sm:w-96',
            right: 'h-dvh w-3/4 border-l sm:w-96',
          }[state.side],
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function DrawerDescription({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKDrawerDescription>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKDrawerDescription
      {...definedProps(props)}
      className={(state) =>
        cn('text-sm text-muted-foreground', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function DrawerHandle({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKDrawerHandle>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKDrawerHandle
      {...definedProps(props)}
      className={(state) =>
        cn('mx-auto h-1 w-10 rounded-full bg-muted', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function DrawerOutlet({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKDrawerOutlet>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKDrawerOutlet
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function DrawerShortcut({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKDrawerShortcut>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKDrawerShortcut
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function DrawerTitle({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKDrawerTitle>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKDrawerTitle
      {...definedProps(props)}
      className={(state) => cn('text-base font-medium', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function DrawerTrigger({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKDrawerTrigger>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKDrawerTrigger
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerOutlet,
  DrawerShortcut,
  DrawerTitle,
  DrawerTrigger,
};

export function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div {...props} className={cn('flex shrink-0 flex-col gap-0.5 p-4 pb-0', className)} data-slot="drawer-header" />
  );
}

export function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn('mt-auto flex shrink-0 flex-col gap-2 p-4 pt-0', className)}
      data-slot="drawer-footer"
    />
  );
}
