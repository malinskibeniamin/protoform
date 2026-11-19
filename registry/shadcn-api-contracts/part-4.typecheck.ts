import { expectTypeOf } from 'expect-type';
import type React from 'react';
import type * as separatorLocal from '../base-nova/protoform/components/separator';
import type * as sheetLocal from '../base-nova/protoform/components/sheet';
import type * as sidebarLocal from '../base-nova/protoform/components/sidebar';
import type * as skeletonLocal from '../base-nova/protoform/components/skeleton';
import type * as sliderLocal from '../base-nova/protoform/components/slider';
import type * as spinnerLocal from '../base-nova/protoform/components/spinner';
import type * as switchLocal from '../base-nova/protoform/components/switch';
import type * as tableLocal from '../base-nova/protoform/components/table';
import type * as tabsLocal from '../base-nova/protoform/components/tabs';
import type * as textareaLocal from '../base-nova/protoform/components/textarea';
import type * as toastLocal from '../base-nova/protoform/components/toast';
import type * as toggleLocal from '../base-nova/protoform/components/toggle';
import type * as toggleGroupLocal from '../base-nova/protoform/components/toggle-group';
import type * as tooltipLocal from '../base-nova/protoform/components/tooltip';
import type * as traceLocal from '../base-nova/protoform/components/trace';
import type * as separatorOfficial from './separator';
import type * as sheetOfficial from './sheet';
import type * as sidebarOfficial from './sidebar';
import type * as skeletonOfficial from './skeleton';
import type * as sliderOfficial from './slider';
import type * as spinnerOfficial from './spinner';
import type * as switchOfficial from './switch';
import type * as tableOfficial from './table';
import type * as tabsOfficial from './tabs';
import type * as textareaOfficial from './textarea';
import type * as toastOfficial from './toast';
import type * as toggleOfficial from './toggle';
import type * as toggleGroupOfficial from './toggle-group';
import type * as tooltipOfficial from './tooltip';
import type * as traceOfficial from './trace';

expectTypeOf<React.ComponentProps<typeof separatorOfficial.Separator>>().toExtend<
  React.ComponentProps<typeof separatorLocal.Separator>
>();

expectTypeOf<React.ComponentProps<typeof sheetOfficial.Sheet>>().toExtend<
  React.ComponentProps<typeof sheetLocal.Sheet>
>();
expectTypeOf<React.ComponentProps<typeof sheetOfficial.SheetClose>>().toExtend<
  React.ComponentProps<typeof sheetLocal.SheetClose>
>();
expectTypeOf<React.ComponentProps<typeof sheetOfficial.SheetContent>>().toExtend<
  React.ComponentProps<typeof sheetLocal.SheetContent>
>();
expectTypeOf<React.ComponentProps<typeof sheetOfficial.SheetDescription>>().toExtend<
  React.ComponentProps<typeof sheetLocal.SheetDescription>
>();
expectTypeOf<React.ComponentProps<typeof sheetOfficial.SheetFooter>>().toExtend<
  React.ComponentProps<typeof sheetLocal.SheetFooter>
>();
expectTypeOf<React.ComponentProps<typeof sheetOfficial.SheetHeader>>().toExtend<
  React.ComponentProps<typeof sheetLocal.SheetHeader>
>();
expectTypeOf<React.ComponentProps<typeof sheetOfficial.SheetTitle>>().toExtend<
  React.ComponentProps<typeof sheetLocal.SheetTitle>
>();
expectTypeOf<React.ComponentProps<typeof sheetOfficial.SheetTrigger>>().toExtend<
  React.ComponentProps<typeof sheetLocal.SheetTrigger>
>();

expectTypeOf<React.ComponentProps<typeof sidebarOfficial.Sidebar>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.Sidebar>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarContent>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarContent>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarFooter>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarFooter>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarGroup>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarGroup>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarGroupAction>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarGroupAction>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarGroupContent>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarGroupContent>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarGroupLabel>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarGroupLabel>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarHeader>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarHeader>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarInput>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarInput>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarInset>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarInset>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenu>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarMenu>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenuAction>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarMenuAction>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenuBadge>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarMenuBadge>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenuButton>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarMenuButton>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenuItem>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarMenuItem>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenuSkeleton>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarMenuSkeleton>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenuSub>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarMenuSub>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenuSubButton>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarMenuSubButton>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarMenuSubItem>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarMenuSubItem>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarProvider>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarProvider>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarRail>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarRail>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarSeparator>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarSeparator>
>();
expectTypeOf<React.ComponentProps<typeof sidebarOfficial.SidebarTrigger>>().toExtend<
  React.ComponentProps<typeof sidebarLocal.SidebarTrigger>
>();
expectTypeOf<typeof sidebarLocal.useSidebar>().toExtend<typeof sidebarOfficial.useSidebar>();

expectTypeOf<React.ComponentProps<typeof skeletonOfficial.Skeleton>>().toExtend<
  React.ComponentProps<typeof skeletonLocal.Skeleton>
>();

expectTypeOf<React.ComponentProps<typeof sliderOfficial.Slider>>().toExtend<
  React.ComponentProps<typeof sliderLocal.Slider>
>();

expectTypeOf<React.ComponentProps<typeof spinnerOfficial.Spinner>>().toExtend<
  React.ComponentProps<typeof spinnerLocal.Spinner>
>();

expectTypeOf<React.ComponentProps<typeof switchOfficial.Switch>>().toExtend<
  React.ComponentProps<typeof switchLocal.Switch>
>();

expectTypeOf<React.ComponentProps<typeof tableOfficial.Table>>().toExtend<
  React.ComponentProps<typeof tableLocal.Table>
>();
expectTypeOf<React.ComponentProps<typeof tableOfficial.TableBody>>().toExtend<
  React.ComponentProps<typeof tableLocal.TableBody>
>();
expectTypeOf<React.ComponentProps<typeof tableOfficial.TableCaption>>().toExtend<
  React.ComponentProps<typeof tableLocal.TableCaption>
>();
expectTypeOf<React.ComponentProps<typeof tableOfficial.TableCell>>().toExtend<
  React.ComponentProps<typeof tableLocal.TableCell>
>();
expectTypeOf<React.ComponentProps<typeof tableOfficial.TableFooter>>().toExtend<
  React.ComponentProps<typeof tableLocal.TableFooter>
>();
expectTypeOf<React.ComponentProps<typeof tableOfficial.TableHead>>().toExtend<
  React.ComponentProps<typeof tableLocal.TableHead>
>();
expectTypeOf<React.ComponentProps<typeof tableOfficial.TableHeader>>().toExtend<
  React.ComponentProps<typeof tableLocal.TableHeader>
>();
expectTypeOf<React.ComponentProps<typeof tableOfficial.TableRow>>().toExtend<
  React.ComponentProps<typeof tableLocal.TableRow>
>();

expectTypeOf<React.ComponentProps<typeof tabsOfficial.Tabs>>().toExtend<React.ComponentProps<typeof tabsLocal.Tabs>>();
expectTypeOf<React.ComponentProps<typeof tabsOfficial.TabsContent>>().toExtend<
  React.ComponentProps<typeof tabsLocal.TabsContent>
>();
expectTypeOf<React.ComponentProps<typeof tabsOfficial.TabsList>>().toExtend<
  React.ComponentProps<typeof tabsLocal.TabsList>
>();
expectTypeOf<React.ComponentProps<typeof tabsOfficial.TabsTrigger>>().toExtend<
  React.ComponentProps<typeof tabsLocal.TabsTrigger>
>();
expectTypeOf<typeof tabsLocal.tabsListVariants>().toExtend<typeof tabsOfficial.tabsListVariants>();

expectTypeOf<React.ComponentProps<typeof textareaOfficial.Textarea>>().toExtend<
  React.ComponentProps<typeof textareaLocal.Textarea>
>();

expectTypeOf<typeof toastLocal.createToastManager>().toExtend<typeof toastOfficial.createToastManager>();
expectTypeOf<React.ComponentProps<typeof toastOfficial.Toast>>().toExtend<
  React.ComponentProps<typeof toastLocal.Toast>
>();
expectTypeOf<React.ComponentProps<typeof toastOfficial.ToastAction>>().toExtend<
  React.ComponentProps<typeof toastLocal.ToastAction>
>();
expectTypeOf<React.ComponentProps<typeof toastOfficial.ToastClose>>().toExtend<
  React.ComponentProps<typeof toastLocal.ToastClose>
>();
expectTypeOf<React.ComponentProps<typeof toastOfficial.ToastContent>>().toExtend<
  React.ComponentProps<typeof toastLocal.ToastContent>
>();
expectTypeOf<React.ComponentProps<typeof toastOfficial.ToastDescription>>().toExtend<
  React.ComponentProps<typeof toastLocal.ToastDescription>
>();
expectTypeOf<React.ComponentProps<typeof toastOfficial.Toaster>>().toExtend<
  React.ComponentProps<typeof toastLocal.Toaster>
>();
expectTypeOf<React.ComponentProps<typeof toastOfficial.ToastPortal>>().toExtend<
  React.ComponentProps<typeof toastLocal.ToastPortal>
>();
expectTypeOf<React.ComponentProps<typeof toastOfficial.ToastProvider>>().toExtend<
  React.ComponentProps<typeof toastLocal.ToastProvider>
>();
expectTypeOf<React.ComponentProps<typeof toastOfficial.ToastTitle>>().toExtend<
  React.ComponentProps<typeof toastLocal.ToastTitle>
>();
expectTypeOf<React.ComponentProps<typeof toastOfficial.ToastViewport>>().toExtend<
  React.ComponentProps<typeof toastLocal.ToastViewport>
>();
expectTypeOf<typeof toastLocal.toast>().toExtend<typeof toastOfficial.toast>();
expectTypeOf<typeof toastLocal.useToastManager>().toExtend<typeof toastOfficial.useToastManager>();

expectTypeOf<React.ComponentProps<typeof toggleOfficial.Toggle>>().toExtend<
  React.ComponentProps<typeof toggleLocal.Toggle>
>();
expectTypeOf<typeof toggleLocal.toggleVariants>().toExtend<typeof toggleOfficial.toggleVariants>();

expectTypeOf<React.ComponentProps<typeof toggleGroupOfficial.ToggleGroup>>().toExtend<
  React.ComponentProps<typeof toggleGroupLocal.ToggleGroup>
>();
expectTypeOf<React.ComponentProps<typeof toggleGroupOfficial.ToggleGroupItem>>().toExtend<
  React.ComponentProps<typeof toggleGroupLocal.ToggleGroupItem>
>();

expectTypeOf<React.ComponentProps<typeof tooltipOfficial.Tooltip>>().toExtend<
  React.ComponentProps<typeof tooltipLocal.Tooltip>
>();
expectTypeOf<React.ComponentProps<typeof tooltipOfficial.TooltipContent>>().toExtend<
  React.ComponentProps<typeof tooltipLocal.TooltipContent>
>();
expectTypeOf<React.ComponentProps<typeof tooltipOfficial.TooltipProvider>>().toExtend<
  React.ComponentProps<typeof tooltipLocal.TooltipProvider>
>();
expectTypeOf<React.ComponentProps<typeof tooltipOfficial.TooltipTrigger>>().toExtend<
  React.ComponentProps<typeof tooltipLocal.TooltipTrigger>
>();

expectTypeOf<React.ComponentProps<typeof traceOfficial.Trace>>().toExtend<
  React.ComponentProps<typeof traceLocal.Trace>
>();
expectTypeOf<React.ComponentProps<typeof traceOfficial.TraceCollapsible>>().toExtend<
  React.ComponentProps<typeof traceLocal.TraceCollapsible>
>();
expectTypeOf<React.ComponentProps<typeof traceOfficial.TraceCollapsibleContent>>().toExtend<
  React.ComponentProps<typeof traceLocal.TraceCollapsibleContent>
>();
expectTypeOf<React.ComponentProps<typeof traceOfficial.TraceCollapsibleTrigger>>().toExtend<
  React.ComponentProps<typeof traceLocal.TraceCollapsibleTrigger>
>();
expectTypeOf<React.ComponentProps<typeof traceOfficial.TraceDescription>>().toExtend<
  React.ComponentProps<typeof traceLocal.TraceDescription>
>();
expectTypeOf<React.ComponentProps<typeof traceOfficial.TraceIcon>>().toExtend<
  React.ComponentProps<typeof traceLocal.TraceIcon>
>();
expectTypeOf<React.ComponentProps<typeof traceOfficial.TraceLine>>().toExtend<
  React.ComponentProps<typeof traceLocal.TraceLine>
>();
expectTypeOf<React.ComponentProps<typeof traceOfficial.TraceTitle>>().toExtend<
  React.ComponentProps<typeof traceLocal.TraceTitle>
>();
