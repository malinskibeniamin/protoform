import { expectTypeOf } from 'expect-type';
import type React from 'react';
import type * as codeBlockLocal from '../base-nova/protoform/components/code-block';
import type * as collapsibleLocal from '../base-nova/protoform/components/collapsible';
import type * as comboboxLocal from '../base-nova/protoform/components/combobox';
import type * as commandLocal from '../base-nova/protoform/components/command';
import type * as contextMenuLocal from '../base-nova/protoform/components/context-menu';
import type * as dialogLocal from '../base-nova/protoform/components/dialog';
import type * as directionLocal from '../base-nova/protoform/components/direction';
import type * as drawerLocal from '../base-nova/protoform/components/drawer';
import type * as dropdownMenuLocal from '../base-nova/protoform/components/dropdown-menu';
import type * as emptyLocal from '../base-nova/protoform/components/empty';
import type * as fieldLocal from '../base-nova/protoform/components/field';
import type * as hoverCardLocal from '../base-nova/protoform/components/hover-card';
import type * as inputLocal from '../base-nova/protoform/components/input';
import type * as inputGroupLocal from '../base-nova/protoform/components/input-group';
import type * as inputOtpLocal from '../base-nova/protoform/components/input-otp';
import type * as itemLocal from '../base-nova/protoform/components/item';
import type * as codeBlockOfficial from './code-block';
import type * as collapsibleOfficial from './collapsible';
import type * as comboboxOfficial from './combobox';
import type * as commandOfficial from './command';
import type * as contextMenuOfficial from './context-menu';
import type * as dialogOfficial from './dialog';
import type * as directionOfficial from './direction';
import type * as drawerOfficial from './drawer';
import type * as dropdownMenuOfficial from './dropdown-menu';
import type * as emptyOfficial from './empty';
import type * as fieldOfficial from './field';
import type * as hoverCardOfficial from './hover-card';
import type * as inputOfficial from './input';
import type * as inputGroupOfficial from './input-group';
import type * as inputOtpOfficial from './input-otp';
import type * as itemOfficial from './item';

expectTypeOf<React.ComponentProps<typeof codeBlockOfficial.CodeBlock>>().toExtend<
  React.ComponentProps<typeof codeBlockLocal.CodeBlock>
>();
expectTypeOf<React.ComponentProps<typeof codeBlockOfficial.CodeBlockActions>>().toExtend<
  React.ComponentProps<typeof codeBlockLocal.CodeBlockActions>
>();
expectTypeOf<React.ComponentProps<typeof codeBlockOfficial.CodeBlockContent>>().toExtend<
  React.ComponentProps<typeof codeBlockLocal.CodeBlockContent>
>();
expectTypeOf<React.ComponentProps<typeof codeBlockOfficial.CodeBlockCopyButton>>().toExtend<
  React.ComponentProps<typeof codeBlockLocal.CodeBlockCopyButton>
>();
expectTypeOf<React.ComponentProps<typeof codeBlockOfficial.CodeBlockFooter>>().toExtend<
  React.ComponentProps<typeof codeBlockLocal.CodeBlockFooter>
>();
expectTypeOf<React.ComponentProps<typeof codeBlockOfficial.CodeBlockHeader>>().toExtend<
  React.ComponentProps<typeof codeBlockLocal.CodeBlockHeader>
>();
expectTypeOf<React.ComponentProps<typeof codeBlockOfficial.CodeBlockLine>>().toExtend<
  React.ComponentProps<typeof codeBlockLocal.CodeBlockLine>
>();
expectTypeOf<React.ComponentProps<typeof codeBlockOfficial.CodeBlockTitle>>().toExtend<
  React.ComponentProps<typeof codeBlockLocal.CodeBlockTitle>
>();

expectTypeOf<React.ComponentProps<typeof collapsibleOfficial.Collapsible>>().toExtend<
  React.ComponentProps<typeof collapsibleLocal.Collapsible>
>();
expectTypeOf<React.ComponentProps<typeof collapsibleOfficial.CollapsibleContent>>().toExtend<
  React.ComponentProps<typeof collapsibleLocal.CollapsibleContent>
>();
expectTypeOf<React.ComponentProps<typeof collapsibleOfficial.CollapsibleTrigger>>().toExtend<
  React.ComponentProps<typeof collapsibleLocal.CollapsibleTrigger>
>();

expectTypeOf<React.ComponentProps<typeof comboboxOfficial.Combobox>>().toExtend<
  React.ComponentProps<typeof comboboxLocal.Combobox>
>();
expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxChip>>().toExtend<
  React.ComponentProps<typeof comboboxLocal.ComboboxChip>
>();
expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxChips>>().toExtend<
  React.ComponentProps<typeof comboboxLocal.ComboboxChips>
>();
expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxChipsInput>>().toExtend<
  React.ComponentProps<typeof comboboxLocal.ComboboxChipsInput>
>();
expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxCollection>>().toExtend<
  React.ComponentProps<typeof comboboxLocal.ComboboxCollection>
>();
expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxContent>>().toExtend<
  React.ComponentProps<typeof comboboxLocal.ComboboxContent>
>();
expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxEmpty>>().toExtend<
  React.ComponentProps<typeof comboboxLocal.ComboboxEmpty>
>();
expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxGroup>>().toExtend<
  React.ComponentProps<typeof comboboxLocal.ComboboxGroup>
>();
expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxInput>>().toExtend<
  React.ComponentProps<typeof comboboxLocal.ComboboxInput>
>();
expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxItem>>().toExtend<
  React.ComponentProps<typeof comboboxLocal.ComboboxItem>
>();
expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxLabel>>().toExtend<
  React.ComponentProps<typeof comboboxLocal.ComboboxLabel>
>();
expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxList>>().toExtend<
  React.ComponentProps<typeof comboboxLocal.ComboboxList>
>();
expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxSeparator>>().toExtend<
  React.ComponentProps<typeof comboboxLocal.ComboboxSeparator>
>();
expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxTrigger>>().toExtend<
  React.ComponentProps<typeof comboboxLocal.ComboboxTrigger>
>();
expectTypeOf<React.ComponentProps<typeof comboboxOfficial.ComboboxValue>>().toExtend<
  React.ComponentProps<typeof comboboxLocal.ComboboxValue>
>();
expectTypeOf<typeof comboboxLocal.useComboboxAnchor>().toExtend<typeof comboboxOfficial.useComboboxAnchor>();

expectTypeOf<React.ComponentProps<typeof commandOfficial.Command>>().toExtend<
  React.ComponentProps<typeof commandLocal.Command>
>();
expectTypeOf<React.ComponentProps<typeof commandOfficial.CommandDialog>>().toExtend<
  React.ComponentProps<typeof commandLocal.CommandDialog>
>();
expectTypeOf<React.ComponentProps<typeof commandOfficial.CommandEmpty>>().toExtend<
  React.ComponentProps<typeof commandLocal.CommandEmpty>
>();
expectTypeOf<React.ComponentProps<typeof commandOfficial.CommandGroup>>().toExtend<
  React.ComponentProps<typeof commandLocal.CommandGroup>
>();
expectTypeOf<React.ComponentProps<typeof commandOfficial.CommandInput>>().toExtend<
  React.ComponentProps<typeof commandLocal.CommandInput>
>();
expectTypeOf<React.ComponentProps<typeof commandOfficial.CommandItem>>().toExtend<
  React.ComponentProps<typeof commandLocal.CommandItem>
>();
expectTypeOf<React.ComponentProps<typeof commandOfficial.CommandList>>().toExtend<
  React.ComponentProps<typeof commandLocal.CommandList>
>();
expectTypeOf<React.ComponentProps<typeof commandOfficial.CommandSeparator>>().toExtend<
  React.ComponentProps<typeof commandLocal.CommandSeparator>
>();
expectTypeOf<React.ComponentProps<typeof commandOfficial.CommandShortcut>>().toExtend<
  React.ComponentProps<typeof commandLocal.CommandShortcut>
>();

expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenu>>().toExtend<
  React.ComponentProps<typeof contextMenuLocal.ContextMenu>
>();
expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuCheckboxItem>>().toExtend<
  React.ComponentProps<typeof contextMenuLocal.ContextMenuCheckboxItem>
>();
expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuContent>>().toExtend<
  React.ComponentProps<typeof contextMenuLocal.ContextMenuContent>
>();
expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuGroup>>().toExtend<
  React.ComponentProps<typeof contextMenuLocal.ContextMenuGroup>
>();
expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuItem>>().toExtend<
  React.ComponentProps<typeof contextMenuLocal.ContextMenuItem>
>();
expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuLabel>>().toExtend<
  React.ComponentProps<typeof contextMenuLocal.ContextMenuLabel>
>();
expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuPortal>>().toExtend<
  React.ComponentProps<typeof contextMenuLocal.ContextMenuPortal>
>();
expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuRadioGroup>>().toExtend<
  React.ComponentProps<typeof contextMenuLocal.ContextMenuRadioGroup>
>();
expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuRadioItem>>().toExtend<
  React.ComponentProps<typeof contextMenuLocal.ContextMenuRadioItem>
>();
expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuSeparator>>().toExtend<
  React.ComponentProps<typeof contextMenuLocal.ContextMenuSeparator>
>();
expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuShortcut>>().toExtend<
  React.ComponentProps<typeof contextMenuLocal.ContextMenuShortcut>
>();
expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuSub>>().toExtend<
  React.ComponentProps<typeof contextMenuLocal.ContextMenuSub>
>();
expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuSubContent>>().toExtend<
  React.ComponentProps<typeof contextMenuLocal.ContextMenuSubContent>
>();
expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuSubTrigger>>().toExtend<
  React.ComponentProps<typeof contextMenuLocal.ContextMenuSubTrigger>
>();
expectTypeOf<React.ComponentProps<typeof contextMenuOfficial.ContextMenuTrigger>>().toExtend<
  React.ComponentProps<typeof contextMenuLocal.ContextMenuTrigger>
>();

expectTypeOf<React.ComponentProps<typeof dialogOfficial.Dialog>>().toExtend<
  React.ComponentProps<typeof dialogLocal.Dialog>
>();
expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogClose>>().toExtend<
  React.ComponentProps<typeof dialogLocal.DialogClose>
>();
expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogContent>>().toExtend<
  React.ComponentProps<typeof dialogLocal.DialogContent>
>();
expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogDescription>>().toExtend<
  React.ComponentProps<typeof dialogLocal.DialogDescription>
>();
expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogFooter>>().toExtend<
  React.ComponentProps<typeof dialogLocal.DialogFooter>
>();
expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogHeader>>().toExtend<
  React.ComponentProps<typeof dialogLocal.DialogHeader>
>();
expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogOverlay>>().toExtend<
  React.ComponentProps<typeof dialogLocal.DialogOverlay>
>();
expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogPortal>>().toExtend<
  React.ComponentProps<typeof dialogLocal.DialogPortal>
>();
expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogTitle>>().toExtend<
  React.ComponentProps<typeof dialogLocal.DialogTitle>
>();
expectTypeOf<React.ComponentProps<typeof dialogOfficial.DialogTrigger>>().toExtend<
  React.ComponentProps<typeof dialogLocal.DialogTrigger>
>();

expectTypeOf<React.ComponentProps<typeof directionOfficial.DirectionProvider>>().toExtend<
  React.ComponentProps<typeof directionLocal.DirectionProvider>
>();
expectTypeOf<typeof directionLocal.useDirection>().toExtend<typeof directionOfficial.useDirection>();

expectTypeOf<React.ComponentProps<typeof drawerOfficial.Drawer>>().toExtend<
  React.ComponentProps<typeof drawerLocal.Drawer>
>();
expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerClose>>().toExtend<
  React.ComponentProps<typeof drawerLocal.DrawerClose>
>();
expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerContent>>().toExtend<
  React.ComponentProps<typeof drawerLocal.DrawerContent>
>();
expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerDescription>>().toExtend<
  React.ComponentProps<typeof drawerLocal.DrawerDescription>
>();
expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerFooter>>().toExtend<
  React.ComponentProps<typeof drawerLocal.DrawerFooter>
>();
expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerHeader>>().toExtend<
  React.ComponentProps<typeof drawerLocal.DrawerHeader>
>();
expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerOverlay>>().toExtend<
  React.ComponentProps<typeof drawerLocal.DrawerOverlay>
>();
expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerPortal>>().toExtend<
  React.ComponentProps<typeof drawerLocal.DrawerPortal>
>();
expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerSwipeHandle>>().toExtend<
  React.ComponentProps<typeof drawerLocal.DrawerSwipeHandle>
>();
expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerTitle>>().toExtend<
  React.ComponentProps<typeof drawerLocal.DrawerTitle>
>();
expectTypeOf<React.ComponentProps<typeof drawerOfficial.DrawerTrigger>>().toExtend<
  React.ComponentProps<typeof drawerLocal.DrawerTrigger>
>();

expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenu>>().toExtend<
  React.ComponentProps<typeof dropdownMenuLocal.DropdownMenu>
>();
expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuCheckboxItem>>().toExtend<
  React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuCheckboxItem>
>();
expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuContent>>().toExtend<
  React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuContent>
>();
expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuGroup>>().toExtend<
  React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuGroup>
>();
expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuItem>>().toExtend<
  React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuItem>
>();
expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuLabel>>().toExtend<
  React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuLabel>
>();
expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuPortal>>().toExtend<
  React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuPortal>
>();
expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuRadioGroup>>().toExtend<
  React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuRadioGroup>
>();
expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuRadioItem>>().toExtend<
  React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuRadioItem>
>();
expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuSeparator>>().toExtend<
  React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuSeparator>
>();
expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuShortcut>>().toExtend<
  React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuShortcut>
>();
expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuSub>>().toExtend<
  React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuSub>
>();
expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuSubContent>>().toExtend<
  React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuSubContent>
>();
expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuSubTrigger>>().toExtend<
  React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuSubTrigger>
>();
expectTypeOf<React.ComponentProps<typeof dropdownMenuOfficial.DropdownMenuTrigger>>().toExtend<
  React.ComponentProps<typeof dropdownMenuLocal.DropdownMenuTrigger>
>();

expectTypeOf<React.ComponentProps<typeof emptyOfficial.Empty>>().toExtend<
  React.ComponentProps<typeof emptyLocal.Empty>
>();
expectTypeOf<React.ComponentProps<typeof emptyOfficial.EmptyContent>>().toExtend<
  React.ComponentProps<typeof emptyLocal.EmptyContent>
>();
expectTypeOf<React.ComponentProps<typeof emptyOfficial.EmptyDescription>>().toExtend<
  React.ComponentProps<typeof emptyLocal.EmptyDescription>
>();
expectTypeOf<React.ComponentProps<typeof emptyOfficial.EmptyHeader>>().toExtend<
  React.ComponentProps<typeof emptyLocal.EmptyHeader>
>();
expectTypeOf<React.ComponentProps<typeof emptyOfficial.EmptyMedia>>().toExtend<
  React.ComponentProps<typeof emptyLocal.EmptyMedia>
>();
expectTypeOf<React.ComponentProps<typeof emptyOfficial.EmptyTitle>>().toExtend<
  React.ComponentProps<typeof emptyLocal.EmptyTitle>
>();

expectTypeOf<React.ComponentProps<typeof fieldOfficial.Field>>().toExtend<
  React.ComponentProps<typeof fieldLocal.Field>
>();
expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldContent>>().toExtend<
  React.ComponentProps<typeof fieldLocal.FieldContent>
>();
expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldDescription>>().toExtend<
  React.ComponentProps<typeof fieldLocal.FieldDescription>
>();
expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldError>>().toExtend<
  React.ComponentProps<typeof fieldLocal.FieldError>
>();
expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldGroup>>().toExtend<
  React.ComponentProps<typeof fieldLocal.FieldGroup>
>();
expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldLabel>>().toExtend<
  React.ComponentProps<typeof fieldLocal.FieldLabel>
>();
expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldLegend>>().toExtend<
  React.ComponentProps<typeof fieldLocal.FieldLegend>
>();
expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldSeparator>>().toExtend<
  React.ComponentProps<typeof fieldLocal.FieldSeparator>
>();
expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldSet>>().toExtend<
  React.ComponentProps<typeof fieldLocal.FieldSet>
>();
expectTypeOf<React.ComponentProps<typeof fieldOfficial.FieldTitle>>().toExtend<
  React.ComponentProps<typeof fieldLocal.FieldTitle>
>();

expectTypeOf<React.ComponentProps<typeof hoverCardOfficial.HoverCard>>().toExtend<
  React.ComponentProps<typeof hoverCardLocal.HoverCard>
>();
expectTypeOf<React.ComponentProps<typeof hoverCardOfficial.HoverCardContent>>().toExtend<
  React.ComponentProps<typeof hoverCardLocal.HoverCardContent>
>();
expectTypeOf<React.ComponentProps<typeof hoverCardOfficial.HoverCardTrigger>>().toExtend<
  React.ComponentProps<typeof hoverCardLocal.HoverCardTrigger>
>();

expectTypeOf<React.ComponentProps<typeof inputOfficial.Input>>().toExtend<
  React.ComponentProps<typeof inputLocal.Input>
>();

expectTypeOf<React.ComponentProps<typeof inputGroupOfficial.InputGroup>>().toExtend<
  React.ComponentProps<typeof inputGroupLocal.InputGroup>
>();
expectTypeOf<React.ComponentProps<typeof inputGroupOfficial.InputGroupAddon>>().toExtend<
  React.ComponentProps<typeof inputGroupLocal.InputGroupAddon>
>();
expectTypeOf<React.ComponentProps<typeof inputGroupOfficial.InputGroupButton>>().toExtend<
  React.ComponentProps<typeof inputGroupLocal.InputGroupButton>
>();
expectTypeOf<React.ComponentProps<typeof inputGroupOfficial.InputGroupInput>>().toExtend<
  React.ComponentProps<typeof inputGroupLocal.InputGroupInput>
>();
expectTypeOf<React.ComponentProps<typeof inputGroupOfficial.InputGroupText>>().toExtend<
  React.ComponentProps<typeof inputGroupLocal.InputGroupText>
>();
expectTypeOf<React.ComponentProps<typeof inputGroupOfficial.InputGroupTextarea>>().toExtend<
  React.ComponentProps<typeof inputGroupLocal.InputGroupTextarea>
>();

expectTypeOf<React.ComponentProps<typeof inputOtpOfficial.InputOTP>>().toExtend<
  React.ComponentProps<typeof inputOtpLocal.InputOTP>
>();
expectTypeOf<React.ComponentProps<typeof inputOtpOfficial.InputOTPGroup>>().toExtend<
  React.ComponentProps<typeof inputOtpLocal.InputOTPGroup>
>();
expectTypeOf<React.ComponentProps<typeof inputOtpOfficial.InputOTPSeparator>>().toExtend<
  React.ComponentProps<typeof inputOtpLocal.InputOTPSeparator>
>();
expectTypeOf<React.ComponentProps<typeof inputOtpOfficial.InputOTPSlot>>().toExtend<
  React.ComponentProps<typeof inputOtpLocal.InputOTPSlot>
>();

expectTypeOf<React.ComponentProps<typeof itemOfficial.Item>>().toExtend<React.ComponentProps<typeof itemLocal.Item>>();
expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemActions>>().toExtend<
  React.ComponentProps<typeof itemLocal.ItemActions>
>();
expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemContent>>().toExtend<
  React.ComponentProps<typeof itemLocal.ItemContent>
>();
expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemDescription>>().toExtend<
  React.ComponentProps<typeof itemLocal.ItemDescription>
>();
expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemFooter>>().toExtend<
  React.ComponentProps<typeof itemLocal.ItemFooter>
>();
expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemGroup>>().toExtend<
  React.ComponentProps<typeof itemLocal.ItemGroup>
>();
expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemHeader>>().toExtend<
  React.ComponentProps<typeof itemLocal.ItemHeader>
>();
expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemMedia>>().toExtend<
  React.ComponentProps<typeof itemLocal.ItemMedia>
>();
expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemSeparator>>().toExtend<
  React.ComponentProps<typeof itemLocal.ItemSeparator>
>();
expectTypeOf<React.ComponentProps<typeof itemOfficial.ItemTitle>>().toExtend<
  React.ComponentProps<typeof itemLocal.ItemTitle>
>();
