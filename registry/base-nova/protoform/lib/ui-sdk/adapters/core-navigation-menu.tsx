'use client';

import { navigationMenu } from '@ui-sdk/core/navigation-menu';
import {
  NavigationMenuContent as ConnectedContent,
  NavigationMenuItem as ConnectedItem,
  NavigationMenu as ConnectedRoot,
  type NavigationMenuViewport as NativeViewport,
} from '@ui-sdk/react/navigation-menu';
import { createParts } from '@ui-sdk/react/primitive';
import { type ComponentProps, createElement } from 'react';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import {
  PopupContainerContext,
  PopupPortal,
  usePopupContainer,
} from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/portal';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const parts = createParts(withOptionSchema(navigationMenu), {
  list: 'ul',
  trigger: 'button',
  link: 'a',
  'link-icon': 'span',
  indicator: 'div',
  viewport: 'div',
});
export function NavigationMenu<T extends string = string>(props: ComponentProps<typeof ConnectedRoot<T>>) {
  const target = usePopupContainer(props.container);
  return (
    <PopupContainerContext value={target}>
      {createElement(ConnectedRoot<T>, { ...props, container: target })}
    </PopupContainerContext>
  );
}
export const NavigationMenuContent = ConnectedContent;
export const NavigationMenuItem = ConnectedItem;
export function NavigationMenuViewport({ container, ...props }: ComponentProps<typeof NativeViewport>) {
  const target = usePopupContainer(container);
  return <PopupPortal container={target}>{createElement(parts.Viewport, definedProps(props))}</PopupPortal>;
}
export const NavigationMenuList = parts.List;
export const NavigationMenuTrigger = parts.Trigger;
export const NavigationMenuLink = parts.Link;
export const NavigationMenuLinkIcon = parts.LinkIcon;
export const NavigationMenuIndicator = parts.Indicator;
export type * from '@ui-sdk/core/navigation-menu';
