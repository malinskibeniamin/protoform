'use client';

import { type Toast as ToastData, toastRegion } from '@ui-sdk/core/toast';
import { usePart } from '@ui-sdk/react/primitive';
import {
  ToastDescription as ConnectedDescription,
  ToastRegion as ConnectedRegion,
  ToastTitle as ConnectedTitle,
  Toast as ConnectedToast,
  ToastAction as ConnectedToastAction,
  ToastClose as ConnectedToastClose,
  createToaster as nativeCreateToaster,
  toast as nativeToast,
} from '@ui-sdk/react/toast';
import { type ComponentProps, createContext, createElement, type ReactNode, useContext } from 'react';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const primitive = withOptionSchema(toastRegion);
const ToastItemContext = createContext<ToastData<ReactNode> | null>(null);
export const Toast = ConnectedToast;
export const ToastAction = ConnectedToastAction;
export const ToastClose = ConnectedToastClose;
export const createToaster = nativeCreateToaster;
export const toast = nativeToast;
export function ToastRegion({ children, ...props }: ComponentProps<typeof ConnectedRegion>) {
  if (children === undefined) {
    return createElement(ConnectedRegion, props);
  }
  const renderedProps: ComponentProps<typeof ConnectedRegion> = {
    ...props,
    children: (data, item) => <ToastItemContext value={data}>{children(data, item)}</ToastItemContext>,
  };
  return createElement(ConnectedRegion, renderedProps);
}
type TextProps = ComponentProps<typeof ConnectedTitle> & { slot: 'title' | 'description' };
function ToastText({ slot, ...props }: TextProps) {
  const item = useContext(ToastItemContext);
  if (item === null) {
    return createElement(slot === 'title' ? ConnectedTitle : ConnectedDescription, props);
  }
  const children = props.children ?? item[slot];
  if (children === undefined || children === null) {
    return null;
  }
  const renderedProps = { ...props, children, slot, toastId: item.id };
  return createElement(OwnedText, renderedProps);
}
function OwnedText({ slot, toastId, ...props }: TextProps & { toastId: string }) {
  return usePart(primitive, slot, { id: toastId }, props, 'div');
}
export function ToastTitle(props: ComponentProps<typeof ConnectedTitle>) {
  return createElement(ToastText, { ...props, slot: 'title' });
}
export function ToastDescription(props: ComponentProps<typeof ConnectedDescription>) {
  return createElement(ToastText, { ...props, slot: 'description' });
}
export type * from '@ui-sdk/core/toast';
