'use client';

import { mergeProps, type PartProps, renderElement } from '@ui-sdk/react/primitive';
import { useShortcut, useShortcutHint } from '@ui-sdk/react/shortcuts';
import type { VariantProps } from 'class-variance-authority';
import Cookies from 'js-cookie';
import { PanelLeftIcon } from 'lucide-react';
import type { CSSProperties } from 'react';
import React from 'react';
import { Button } from '@/components/ui/sdk/button/index';
import { Input } from '@/components/ui/sdk/input/index';
import { Separator } from '@/components/ui/sdk/separator/index';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
} from '@/components/ui/sdk/sheet/index';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/sdk/tooltip/index';
import { sidebarMenuButtonVariants } from '@/components/ui/shared/sidebar-variants';
import { useIsMobile } from '@/registry/base-nova/protoform/hooks/use-mobile';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

const mobileStyle: CSSProperties & Record<`--${string}`, string | number | undefined> = {
  '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
};

interface SidebarContextProps {
  isMobile: boolean;
  open: boolean;
  openMobile: boolean;
  setOpen: (open: boolean) => void;
  setOpenMobile: (open: boolean) => void;
  state: 'expanded' | 'collapsed';
  toggleSidebar: () => void;
}
const SidebarContext = React.createContext<SidebarContextProps | null>(null);
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (context === null) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}
function useSidebarState({
  defaultOpen,
  open: openProp,
  onOpenChange: setOpenProp,
}: {
  defaultOpen: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}): SidebarContextProps {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = (value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === 'function' ? value(open) : value;
    if (setOpenProp) {
      setOpenProp(openState);
    } else {
      setUncontrolledOpen(openState);
    }
    Cookies.set(SIDEBAR_COOKIE_NAME, String(openState), {
      path: '/',
      expires: SIDEBAR_COOKIE_MAX_AGE / (24 * 60 * 60),
      sameSite: 'lax',
    });
  };
  const toggleSidebar = () =>
    isMobile ? setOpenMobile((previousOpen) => !previousOpen) : setOpen((previousOpen) => !previousOpen);
  useShortcut(`mod+${SIDEBAR_KEYBOARD_SHORTCUT}`, toggleSidebar, { description: 'Toggle sidebar' });
  const state: SidebarContextProps['state'] = open === true ? 'expanded' : 'collapsed';
  return {
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar,
  };
}
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const contextValue = useSidebarState({
    defaultOpen,
    ...(openProp === undefined ? {} : { open: openProp }),
    ...(setOpenProp === undefined ? {} : { onOpenChange: setOpenProp }),
  });
  const sidebarStyle: CSSProperties & Record<`--${string}`, string | number | undefined> = {
    '--sidebar-width': SIDEBAR_WIDTH,
    '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
    ...style,
  };
  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        className={cn('group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar', className)}
        data-slot="sidebar-wrapper"
        style={sidebarStyle}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}
function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className,
  children,
  dir,
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  const mobileLayer = React.useRef<HTMLDivElement>(null);
  useShortcut(isMobile && openMobile ? `mod+${SIDEBAR_KEYBOARD_SHORTCUT}` : null, () => setOpenMobile(false), {
    layer: mobileLayer,
    description: 'Close sidebar',
  });
  if (collapsible === 'none') {
    return (
      <div
        className={cn('flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground', className)}
        data-slot="sidebar"
        {...props}
      >
        {children}
      </div>
    );
  }
  if (isMobile) {
    return (
      <Sheet onOpenChange={setOpenMobile} open={openMobile} side={side} {...props}>
        <SheetOverlay />
        <SheetContent
          className="w-(--sidebar-width) [&>button]:hidden"
          data-mobile="true"
          data-sidebar="sidebar"
          data-slot="sidebar"
          dir={dir}
          ref={mobileLayer}
          style={mobileStyle}
          variant="sidebar"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex size-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <div
      className="group peer hidden text-sidebar-foreground md:block"
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-side={side}
      data-slot="sidebar"
      data-state={state}
      data-variant={variant}
    >
      <div
        className={cn(
          'relative w-(--sidebar-width) bg-transparent transition-all duration-200 ease-linear',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[side=right]:rotate-180',
          variant === 'floating' || variant === 'inset'
            ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
            : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)'
        )}
        data-slot="sidebar-gap"
      />
      <div
        className={cn(
          'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-all duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex',
          variant === 'floating' || variant === 'inset'
            ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
            : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
          className
        )}
        data-side={side}
        data-slot="sidebar-container"
        {...props}
      >
        <div
          className="flex size-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border"
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();
  const hint = useShortcutHint(`mod+${SIDEBAR_KEYBOARD_SHORTCUT}`);
  return (
    <Button
      aria-keyshortcuts={hint.ariaKeyshortcuts}
      className={className}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      onClick={(event, details) => {
        onClick?.(event, details);
        toggleSidebar();
      }}
      size="icon-sm"
      title={`Toggle Sidebar (${hint.text})`}
      type="button"
      variant="ghost"
      {...props}
    >
      <PanelLeftIcon className="rtl:-scale-x-100" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
function SidebarRail({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      aria-label="Toggle Sidebar"
      className={cn(
        'absolute inset-y-0 z-20 hidden w-4 group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:inset-s-1/2 after:w-[2px] sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2',
        'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
        '[&:is([data-side=left][data-state=collapsed]_*)]:cursor-e-resize [&:is([data-side=right][data-state=collapsed]_*)]:cursor-w-resize',
        'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full',
        '[&:is([data-side=left][data-collapsible=offcanvas]_*)]:-right-2',
        '[&:is([data-side=right][data-collapsible=offcanvas]_*)]:-left-2',
        className
      )}
      data-sidebar="rail"
      data-slot="sidebar-rail"
      onClick={toggleSidebar}
      size="rail"
      tabIndex={-1}
      title="Toggle sidebar"
      type="button"
      variant="rail"
      {...props}
    />
  );
}
function SidebarInset({ className, render, ...props }: PartProps<'main'>) {
  return renderElement(
    'main',
    {
      ...props,
      className: cn(
        'relative flex w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
        className
      ),
      'data-slot': 'sidebar-inset',
    },
    render
  );
}
function SidebarInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return <Input className={cn('h-8 w-full', className)} data-sidebar="input" data-slot="sidebar-input" {...props} />;
}

function SidebarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      className={className}
      data-sidebar="separator"
      data-slot="sidebar-separator"
      variant="sidebar"
      {...props}
    />
  );
}

function SidebarGroupLabel({ className, render, ...props }: PartProps<'div'> & React.ComponentProps<'div'>) {
  return renderElement(
    'div',
    {
      ...mergeProps(
        {
          className: cn(
            'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-all duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
            className
          ),
        },
        props
      ),
      'data-slot': 'sidebar-group-label',
      'data-sidebar': 'group-label',
    },
    render,
    {
      slot: 'sidebar-group-label',
      sidebar: 'group-label',
    }
  );
}
function SidebarGroupAction({ className, render, ...props }: PartProps<'button'> & React.ComponentProps<'button'>) {
  return renderElement(
    'button',
    {
      ...mergeProps(
        {
          type: render === undefined ? 'button' : undefined,
          className: cn(
            'absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0',
            className
          ),
        },
        props
      ),
      'data-slot': 'sidebar-group-action',
      'data-sidebar': 'group-action',
    },
    render,
    {
      slot: 'sidebar-group-action',
      sidebar: 'group-action',
    }
  );
}

function SidebarMenuButton({
  render,
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className,
  ...props
}: PartProps<'button'> &
  React.ComponentProps<'button'> & {
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  } & VariantProps<typeof sidebarMenuButtonVariants>) {
  const { isMobile, state } = useSidebar();
  const comp = renderElement(
    'button',
    {
      ...mergeProps(
        {
          type: render === undefined ? 'button' : undefined,
          className: cn(
            sidebarMenuButtonVariants({
              variant,
              size,
            }),
            className
          ),
        },
        props
      ),
      'data-slot': 'sidebar-menu-button',
      'data-sidebar': 'menu-button',
      'data-size': size,
      'data-active': isActive,
    },
    tooltip ? <TooltipTrigger render={render} /> : render,
    {
      slot: 'sidebar-menu-button',
      sidebar: 'menu-button',
      size,
      active: isActive,
    }
  );
  if (!tooltip) {
    return comp;
  }
  const tooltipProps =
    typeof tooltip === 'string'
      ? {
          children: tooltip,
        }
      : tooltip;
  return (
    <Tooltip>
      {comp}
      <TooltipContent align="center" hidden={state !== 'collapsed' || isMobile} side="right" {...tooltipProps} />
    </Tooltip>
  );
}
function SidebarMenuAction({
  className,
  render,
  showOnHover = false,
  ...props
}: PartProps<'button'> &
  React.ComponentProps<'button'> & {
    showOnHover?: boolean;
  }) {
  return renderElement(
    'button',
    {
      ...mergeProps(
        {
          type: render === undefined ? 'button' : undefined,
          className: cn(
            'absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0',
            showOnHover === true &&
              'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground aria-expanded:opacity-100 md:opacity-0',
            className
          ),
        },
        props
      ),
      'data-slot': 'sidebar-menu-action',
      'data-sidebar': 'menu-action',
    },
    render,
    {
      slot: 'sidebar-menu-action',
      sidebar: 'menu-action',
    }
  );
}

function SidebarMenuSubButton({
  render,
  size = 'md',
  isActive = false,
  className,
  ...props
}: PartProps<'a'> &
  React.ComponentProps<'a'> & {
    size?: 'sm' | 'md';
    isActive?: boolean;
  }) {
  return renderElement(
    'a',
    {
      ...mergeProps(
        {
          className: cn(
            'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground ring-sidebar-ring outline-hidden group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-[size=md]:text-sm data-[size=sm]:text-xs [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground',
            className
          ),
        },
        props
      ),
      'data-slot': 'sidebar-menu-sub-button',
      'data-sidebar': 'menu-sub-button',
      'data-size': size,
      'data-active': isActive,
    },
    render,
    {
      slot: 'sidebar-menu-sub-button',
      sidebar: 'menu-sub-button',
      size,
      active: isActive,
    }
  );
}

export {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/shared/sidebar';
export {
  Sidebar,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarInput,
  SidebarInset,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
