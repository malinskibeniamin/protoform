'use client';

import type React from 'react';
import { stateClassName } from '@/components/ui/shared/state-class-name';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import {
  Dialog as SDKDialog,
  DialogBackdrop as SDKDialogBackdrop,
  DialogClose as SDKDialogClose,
  DialogContent as SDKDialogContent,
  DialogDescription as SDKDialogDescription,
  DialogShortcut as SDKDialogShortcut,
  DialogTitle as SDKDialogTitle,
  DialogTrigger as SDKDialogTrigger,
} from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/core-dialog';
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
      className={stateClassName('fixed inset-0 z-50 m-0 bg-black/40 backdrop-blur-xs', className)}
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
      className={stateClassName(
        'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        className
      )}
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
      className={stateClassName(
        'fixed top-1/2 left-1/2 z-50 m-0 flex max-h-[85vh] w-full max-w-[calc(100%-2rem)] -translate-1/2 flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-lg outline-none sm:max-w-lg',
        className
      )}
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
      className={stateClassName('text-sm text-muted-foreground', className)}
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
      className={stateClassName('', className)}
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
      className={stateClassName('text-lg font-semibold', className)}
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
      className={stateClassName('', className)}
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
  return (
    <div
      {...props}
      className={cn('flex shrink-0 flex-col gap-1.5 p-4 text-center sm:text-left', className)}
      data-slot="dialog-header"
    />
  );
}

export function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div {...props} className={cn('min-h-0 flex-1 overflow-y-auto p-4', className)} data-slot="dialog-body" />;
}

export function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn('flex shrink-0 flex-col-reverse justify-end gap-2 p-4 sm:flex-row sm:items-center', className)}
      data-slot="dialog-footer"
    />
  );
}
