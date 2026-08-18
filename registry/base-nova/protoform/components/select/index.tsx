"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import React from "react";

import { useGroup } from "@/registry/base-nova/protoform/components/group";
import { usePortalContainer } from "@/registry/base-nova/protoform/hooks/use-portal-container";
import { narrowOpenChange, renderWithDataState } from "@/registry/base-nova/protoform/lib/base-ui-compat";
import { cn, type PortalContentProps, type SharedProps } from "@/registry/base-nova/protoform/lib/utils";

type SelectRootProps = Omit<
  React.ComponentProps<typeof SelectPrimitive.Root>,
  "defaultValue" | "onOpenChange" | "onValueChange" | "value"
> &
  SharedProps & {
    defaultValue?: string | null;
    onOpenChange?: (open: boolean) => void;
    onValueChange?: (value: string | null) => void;
    value?: string | null;
  };

// Base UI types `value` as `unknown` because `Select.Root` is generic; the
// registry pins it to `string | null`, so validate at the boundary.
function adaptSelectValueChange(
  handler: ((value: string | null) => void) | undefined
): ((value: unknown) => void) | undefined {
  if (!handler) {
    return;
  }
  return (value) => {
    if (value !== null && typeof value !== "string") {
      throw new TypeError("Select values must be strings or null.");
    }
    handler(value);
  };
}

function Select({ testId, onOpenChange, onValueChange, ...props }: SelectRootProps) {
  return (
    <SelectPrimitive.Root
      data-slot="select"
      data-testid={testId}
      onOpenChange={narrowOpenChange(onOpenChange)}
      onValueChange={adaptSelectValueChange(onValueChange)}
      {...props}
    />
  );
}

Select.displayName = "Select";

function SelectGroup({ testId, ...props }: React.ComponentProps<typeof SelectPrimitive.Group> & SharedProps) {
  return <SelectPrimitive.Group data-slot="select-group" data-testid={testId} {...props} />;
}

SelectGroup.displayName = "SelectGroup";

type SelectValueProps = Omit<React.ComponentProps<typeof SelectPrimitive.Value>, "children"> & {
  placeholder?: React.ReactNode;
  children?: React.ReactNode | ((value: unknown) => React.ReactNode);
};

// Base UI only resolves an item's label after the popup has mounted. Until then
// it stringifies the raw value, which flashes `1` instead of `Any` for
// enum-backed selects with a controlled value. Pass a render-prop child or an
// `items` map on `<Select>` to close the gap — see the `select-enum-label` demo.
function SelectValue({ placeholder, children, ...props }: SelectValueProps) {
  // Fall back to placeholder when the render-prop returns null/undefined; Base
  // UI's primitive ignores `placeholder` once `children` is set.
  if (typeof children === "function") {
    const renderValue = children;
    return (
      <SelectPrimitive.Value data-slot="select-value" placeholder={placeholder} {...props}>
        {(value: unknown) => {
          const result = renderValue(value);
          if ((result === null || result === undefined) && placeholder !== undefined) {
            return placeholder;
          }
          return result;
        }}
      </SelectPrimitive.Value>
    );
  }
  if (children !== undefined) {
    return (
      <SelectPrimitive.Value data-slot="select-value" placeholder={placeholder} {...props}>
        {children as React.ComponentProps<typeof SelectPrimitive.Value>["children"]}
      </SelectPrimitive.Value>
    );
  }
  return <SelectPrimitive.Value data-slot="select-value" placeholder={placeholder} {...props} />;
}

SelectValue.displayName = "SelectValue";

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentProps<typeof SelectPrimitive.Trigger> &
    SharedProps & {
      size?: "sm" | "default" | "lg";
    }
>(({ className, size = "default", children, testId, ...props }, ref) => {
  const { position: groupPosition, attached } = useGroup();

  let positionClasses = "rounded-lg";
  if (attached && groupPosition === "first") {
    positionClasses = "rounded-r-none rounded-l-lg border-r-0";
  } else if (attached && groupPosition === "last") {
    positionClasses = "rounded-r-lg rounded-l-none border-l-0";
  } else if (attached && groupPosition === "middle") {
    positionClasses = "rounded-none border-r-0 border-l-0";
  }

  return (
    <SelectPrimitive.Trigger
      className={cn(
        "!border-input flex w-full cursor-pointer select-none items-center justify-between gap-1.5 whitespace-nowrap border bg-transparent py-2 pr-2 pl-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-8 data-[size=lg]:h-9 data-[size=sm]:h-7 data-[placeholder]:text-muted-foreground *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:hover:bg-input/50 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
        positionClasses,
        className
      )}
      data-size={size}
      data-slot="select-trigger"
      data-testid={testId}
      ref={ref}
      render={renderWithDataState("button")}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <span>
            <ChevronDownIcon className="size-4 opacity-50" />
          </span>
        }
      />
    </SelectPrimitive.Trigger>
  );
});

SelectTrigger.displayName = "SelectTrigger";

type SelectContentProps = React.ComponentProps<typeof SelectPrimitive.Popup> &
  SharedProps &
  Pick<PortalContentProps, "container"> & {
    /** @deprecated Kept for API parity; Base UI positioning is automatic. */
    position?: "item-aligned" | "popper";
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    alignOffset?: number;
    /** Set `true` to overlay the selected item on the trigger (Base UI's native default). */
    alignItemWithTrigger?: boolean;
  };

const SelectContent = React.forwardRef<React.ComponentRef<typeof SelectPrimitive.Popup>, SelectContentProps>(
  (
    {
      className,
      children,
      position = "popper",
      testId,
      container,
      side = "bottom",
      align,
      sideOffset = 4,
      alignOffset,
      alignItemWithTrigger = false,
      ...props
    },
    ref
  ) => {
    const portalContainer = usePortalContainer();
    return (
      <SelectPrimitive.Portal container={container ?? portalContainer}>
        <SelectPrimitive.Positioner
          align={align}
          alignItemWithTrigger={alignItemWithTrigger}
          alignOffset={alignOffset}
          className="z-50 max-h-[var(--available-height)]"
          side={side}
          sideOffset={sideOffset}
        >
          <SelectPrimitive.Popup
            className={cn(
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--available-height) min-w-36 origin-(--transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 data-[state=closed]:animate-out data-[state=open]:animate-in",
              position === "popper" &&
                "data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
              className
            )}
            data-slot="select-content"
            data-testid={testId}
            ref={ref}
            render={renderWithDataState("div")}
            {...props}
          >
            <SelectScrollUpButton />
            <SelectPrimitive.List
              className={cn(
                "max-h-(--available-height) w-full overflow-y-auto overflow-x-hidden p-1",
                position === "popper" && "min-w-[var(--anchor-width)] scroll-my-1"
              )}
            >
              {children}
            </SelectPrimitive.List>
            <SelectScrollDownButton />
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    );
  }
);

SelectContent.displayName = "SelectContent";

const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.GroupLabel>,
  React.ComponentProps<typeof SelectPrimitive.GroupLabel>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.GroupLabel
    className={cn("px-2 py-1.5 text-muted-foreground text-xs", className)}
    data-slot="select-label"
    ref={ref}
    {...props}
  />
));

SelectLabel.displayName = "SelectLabel";

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentProps<typeof SelectPrimitive.Item> & SharedProps
>(({ className, children, testId, ...props }, ref) => (
  <SelectPrimitive.Item
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden *:last:flex *:last:items-center *:last:gap-2 focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
      className
    )}
    data-slot="select-item"
    data-testid={testId}
    ref={ref}
    {...props}
  >
    <span className="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));

SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentProps<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
    data-slot="select-separator"
    ref={ref}
    {...props}
  />
));

SelectSeparator.displayName = "SelectSeparator";

const SelectScrollUpButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollUpArrow>,
  React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpArrow
    className={cn("flex cursor-pointer items-center justify-center py-1", className)}
    data-slot="select-scroll-up-button"
    ref={ref}
    {...props}
  >
    <ChevronUpIcon className="size-4" />
  </SelectPrimitive.ScrollUpArrow>
));

SelectScrollUpButton.displayName = "SelectScrollUpButton";

const SelectScrollDownButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollDownArrow>,
  React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownArrow
    className={cn("flex cursor-pointer items-center justify-center py-1", className)}
    data-slot="select-scroll-down-button"
    ref={ref}
    {...props}
  >
    <ChevronDownIcon className="size-4" />
  </SelectPrimitive.ScrollDownArrow>
));

SelectScrollDownButton.displayName = "SelectScrollDownButton";

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
