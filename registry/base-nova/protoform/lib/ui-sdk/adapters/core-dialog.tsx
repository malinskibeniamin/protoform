'use client';

import { dialog } from '@ui-sdk/core/dialog';
import { Dialog as ControllerDialog, DialogTrigger as ControllerDialogTrigger } from '@ui-sdk/react/dialog';
import { createParts, renderElement } from '@ui-sdk/react/primitive';
import { type ComponentProps, createElement } from 'react';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import {
  PopupContainer,
  PopupPortal,
  usePopupContainer,
} from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/portal';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(dialog), {
  trigger: 'button',
  backdrop: 'div',
  content: 'div',
  viewport: 'div',
  title: 'h2',
  description: 'p',
  close: 'button',
  shortcut: 'span',
});
export function Dialog({ container, controller, children, ...props }: ComponentProps<typeof parts.Root>) {
  const target = usePopupContainer(container);
  const Root = controller === undefined ? parts.Root : ControllerDialog;
  return (
    <PopupContainer value={target}>
      {createElement(Root, { ...props, ...definedProps({ container: target, controller }) }, children)}
    </PopupContainer>
  );
}
export function DialogTrigger(props: ComponentProps<typeof ControllerDialogTrigger>) {
  const { controller, ...local } = props;
  return controller === undefined
    ? createElement(parts.Trigger, definedProps(local))
    : createElement(ControllerDialogTrigger, props);
}
export function DialogBackdrop(props: ComponentProps<typeof parts.Backdrop>) {
  const target = usePopupContainer(undefined);
  return <PopupPortal container={target}>{createElement(parts.Backdrop, props)}</PopupPortal>;
}
export function DialogContent({ container, render, ...props }: ComponentProps<typeof parts.Content>) {
  const target = usePopupContainer(container);
  const renderedProps: ComponentProps<typeof parts.Content> = {
    ...props,
    render: (elementProps, state) => {
      const content = renderElement('div', elementProps, render, state);
      return state.presentation === 'sheet' ? <parts.Viewport>{content}</parts.Viewport> : content;
    },
  };
  return <PopupPortal container={target}>{createElement(parts.Content, renderedProps)}</PopupPortal>;
}
export const DialogTitle = parts.Title;
export const DialogDescription = parts.Description;
export const DialogClose = parts.Close;
export function DialogShortcut({ children, ...props }: import('react').ComponentProps<typeof parts.Shortcut>) {
  const renderedProps: ComponentProps<typeof parts.Shortcut> = {
    ...props,
    children: children ?? ((state) => state.text),
  };
  return createElement(parts.Shortcut, renderedProps);
}
export type * from '@ui-sdk/core/dialog';
