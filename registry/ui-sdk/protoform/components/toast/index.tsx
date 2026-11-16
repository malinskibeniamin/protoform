'use client';
import type React from 'react';
import {
  createToaster as createSDKToaster,
  Toast as SDKToast,
  ToastAction as SDKToastAction,
  ToastClose as SDKToastClose,
  ToastDescription as SDKToastDescription,
  ToastRegion as SDKToastRegion,
  ToastTitle as SDKToastTitle,
  toast as sdkToast,
} from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/core-toast';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

export const createToaster = createSDKToaster;
export const Toast = SDKToast;
export const ToastAction = SDKToastAction;
export const ToastClose = SDKToastClose;
export const ToastDescription = SDKToastDescription;
export const ToastRegion = SDKToastRegion;
export const ToastTitle = SDKToastTitle;
export const toast = sdkToast;
export function Toaster({
  children,
  className,
  ...props
}: { children?: React.ReactNode } & Omit<React.ComponentProps<typeof ToastRegion>, 'children'>) {
  return (
    <>
      {children}
      <SDKToastRegion
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
          <SDKToast className="flex items-start gap-3 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg">
            <div className="min-w-0 flex-1">
              <SDKToastTitle className="font-medium wrap-break-word" />
              <SDKToastDescription className="text-sm wrap-break-word text-muted-foreground" />
            </div>
            <SDKToastAction className="text-sm font-medium" />
            <SDKToastClose aria-label="Dismiss notification">×</SDKToastClose>
          </SDKToast>
        )}
      </SDKToastRegion>
    </>
  );
}
