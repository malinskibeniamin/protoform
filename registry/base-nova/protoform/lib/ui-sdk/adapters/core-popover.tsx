'use client';

import { popover } from '@ui-sdk/core/popover';
import { Popover as ControllerPopover, PopoverTrigger as ControllerPopoverTrigger } from '@ui-sdk/react/popover';
import { createParts, renderElement } from '@ui-sdk/react/primitive';
import { type ComponentProps, createElement } from 'react';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import {
  PopupContainerContext,
  PopupPortal,
  usePopupContainer,
} from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/portal';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(popover), {
  trigger: 'button',
  content: 'div',
  viewport: 'div',
  title: 'h2',
  description: 'p',
  close: 'button',
  arrow: 'div',
  shortcut: 'span',
});
export function Popover({ container, controller, children, ...props }: ComponentProps<typeof parts.Root>) {
  const target = usePopupContainer(container);
  const Root = controller === undefined ? parts.Root : ControllerPopover;
  return (
    <PopupContainerContext value={target}>
      {createElement(Root, { ...props, ...definedProps({ container: target, controller }) }, children)}
    </PopupContainerContext>
  );
}
export function PopoverTrigger(props: ComponentProps<typeof ControllerPopoverTrigger>) {
  const { controller, ...local } = props;
  return controller === undefined
    ? createElement(parts.Trigger, definedProps(local))
    : createElement(ControllerPopoverTrigger, props);
}
export function PopoverContent({ container, render, ...props }: ComponentProps<typeof parts.Content>) {
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
export const PopoverTitle = parts.Title;
export const PopoverDescription = parts.Description;
export const PopoverClose = parts.Close;
export const PopoverArrow = parts.Arrow;
export function PopoverShortcut({ children, ...props }: import('react').ComponentProps<typeof parts.Shortcut>) {
  const renderedProps: ComponentProps<typeof parts.Shortcut> = {
    ...props,
    children: children ?? ((state) => state.text),
  };
  return createElement(parts.Shortcut, renderedProps);
}
export type * from '@ui-sdk/core/popover';
