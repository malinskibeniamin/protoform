'use client';
import { Toast, ToastAction, ToastClose, ToastDescription, ToastRegion, ToastTitle, toast } from '@ui-sdk/react/toast';
import type React from 'react';

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
  ...props
}: { children?: React.ReactNode } & Omit<React.ComponentProps<typeof ToastRegion>, 'children'>) {
  return (
    <>
      {children}
      <ToastRegion
        {...props}
        aria-label="Notifications"
        className="fixed right-4 bottom-4 z-50 flex w-80 flex-col gap-2"
        toaster={props.toaster ?? toast}
      >
        {() => (
          <Toast className="flex items-start gap-3 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg">
            <div className="flex-1">
              <ToastTitle className="font-medium" />
              <ToastDescription className="text-sm text-muted-foreground" />
            </div>
            <ToastAction className="text-sm font-medium" />
            <ToastClose aria-label="Dismiss notification">×</ToastClose>
          </Toast>
        )}
      </ToastRegion>
    </>
  );
}
