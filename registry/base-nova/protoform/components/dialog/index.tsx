'use client';

import {
  Dialog as SDKDialog,
  DialogBackdrop as SDKDialogBackdrop,
  DialogClose as SDKDialogClose,
  DialogContent as SDKDialogContent,
  DialogDescription as SDKDialogDescription,
  DialogShortcut as SDKDialogShortcut,
  DialogTitle as SDKDialogTitle,
  DialogTrigger as SDKDialogTrigger,
} from '@ui-sdk/react/dialog';

import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

const Dialog = SDKDialog;

function DialogBackdrop({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKDialogBackdrop>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKDialogBackdrop
      {...definedProps(props)}
      className={(state) =>
        cn('fixed inset-0 z-50 bg-foreground/50', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function DialogClose({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKDialogClose>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKDialogClose
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

function DialogContent({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKDialogContent>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKDialogContent
      {...definedProps(props)}
      className={(state) =>
        cn(
          'fixed top-1/2 left-1/2 z-50 grid max-h-screen w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-auto rounded-xl border border-border bg-background p-6 text-foreground shadow-lg outline-none',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function DialogDescription({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKDialogDescription>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKDialogDescription
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

function DialogShortcut({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKDialogShortcut>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKDialogShortcut
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function DialogTitle({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKDialogTitle>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKDialogTitle
      {...definedProps(props)}
      className={(state) => cn('text-lg font-semibold', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function DialogTrigger({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKDialogTrigger>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKDialogTrigger
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogShortcut,
  DialogTitle,
  DialogTrigger,
};

export function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div {...props} className={cn('flex flex-col gap-2', className)} data-slot="dialog-header" />;
}

export function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div {...props} className={cn('flex flex-col gap-2', className)} data-slot="dialog-body" />;
}

export function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div {...props} className={cn('flex flex-col gap-2', className)} data-slot="dialog-footer" />;
}
