import { Toast as ToastPrimitive } from '@base-ui/react/toast';
import type * as React from 'react';

declare const toast: ReturnType<typeof ToastPrimitive.createToastManager>;
declare function ToastProvider({ ...props }: ToastPrimitive.Provider.Props): React.JSX.Element;
declare function ToastPortal({ ...props }: ToastPrimitive.Portal.Props): React.JSX.Element;
declare function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props): React.JSX.Element;
declare function Toast({ className, ...props }: ToastPrimitive.Root.Props): React.JSX.Element;
declare function ToastContent({ className, ...props }: ToastPrimitive.Content.Props): React.JSX.Element;
declare function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props): React.JSX.Element;
declare function ToastDescription({ className, ...props }: ToastPrimitive.Description.Props): React.JSX.Element;
declare function ToastAction({ className, render, ...props }: ToastPrimitive.Action.Props): React.JSX.Element;
declare function ToastClose({ className, children, render, ...props }: ToastPrimitive.Close.Props): React.JSX.Element;
declare function Toaster({ children, toastManager, ...props }: ToastPrimitive.Provider.Props): React.JSX.Element;
declare const createToastManager: typeof ToastPrimitive.createToastManager;
declare const useToastManager: typeof ToastPrimitive.useToastManager;

export {
  createToastManager,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  Toaster,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toast,
  useToastManager,
};
