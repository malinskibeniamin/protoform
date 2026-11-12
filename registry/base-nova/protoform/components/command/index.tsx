'use client';

import {
  Command as SDKCommand,
  CommandEmpty as SDKCommandEmpty,
  CommandGroup as SDKCommandGroup,
  CommandGroupLabel as SDKCommandGroupLabel,
  CommandInput as SDKCommandInput,
  CommandItem as SDKCommandItem,
  CommandItemIcon as SDKCommandItemIcon,
  CommandItems as SDKCommandItems,
  CommandItemText as SDKCommandItemText,
  CommandList as SDKCommandList,
  CommandPage as SDKCommandPage,
  CommandSeparator as SDKCommandSeparator,
  CommandShortcut as SDKCommandShortcut,
  CommandStatus as SDKCommandStatus,
} from '@ui-sdk/react/command';

import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

const Command = SDKCommand;

function CommandEmpty({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCommandEmpty>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCommandEmpty
      {...definedProps(props)}
      className={(state) =>
        cn('py-6 text-center text-sm', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CommandGroup({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCommandGroup>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCommandGroup
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CommandGroupLabel({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCommandGroupLabel>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCommandGroupLabel
      {...definedProps(props)}
      className={(state) =>
        cn(
          'px-2 py-1.5 text-xs font-medium text-muted-foreground',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CommandInput({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCommandInput>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCommandInput
      {...definedProps(props)}
      className={(state) =>
        cn(
          'h-11 w-full border-b border-border bg-transparent px-3 text-sm outline-none',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CommandItem({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCommandItem>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCommandItem
      {...definedProps(props)}
      className={(state) =>
        cn(
          'relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CommandItemIcon({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCommandItemIcon>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCommandItemIcon
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

const CommandItems = SDKCommandItems;

function CommandItemText({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCommandItemText>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCommandItemText
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CommandList({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCommandList>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCommandList
      {...definedProps(props)}
      className={(state) =>
        cn('max-h-72 overflow-auto p-1', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

const CommandPage = SDKCommandPage;

function CommandSeparator({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCommandSeparator>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCommandSeparator
      {...definedProps(props)}
      className={(state) =>
        cn('-mx-1 my-1 h-px bg-border', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CommandShortcut({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCommandShortcut>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCommandShortcut
      {...definedProps(props)}
      className={(state) =>
        cn('ml-auto text-xs text-muted-foreground', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function CommandStatus({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCommandStatus>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCommandStatus
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandItems,
  CommandItemText,
  CommandList,
  CommandPage,
  CommandSeparator,
  CommandShortcut,
  CommandStatus,
};
