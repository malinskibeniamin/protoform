'use client';

import {
  Select as SDKSelect,
  SelectArrow as SDKSelectArrow,
  SelectClear as SDKSelectClear,
  SelectContent as SDKSelectContent,
  SelectEmpty as SDKSelectEmpty,
  SelectGroup as SDKSelectGroup,
  SelectGroupLabel as SDKSelectGroupLabel,
  SelectInput as SDKSelectInput,
  SelectItem as SDKSelectItem,
  SelectItemIcon as SDKSelectItemIcon,
  SelectItemIndicator as SDKSelectItemIndicator,
  SelectItems as SDKSelectItems,
  SelectItemText as SDKSelectItemText,
  SelectLabel as SDKSelectLabel,
  SelectList as SDKSelectList,
  SelectSelectAll as SDKSelectSelectAll,
  SelectSeparator as SDKSelectSeparator,
  SelectStatus as SDKSelectStatus,
  SelectTrigger as SDKSelectTrigger,
  SelectValue as SDKSelectValue,
  SelectValueIcon as SDKSelectValueIcon,
} from '@ui-sdk/react/select';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

const Select = SDKSelect;

function SelectArrow({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectArrow>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSelectArrow
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function SelectClear({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectClear>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSelectClear
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function SelectContent({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<Omit<React.ComponentProps<typeof SDKSelectContent>, 'keepMounted'>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSelectContent
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

function SelectEmpty({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectEmpty>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSelectEmpty
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function SelectGroup({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectGroup>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSelectGroup
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function SelectLabel({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectLabel>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSelectLabel
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

function SelectInput({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectInput>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSelectInput
      {...definedProps(props)}
      className={(state) =>
        cn(
          'h-9 w-full border-b border-border bg-transparent px-2 outline-none',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function SelectItem({
  value,
  children,
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectItem>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  const renderChildren = typeof children === 'function' ? children : () => children;
  return (
    <SDKSelectItem
      value={value}
      {...definedProps(props)}
      className={(state) =>
        cn(
          'relative flex cursor-pointer items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground data-selected:bg-accent',
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
          <SDKSelectItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
            <CheckIcon aria-hidden="true" className="size-3.5" />
          </SDKSelectItemIndicator>
        </>
      )}
    </SDKSelectItem>
  );
}

function SelectItemIcon({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectItemIcon>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSelectItemIcon
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function SelectItemIndicator({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectItemIndicator>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSelectItemIndicator
      {...definedProps(props)}
      className={(state) => cn('ml-auto', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

const SelectItems = SDKSelectItems;

function SelectItemText({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectItemText>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSelectItemText
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function SelectGroupLabel({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectGroupLabel>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSelectGroupLabel
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function SelectList({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectList>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSelectList
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function SelectSelectAll({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectSelectAll>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSelectSelectAll
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function SelectSeparator({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectSeparator>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSelectSeparator
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

function SelectStatus({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectStatus>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSelectStatus
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function SelectTrigger({
  children,
  className,
  testId,
  variant,
  size = 'default',
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectTrigger>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  const renderChildren = typeof children === 'function' ? children : () => children;
  return (
    <SDKSelectTrigger
      {...definedProps(props)}
      className={(state) =>
        cn(
          'flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
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
          <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        </>
      )}
    </SDKSelectTrigger>
  );
}

function SelectValue({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectValue>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSelectValue
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function SelectValueIcon({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSelectValueIcon>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSelectValueIcon
      {...definedProps(props)}
      className={(state) => cn('', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export {
  Select,
  SelectArrow,
  SelectClear,
  SelectContent,
  SelectEmpty,
  SelectGroup,
  SelectGroupLabel,
  SelectInput,
  SelectItem,
  SelectItemIcon,
  SelectItemIndicator,
  SelectItems,
  SelectItemText,
  SelectLabel,
  SelectList,
  SelectSelectAll,
  SelectSeparator,
  SelectStatus,
  SelectTrigger,
  SelectValue,
  SelectValueIcon,
};
