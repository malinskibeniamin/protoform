'use client';

import {
  AlertDialog as SDKAlertDialog,
  AlertDialogBackdrop as SDKAlertDialogBackdrop,
  AlertDialogClose as SDKAlertDialogClose,
  AlertDialogContent as SDKAlertDialogContent,
  AlertDialogDescription as SDKAlertDialogDescription,
  AlertDialogShortcut as SDKAlertDialogShortcut,
  AlertDialogTitle as SDKAlertDialogTitle,
  AlertDialogTrigger as SDKAlertDialogTrigger,
} from '@ui-sdk/react/alert-dialog';

import type React from 'react';
import { buttonVariants } from '@/components/ui/button/index';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

const AlertDialog = SDKAlertDialog;

function AlertDialogBackdrop({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKAlertDialogBackdrop>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKAlertDialogBackdrop
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

function AlertDialogClose({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKAlertDialogClose>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKAlertDialogClose
      {...definedProps(props)}
      className={(state) =>
        cn(
          buttonVariants({ variant: variant === 'destructive' ? 'destructive' : 'outline' }),
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function AlertDialogContent({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKAlertDialogContent>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKAlertDialogContent
      {...definedProps(props)}
      className={(state) =>
        cn(
          'fixed top-1/2 left-1/2 z-50 m-0 grid max-h-[85vh] w-full max-w-[calc(100%-2rem)] max-w-xs -translate-1/2 gap-4 overflow-auto rounded-xl border border-border bg-background p-4 text-foreground shadow-lg outline-none sm:max-w-sm',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function AlertDialogDescription({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKAlertDialogDescription>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKAlertDialogDescription
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

function AlertDialogShortcut({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKAlertDialogShortcut>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKAlertDialogShortcut
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function AlertDialogTitle({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKAlertDialogTitle>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKAlertDialogTitle
      {...definedProps(props)}
      className={(state) => cn('text-base font-medium', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function AlertDialogTrigger({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKAlertDialogTrigger>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKAlertDialogTrigger
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogShortcut,
  AlertDialogTitle,
  AlertDialogTrigger,
};

export function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn('flex flex-col gap-1.5 text-center sm:text-left', className)}
      data-slot="alert-dialog-header"
    />
  );
}

export function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn(
        '-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end',
        className
      )}
      data-slot="alert-dialog-footer"
    />
  );
}
