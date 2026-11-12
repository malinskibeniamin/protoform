'use client';

import {
  NavigationMenu as SDKNavigationMenu,
  NavigationMenuContent as SDKNavigationMenuContent,
  NavigationMenuIndicator as SDKNavigationMenuIndicator,
  NavigationMenuItem as SDKNavigationMenuItem,
  NavigationMenuLink as SDKNavigationMenuLink,
  NavigationMenuLinkIcon as SDKNavigationMenuLinkIcon,
  NavigationMenuList as SDKNavigationMenuList,
  NavigationMenuTrigger as SDKNavigationMenuTrigger,
  NavigationMenuViewport as SDKNavigationMenuViewport,
} from '@ui-sdk/react/navigation-menu';

import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

function NavigationMenu({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKNavigationMenu>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKNavigationMenu
      {...definedProps(props)}
      className={(state) =>
        cn('relative flex items-center', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function NavigationMenuContent({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKNavigationMenuContent>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKNavigationMenuContent
      {...definedProps(props)}
      className={(state) =>
        cn(
          'z-50 max-h-(--available-height) min-w-36 overflow-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function NavigationMenuIndicator({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKNavigationMenuIndicator>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKNavigationMenuIndicator
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function NavigationMenuItem({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKNavigationMenuItem>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKNavigationMenuItem
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function NavigationMenuLink({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKNavigationMenuLink>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKNavigationMenuLink
      {...definedProps(props)}
      className={(state) =>
        cn(
          'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function NavigationMenuLinkIcon({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKNavigationMenuLinkIcon>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKNavigationMenuLinkIcon
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function NavigationMenuList({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKNavigationMenuList>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKNavigationMenuList
      {...definedProps(props)}
      className={(state) =>
        cn('flex list-none items-center gap-1', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function NavigationMenuTrigger({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKNavigationMenuTrigger>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKNavigationMenuTrigger
      {...definedProps(props)}
      className={(state) =>
        cn(
          'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function NavigationMenuViewport({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKNavigationMenuViewport>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKNavigationMenuViewport
      {...definedProps(props)}
      className={(state) => cn('relative', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuLinkIcon,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
};
