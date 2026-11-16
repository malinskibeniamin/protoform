'use client';

import { alertDialog } from '@ui-sdk/core/alert-dialog';
import {
  AlertDialog as ControllerAlertDialog,
  AlertDialogTrigger as ControllerAlertDialogTrigger,
} from '@ui-sdk/react/alert-dialog';
import { createParts } from '@ui-sdk/react/primitive';
import { type ComponentProps, createElement } from 'react';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import {
  PopupContainerContext,
  PopupPortal,
  usePopupContainer,
} from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/portal';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(alertDialog), {
  trigger: 'button',
  backdrop: 'div',
  content: 'div',
  title: 'h2',
  description: 'p',
  close: 'button',
  shortcut: 'span',
});
export function AlertDialog({ container, controller, children, ...props }: ComponentProps<typeof parts.Root>) {
  const target = usePopupContainer(container);
  const Root = controller === undefined ? parts.Root : ControllerAlertDialog;
  return (
    <PopupContainerContext value={target}>
      {createElement(Root, { ...props, ...definedProps({ container: target, controller }) }, children)}
    </PopupContainerContext>
  );
}
export function AlertDialogTrigger(props: ComponentProps<typeof ControllerAlertDialogTrigger>) {
  const { controller, ...local } = props;
  return controller === undefined
    ? createElement(parts.Trigger, definedProps(local))
    : createElement(ControllerAlertDialogTrigger, props);
}
export function AlertDialogBackdrop(props: ComponentProps<typeof parts.Backdrop>) {
  const target = usePopupContainer(undefined);
  return <PopupPortal container={target}>{createElement(parts.Backdrop, props)}</PopupPortal>;
}
export function AlertDialogContent({ container, ...props }: ComponentProps<typeof parts.Content>) {
  const target = usePopupContainer(container);
  return <PopupPortal container={target}>{createElement(parts.Content, props)}</PopupPortal>;
}
export const AlertDialogTitle = parts.Title;
export const AlertDialogDescription = parts.Description;
export const AlertDialogClose = parts.Close;
export function AlertDialogShortcut({ children, ...props }: import('react').ComponentProps<typeof parts.Shortcut>) {
  const renderedProps: ComponentProps<typeof parts.Shortcut> = {
    ...props,
    children: children ?? ((state) => state.text),
  };
  return createElement(parts.Shortcut, renderedProps);
}
export type * from '@ui-sdk/core/alert-dialog';
