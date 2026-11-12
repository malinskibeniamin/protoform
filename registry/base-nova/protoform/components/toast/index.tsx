'use client';
import { Toast, ToastAction, ToastClose, ToastDescription, ToastRegion, ToastTitle, toast } from '@ui-sdk/react/toast';
import type React from 'react';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

export {
  createToaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  toast,
} from '@ui-sdk/react/toast';
export function Toaster({
  children,
  className,
  ...props
}: { children?: React.ReactNode } & Omit<React.ComponentProps<typeof ToastRegion>, 'children'>) {
  return (
    <>
      {children}
      <ToastRegion
        {...props}
        aria-label={props['aria-label'] ?? 'Notifications'}
        className={(state) =>
          cn(
            'fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:left-auto sm:w-80',
            typeof className === 'function' ? className(state) : className
          )
        }
        toaster={props.toaster ?? toast}
      >
        {() => (
          <Toast className="flex items-start gap-3 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg">
            <div className="min-w-0 flex-1">
              <ToastTitle className="font-medium wrap-break-word" />
              <ToastDescription className="text-sm wrap-break-word text-muted-foreground" />
            </div>
            <ToastAction className="text-sm font-medium" />
            <ToastClose aria-label="Dismiss notification">×</ToastClose>
          </Toast>
        )}
      </ToastRegion>
    </>
  );
}
