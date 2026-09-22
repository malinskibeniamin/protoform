"use client";

import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, type SharedProps } from "@/registry/base-nova/protoform/lib/utils";

function InputGroup({ className, testId, ...props }: React.ComponentProps<"div"> & SharedProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [hasBlockAlign, setHasBlockAlign] = React.useState(false);

  React.useEffect(() => {
    if (ref.current) {
      const blockAddon = ref.current.querySelector('[data-align="block-start"], [data-align="block-end"]');
      setHasBlockAlign(Boolean(blockAddon));
    }
  }, []);

  return (
    <div
      className={cn(
        "group/input-group !border-input relative flex w-full rounded-md border shadow-xs outline-none transition dark:bg-input/30",
        "h-9 min-w-0 has-[>textarea]:h-auto",

        // Conditional alignment
        hasBlockAlign ? "h-auto flex-col items-stretch" : "items-center",

        // Variants based on alignment.
        "has-[>[data-align=inline-start]]:[&>input]:pl-2",
        "has-[>[data-align=inline-end]]:[&>input]:pr-2",
        "has-[>[data-align=block-start]]:[&>input]:pb-3",
        "has-[>[data-align=block-end]]:[&>input]:pt-3",

        // Focus state.
        "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50",

        // Error state.
        "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",

        className
      )}
      data-slot="input-group"
      data-testid={testId}
      ref={ref}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text select-none items-center gap-2 py-1.5 font-medium text-muted-foreground text-sm group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-sm [&>svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: {
      align: "inline-start",
    },
    variants: {
      align: {
        "block-end": "order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5 [.border-t]:pt-3",
        "block-start":
          "order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5 [.border-b]:pb-3",
        "inline-end": "order-last justify-end pr-3 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]",
        "inline-start": "order-first justify-start pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
      },
    },
  }
);

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      className={cn(inputGroupAddonVariants({ align }), className)}
      data-align={align}
      data-slot="input-group-addon"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus();
      }}
      {...props}
    />
  );
}

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  testId,
  ...props
}: React.ComponentProps<typeof Button> & SharedProps) {
  return (
    <Button
      className={className}
      data-size={size}
      size={size}
      testId={testId}
      type={type}
      variant={variant}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-muted-foreground text-sm [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
        className
      )}
      {...props}
    />
  );
}

function InputGroupInput({ className, testId, ...props }: Omit<React.ComponentProps<"input">, "size"> & SharedProps) {
  return (
    <div className="flex-1">
      <Input className={className} data-slot="input-group-control" testId={testId} variant="group" {...props} />
    </div>
  );
}

const InputGroupTextarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea"> & SharedProps>(
  ({ className, testId, ...props }, ref) => (
    <Textarea
      className={cn("flex-1", className)}
      data-slot="input-group-control"
      ref={ref}
      resize="none"
      testId={testId}
      variant="group"
      {...props}
    />
  )
);

InputGroupTextarea.displayName = "InputGroupTextarea";

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea };
