import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { Menubar as MenubarPrimitive } from '@base-ui/react/menubar';
import type * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';

declare function Menubar({ className, ...props }: MenubarPrimitive.Props): React.JSX.Element;
declare function MenubarMenu({ ...props }: React.ComponentProps<typeof DropdownMenu>): React.JSX.Element;
declare function MenubarGroup({ ...props }: React.ComponentProps<typeof DropdownMenuGroup>): React.JSX.Element;
declare function MenubarPortal({ ...props }: React.ComponentProps<typeof DropdownMenuPortal>): React.JSX.Element;
declare function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuTrigger>): React.JSX.Element;
declare function MenubarContent({
  className,
  align,
  alignOffset,
  sideOffset,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>): React.JSX.Element;
declare function MenubarItem({
  className,
  inset,
  variant,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>): React.JSX.Element;
declare function MenubarCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean;
}): React.JSX.Element;
declare function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuRadioGroup>): React.JSX.Element;
declare function MenubarRadioItem({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean;
}): React.JSX.Element;
declare function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuLabel> & {
  inset?: boolean;
}): React.JSX.Element;
declare function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>): React.JSX.Element;
declare function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuShortcut>): React.JSX.Element;
declare function MenubarSub({ ...props }: React.ComponentProps<typeof DropdownMenuSub>): React.JSX.Element;
declare function MenubarSubTrigger({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubTrigger> & {
  inset?: boolean;
}): React.JSX.Element;
declare function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubContent>): React.JSX.Element;

export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
};
