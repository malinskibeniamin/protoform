'use client';

import {
  Combobox as SDKCombobox,
  ComboboxArrow as SDKComboboxArrow,
  ComboboxChip as SDKComboboxChip,
  ComboboxChipRemove as SDKComboboxChipRemove,
  ComboboxChips as SDKComboboxChips,
  ComboboxChipsOverflow as SDKComboboxChipsOverflow,
  ComboboxClear as SDKComboboxClear,
  ComboboxContent as SDKComboboxContent,
  ComboboxCreate as SDKComboboxCreate,
  ComboboxEmpty as SDKComboboxEmpty,
  ComboboxGroup as SDKComboboxGroup,
  ComboboxGroupLabel as SDKComboboxGroupLabel,
  ComboboxInput as SDKComboboxInput,
  ComboboxItem as SDKComboboxItem,
  ComboboxItemIcon as SDKComboboxItemIcon,
  ComboboxItemIndicator as SDKComboboxItemIndicator,
  ComboboxItems as SDKComboboxItems,
  ComboboxItemText as SDKComboboxItemText,
  ComboboxLabel as SDKComboboxLabel,
  ComboboxList as SDKComboboxList,
  ComboboxSelectAll as SDKComboboxSelectAll,
  ComboboxSeparator as SDKComboboxSeparator,
  ComboboxStatus as SDKComboboxStatus,
  ComboboxTrigger as SDKComboboxTrigger,
  ComboboxValue as SDKComboboxValue,
  ComboboxValueIcon as SDKComboboxValueIcon,
} from '@ui-sdk/react/combobox';

import { CheckIcon } from 'lucide-react';
import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

const Combobox = SDKCombobox;

function ComboboxArrow({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxArrow>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxArrow
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxChip({
  value,
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxChip>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxChip
      value={value}
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxChipRemove({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxChipRemove>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxChipRemove
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxChips({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxChips>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxChips
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxChipsOverflow({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxChipsOverflow>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxChipsOverflow
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxClear({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxClear>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxClear
      {...definedProps(props)}
      className={(state) =>
        cn(
          'inline-flex size-5 items-center justify-center rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxContent({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxContent>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxContent
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

function ComboboxCreate({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxCreate>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxCreate
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxEmpty({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxEmpty>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxEmpty
      {...definedProps(props)}
      className={(state) =>
        cn('p-4 text-sm text-muted-foreground', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxGroup({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxGroup>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxGroup
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxLabel({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxLabel>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxLabel
      {...definedProps(props)}
      className={(state) =>
        cn('px-2 py-1.5 text-xs text-muted-foreground', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxInput({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxInput>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxInput
      {...definedProps(props)}
      className={(state) =>
        cn(
          variant === 'search'
            ? 'h-9 w-full rounded-lg border border-input bg-background px-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'
            : 'h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxItem({
  value,
  children,
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxItem>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  const renderChildren = typeof children === 'function' ? children : () => children;
  return (
    <SDKComboboxItem
      value={value}
      {...definedProps(props)}
      className={(state) =>
        cn(
          'relative flex cursor-pointer items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    >
      {(state) => (
        <>
          {renderChildren(state)}
          <SDKComboboxItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
            <CheckIcon aria-hidden="true" className="size-3.5" />
          </SDKComboboxItemIndicator>
        </>
      )}
    </SDKComboboxItem>
  );
}

function ComboboxItemIcon({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxItemIcon>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxItemIcon
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxItemIndicator({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxItemIndicator>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxItemIndicator
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

const ComboboxItems = SDKComboboxItems;

function ComboboxItemText({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxItemText>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxItemText
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxGroupLabel({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxGroupLabel>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxGroupLabel
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxList({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxList>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxList
      {...definedProps(props)}
      className={(state) =>
        cn('max-h-64 overflow-auto', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxSelectAll({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxSelectAll>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxSelectAll
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxSeparator({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxSeparator>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxSeparator
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxStatus({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxStatus>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxStatus
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function ComboboxTrigger({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxTrigger>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxTrigger
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

const ComboboxValue = SDKComboboxValue;

function ComboboxValueIcon({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKComboboxValueIcon>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKComboboxValueIcon
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export {
  Combobox,
  ComboboxArrow,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxChipsOverflow,
  ComboboxClear,
  ComboboxContent,
  ComboboxCreate,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIcon,
  ComboboxItemIndicator,
  ComboboxItems,
  ComboboxItemText,
  ComboboxLabel,
  ComboboxList,
  ComboboxSelectAll,
  ComboboxSeparator,
  ComboboxStatus,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxValueIcon,
};
