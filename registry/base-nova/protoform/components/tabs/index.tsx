'use client';

import {
  Tabs as SDKTabs,
  TabsIndicator as SDKTabsIndicator,
  TabsList as SDKTabsList,
  TabsPanel as SDKTabsPanel,
  TabsTab as SDKTabsTab,
  TabsTabIcon as SDKTabsTabIcon,
} from '@ui-sdk/react/tabs';

import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

const Tabs = SDKTabs;

function TabsIndicator({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKTabsIndicator>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKTabsIndicator
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function TabsList({
  className,
  testId,
  variant = 'default',
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKTabsList>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKTabsList
      {...definedProps(props)}
      className={(state) =>
        cn(
          'group/tabs-list inline-flex h-10 items-center gap-1 text-muted-foreground',
          variant === 'underline' &&
            'relative w-full justify-start rounded-t-xl border-b border-border bg-background py-0 text-current',
          variant === 'line' && 'bg-transparent',
          variant !== 'underline' && variant !== 'line' && 'w-fit justify-center rounded-lg bg-muted p-1',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function TabsPanel({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKTabsPanel>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKTabsPanel
      {...definedProps(props)}
      className={(state) => cn('mt-3 outline-none', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function TabsTab({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKTabsTab>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKTabsTab
      {...definedProps(props)}
      className={(state) =>
        cn(
          'inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium outline-none group-data-[variant=underline]/tabs-list:relative group-data-[variant=underline]/tabs-list:h-full group-data-[variant=underline]/tabs-list:rounded-none group-data-[variant=underline]/tabs-list:border-b-2 group-data-[variant=underline]/tabs-list:border-transparent group-data-[variant=underline]/tabs-list:px-4 group-data-[variant=underline]/tabs-list:py-2 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-selected:bg-background data-selected:text-foreground data-selected:shadow-sm group-data-[variant=underline]/tabs-list:data-selected:border-primary group-data-[variant=underline]/tabs-list:data-selected:bg-transparent group-data-[variant=underline]/tabs-list:data-selected:shadow-none',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function TabsTabIcon({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKTabsTabIcon>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKTabsTabIcon
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab, TabsTabIcon };
