import { cva, type VariantProps } from "class-variance-authority";
import { Command as CommandPrimitive } from "cmdk";
import { ChevronRight, SearchIcon } from "lucide-react";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/registry/base-nova/protoform/components/dialog";
import { Popover, PopoverAnchor, PopoverContent } from "@/registry/base-nova/protoform/components/popover";
import { Text } from "@/registry/base-nova/protoform/components/typography";
import { cn, type FixedPositionContentProps, type SharedProps } from "@/registry/base-nova/protoform/lib/utils";

const commandVariants = cva(
  "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
  {
    defaultVariants: {
      size: "md",
      variant: "elevated",
    },
    variants: {
      size: {
        full: "w-full",
        lg: "min-w-[500px] max-w-2xl",
        md: "min-w-[400px] max-w-lg md:min-w-[450px]",
        sm: "min-w-[300px] max-w-sm",
      },
      variant: {
        dialog: "",
        elevated: "!border-input border shadow-md",
        minimal: "",
      },
    },
  }
);

interface CommandProps
  extends React.ComponentProps<typeof CommandPrimitive>,
    VariantProps<typeof commandVariants>,
    SharedProps {}

function Command({ className, variant, size, testId, ...props }: CommandProps) {
  return (
    <CommandPrimitive
      className={cn(commandVariants({ size, variant }), className)}
      data-slot="command"
      data-testid={testId}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  showOverlay = true,
  container,
  onOpenAutoFocus,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> &
  Pick<FixedPositionContentProps, "showOverlay" | "container" | "onOpenAutoFocus"> & {
    title?: string;
    description?: string;
    className?: string;
    children?: React.ReactNode;
  }) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("overflow-hidden p-0", container && "absolute", className)}
        container={container}
        onOpenAutoFocus={onOpenAutoFocus}
        showOverlay={showOverlay}
      >
        <Command
          className="**:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
          variant="dialog"
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  testId,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & SharedProps) {
  return (
    <div className="!border-input flex h-9 items-center gap-2 border-b px-3" data-slot="command-input-wrapper">
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden selection:bg-selected selection:text-selected-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        data-slot="command-input"
        data-testid={testId}
        {...props}
      />
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn("max-h-[300px] scroll-py-1 overflow-y-auto overflow-x-hidden", className)}
      data-slot="command-list"
      {...props}
    />
  );
}

function CommandEmpty({ ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty className="py-6 text-center text-sm" data-slot="command-empty" {...props} />;
}

function CommandGroup({
  className,
  testId,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group> & SharedProps) {
  return (
    <CommandPrimitive.Group
      className={cn(
        "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:text-xs",
        className
      )}
      data-slot="command-group"
      data-testid={testId}
      {...props}
    />
  );
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      className={cn("-mx-1 h-px bg-divider", className)}
      data-slot="command-separator"
      {...props}
    />
  );
}

function CommandItem({
  className,
  testId,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item> & SharedProps) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="command-item"
      data-testid={testId}
      {...props}
    />
  );
}

function CommandShortcut({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <Text
      as="span"
      className={cn("ml-auto text-muted-foreground text-xs tracking-widest", className)}
      data-slot="command-shortcut"
      {...props}
    >
      {children}
    </Text>
  );
}

// ── Command Submenu ───────────────────────────────────────────────────

interface CommandSubContextType {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const CommandSubContext = React.createContext<CommandSubContextType | undefined>(undefined);

interface CommandSubProps {
  children: React.ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

function CommandSub({ open, onOpenChange, children }: CommandSubProps) {
  const contextValue = React.useMemo(() => ({ onOpenChange, open }), [onOpenChange, open]);
  return (
    <CommandSubContext.Provider value={contextValue}>
      <Popover onOpenChange={onOpenChange} open={open}>
        {children}
      </Popover>
    </CommandSubContext.Provider>
  );
}

interface CommandSubTriggerProps extends React.ComponentProps<typeof CommandPrimitive.Item> {
  inset?: boolean;
}

function CommandSubTrigger({ className, children, inset, ...props }: CommandSubTriggerProps) {
  const ctx = React.useContext(CommandSubContext);

  return (
    <PopoverAnchor
      render={
        <CommandPrimitive.Item
          className={cn(
            "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
            inset && "pl-8",
            className
          )}
          data-slot="command-sub-trigger"
          onSelect={() => ctx?.onOpenChange(true)}
          {...props}
        />
      }
    >
      {children}
      <ChevronRight className="ml-auto size-4" />
    </PopoverAnchor>
  );
}

interface CommandSubContentProps {
  children: React.ReactNode;
  className?: string;
}

function CommandSubContent({ className, children }: CommandSubContentProps) {
  return (
    <PopoverContent
      align="start"
      className={cn("w-fit p-0", className)}
      onOpenAutoFocus={(e) => e.preventDefault()}
      side="right"
      sideOffset={4}
    >
      {children}
    </PopoverContent>
  );
}

// Simplified interface for backend developers
interface SimpleCommandProps extends SharedProps {
  className?: string;
  emptyMessage?: string;
  groups: Array<{
    heading?: string;
    items: Array<{
      icon?: React.ReactNode;
      label: string;
      shortcut?: string;
      disabled?: boolean;
      onSelect?: () => void;
    }>;
  }>;
  placeholder?: string;
  size?: "sm" | "md" | "lg" | "full";
}

function SimpleCommand({
  placeholder = "Type a command or search...",
  emptyMessage = "No results found.",
  groups,
  size = "md",
  className,
  testId,
}: SimpleCommandProps) {
  return (
    <Command className={className} size={size} testId={testId}>
      <CommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        {groups.map((group, groupIndex) => (
          <React.Fragment key={group.heading || `group-${groupIndex}`}>
            {groupIndex > 0 && <CommandSeparator />}
            <CommandGroup heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem
                  disabled={item.disabled ?? false}
                  key={item.label}
                  {...(item.onSelect ? { onSelect: item.onSelect } : {})}
                >
                  {item.icon}
                  <Text as="span">{item.label}</Text>
                  {item.shortcut ? <CommandShortcut>{item.shortcut}</CommandShortcut> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </Command>
  );
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  CommandSub,
  CommandSubContent,
  CommandSubTrigger,
  commandVariants,
  SimpleCommand,
};
