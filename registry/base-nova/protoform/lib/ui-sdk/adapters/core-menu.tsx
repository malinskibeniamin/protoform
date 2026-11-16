'use client';

import { matchesShortcut } from '@ui-sdk/core';
import { menu } from '@ui-sdk/core/menu';
import { withSource } from '@ui-sdk/core/observe';
import {
  MenuGroupLabel as ConnectedGroupLabel,
  Menu as ConnectedMenu,
  MenuTrigger as ControllerTrigger,
  MenuCheckboxItem as RetainedMenuCheckboxItem,
  MenuContent as RetainedMenuContent,
  MenuContextTrigger as RetainedMenuContextTrigger,
  MenuItemIcon as RetainedMenuItemIcon,
  MenuItemIndicator as RetainedMenuItemIndicator,
  MenuItems as RetainedMenuItems,
  MenuRadioGroup as RetainedMenuRadioGroup,
  MenuRadioItem as RetainedMenuRadioItem,
  MenuSub as RetainedMenuSub,
  MenuSubContent as RetainedMenuSubContent,
  MenuSubTrigger as RetainedMenuSubTrigger,
} from '@ui-sdk/react/menu';
import { createParts, usePart } from '@ui-sdk/react/primitive';
import { type ComponentProps, createContext, createElement, useContext, useId } from 'react';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { PopupContainerContext, usePopupContainer } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/portal';
import { withOptionSchema } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/primitive-schema';

const primitive = withOptionSchema(menu);
const parts = createParts(primitive, { trigger: 'button', item: 'div', separator: 'div', shortcut: 'span' });
const GroupIdContext = createContext<string | null>(null);
export function Menu({ container, children, ...props }: ComponentProps<typeof ConnectedMenu>) {
  const target = usePopupContainer(container);
  return (
    <PopupContainerContext value={target}>
      {createElement(ConnectedMenu, { ...props, container: target }, children)}
    </PopupContainerContext>
  );
}
export function MenuTrigger({ controller, ...props }: ComponentProps<typeof ControllerTrigger>) {
  return controller === undefined
    ? createElement(parts.Trigger, definedProps(props))
    : createElement(ControllerTrigger, { ...props, controller });
}
export const MenuItem = parts.Item;
export const MenuSeparator = parts.Separator;
export const MenuShortcut = parts.Shortcut;
export function MenuGroup(props: ComponentProps<typeof import('@ui-sdk/react/menu').MenuGroup>) {
  const id = useId();
  const group = usePart(primitive, 'group', { id }, props, 'div');
  return <GroupIdContext value={id}>{group}</GroupIdContext>;
}
export function MenuGroupLabel(props: ComponentProps<typeof ConnectedGroupLabel>) {
  const group = useContext(GroupIdContext);
  return group === null
    ? createElement(ConnectedGroupLabel, props)
    : createElement(OwnedGroupLabel, { ...props, group });
}
function OwnedGroupLabel({ group, ...props }: ComponentProps<typeof ConnectedGroupLabel> & { group: string }) {
  return usePart(primitive, 'group-label', { group, id: group }, props, 'div');
}

export type * from '@ui-sdk/core/menu';

export const MenuCheckboxItem = RetainedMenuCheckboxItem;
export const MenuContent = RetainedMenuContent;
export function MenuContextTrigger(props: ComponentProps<typeof RetainedMenuContextTrigger>) {
  const renderedProps: ComponentProps<typeof RetainedMenuContextTrigger> = {
    ...props,
    onKeyDown: (event) => {
      props.onKeyDown?.(event);
      if (props.disabled || event.defaultPrevented) {
        return;
      }
      if (!(matchesShortcut(event.nativeEvent, 'shift+f10') || matchesShortcut(event.nativeEvent, 'contextmenu'))) {
        return;
      }
      event.preventDefault();
      const target = event.currentTarget;
      const box = target.getBoundingClientRect();
      return withSource('keyboard', () =>
        target.dispatchEvent(
          new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            button: 0,
            clientX: box.left,
            clientY: box.bottom,
            view: target.ownerDocument.defaultView,
          })
        )
      );
    },
  };
  return createElement(RetainedMenuContextTrigger, renderedProps);
}
export const MenuItemIcon = RetainedMenuItemIcon;
export const MenuItemIndicator = RetainedMenuItemIndicator;
export const MenuItems = RetainedMenuItems;
export const MenuRadioGroup = RetainedMenuRadioGroup;
export const MenuRadioItem = RetainedMenuRadioItem;
export const MenuSub = RetainedMenuSub;
export const MenuSubContent = RetainedMenuSubContent;
export const MenuSubTrigger = RetainedMenuSubTrigger;
