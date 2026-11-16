'use client';

import { drawer } from '@ui-sdk/core/drawer';
import {
  Drawer as ControllerDrawer,
  DrawerOutlet as ControllerDrawerOutlet,
  DrawerTrigger as ControllerDrawerTrigger,
} from '@ui-sdk/react/drawer';
import { createParts, renderElement } from '@ui-sdk/react/primitive';
import { type ComponentProps, createElement } from 'react';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import {
  PopupContainerContext,
  PopupPortal,
  usePopupContainer,
} from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/portal';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(drawer), {
  trigger: 'button',
  backdrop: 'div',
  content: 'div',
  viewport: 'div',
  title: 'h2',
  description: 'p',
  close: 'button',
  shortcut: 'span',
  handle: 'button',
  outlet: 'div',
});
export function Drawer({ container, controller, children, ...props }: ComponentProps<typeof parts.Root>) {
  const target = usePopupContainer(container);
  const Root = controller === undefined ? parts.Root : ControllerDrawer;
  return (
    <PopupContainerContext value={target}>
      {createElement(Root, { ...props, ...definedProps({ container: target, controller }) }, children)}
    </PopupContainerContext>
  );
}
export function DrawerTrigger(props: ComponentProps<typeof ControllerDrawerTrigger>) {
  const { controller, ...local } = props;
  return controller === undefined
    ? createElement(parts.Trigger, definedProps(local))
    : createElement(ControllerDrawerTrigger, props);
}
export function DrawerBackdrop(props: ComponentProps<typeof parts.Backdrop>) {
  const target = usePopupContainer(undefined);
  return <PopupPortal container={target}>{createElement(parts.Backdrop, props)}</PopupPortal>;
}
export function DrawerContent({ container, render, ...props }: ComponentProps<typeof parts.Content>) {
  const target = usePopupContainer(container);
  const renderedProps: ComponentProps<typeof parts.Content> = {
    ...props,
    render: (elementProps, state) => {
      const content = renderElement('div', elementProps, render, state);
      return <parts.Viewport>{content}</parts.Viewport>;
    },
  };
  return <PopupPortal container={target}>{createElement(parts.Content, renderedProps)}</PopupPortal>;
}
export const DrawerHandle = parts.Handle;
export function DrawerOutlet(props: ComponentProps<typeof ControllerDrawerOutlet>) {
  const { controller, ...local } = props;
  return controller === undefined
    ? createElement(parts.Outlet, definedProps(local))
    : createElement(ControllerDrawerOutlet, props);
}
export const DrawerTitle = parts.Title;
export const DrawerDescription = parts.Description;
export const DrawerClose = parts.Close;
export function DrawerShortcut({ children, ...props }: import('react').ComponentProps<typeof parts.Shortcut>) {
  const renderedProps: ComponentProps<typeof parts.Shortcut> = {
    ...props,
    children: children ?? ((state) => state.text),
  };
  return createElement(parts.Shortcut, renderedProps);
}
export type * from '@ui-sdk/core/drawer';
