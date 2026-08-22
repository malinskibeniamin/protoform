import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import type React from "react";

import { Button } from "@/registry/base-nova/protoform/components/button";
import { usePortalContainer } from "@/registry/base-nova/protoform/hooks/use-portal-container";
import {
  asChildTrigger,
  narrowOpenChange,
  renderDescription,
  renderWithDataState,
  warnDeprecatedProp,
} from "@/registry/base-nova/protoform/lib/base-ui-compat";
import { cn, type FixedPositionContentProps, type SharedProps } from "@/registry/base-nova/protoform/lib/utils";

type DialogRootProps = Omit<React.ComponentProps<typeof DialogPrimitive.Root>, "onOpenChange"> &
  SharedProps & {
    onOpenChange?: (open: boolean) => void;
  };

function Dialog({ testId, onOpenChange, ...props }: DialogRootProps) {
  return (
    <DialogPrimitive.Root
      data-slot="dialog"
      data-testid={testId}
      onOpenChange={narrowOpenChange(onOpenChange)}
      {...props}
    />
  );
}

type DialogTriggerProps = React.ComponentProps<typeof DialogPrimitive.Trigger> & {
  asChild?: boolean;
};

function DialogTrigger({ className, ...props }: DialogTriggerProps) {
  return (
    <DialogPrimitive.Trigger
      className={cn("cursor-pointer", className)}
      data-slot="dialog-trigger"
      {...asChildTrigger(props)}
    />
  );
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

type DialogCloseProps = React.ComponentProps<typeof DialogPrimitive.Close> & {
  asChild?: boolean;
};

function DialogClose({ ...props }: DialogCloseProps) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...asChildTrigger(props)} />;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Backdrop>) {
  return (
    <DialogPrimitive.Backdrop
      // fill-mode-forwards holds the exit keyframe until Base UI unmounts;
      // without it the backdrop flashes back to its natural opacity for one frame.
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/40 fill-mode-forwards backdrop-blur-xs data-[state=closed]:animate-out data-[state=open]:animate-in",
        className
      )}
      data-slot="dialog-overlay"
      render={renderWithDataState("div")}
      {...props}
    />
  );
}

const dialogContentVariants = cva(
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex max-h-[85vh] w-full max-w-[calc(100%-2rem)] translate-[-50%] flex-col overflow-hidden rounded-xl border bg-background fill-mode-forwards shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in",
  {
    defaultVariants: {
      size: "md",
      variant: "standard",
    },
    variants: {
      size: {
        full: "sm:max-w-[90vw]",
        lg: "sm:max-w-2xl",
        md: "sm:max-w-lg",
        sm: "sm:max-w-sm",
        xl: "sm:max-w-4xl",
      },
      variant: {
        centered: "text-center",
        destructive: "border-destructive/50",
        standard: "",
      },
    },
  }
);

interface DialogContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Popup>,
    VariantProps<typeof dialogContentVariants>,
    SharedProps,
    Pick<FixedPositionContentProps, "container" | "showOverlay" | "onOpenAutoFocus"> {
  showCloseButton?: boolean;
}

function DialogContent(contentProps: DialogContentProps) {
  const {
    className,
    children,
    showCloseButton = true,
    showOverlay = true,
    size,
    variant,
    testId,
    container,
    ...props
  } = contentProps;
  const onOpenAutoFocus: unknown = Reflect.get(props, "onOpenAutoFocus");
  Reflect.deleteProperty(props, "onOpenAutoFocus");
  warnDeprecatedProp(
    "DialogContent",
    "onOpenAutoFocus",
    onOpenAutoFocus,
    "Use `initialFocus` on Base UI `Dialog.Popup` instead."
  );
  const portalContainer = usePortalContainer();
  return (
    <DialogPortal container={container ?? portalContainer}>
      {showOverlay ? <DialogOverlay /> : null}
      <DialogPrimitive.Popup
        className={cn(dialogContentVariants({ size, variant }), className)}
        data-slot="dialog-content"
        data-testid={testId}
        render={renderWithDataState("div")}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            render={
              <Button
                aria-label="Close"
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                size="icon-sm"
                variant="ghost"
              >
                <X />
              </Button>
            }
          />
        ) : null}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

const dialogHeaderVariants = cva("flex shrink-0 flex-col p-4 [&:has(+[data-slot=dialog-body])]:border-b", {
  defaultVariants: {
    align: "responsive",
    spacing: "normal",
  },
  variants: {
    align: {
      center: "text-center",
      left: "text-left",
      responsive: "text-center sm:text-left",
    },
    spacing: {
      loose: "space-y-2",
      normal: "space-y-1.5",
      tight: "space-y-1",
    },
  },
});

interface DialogHeaderProps extends React.ComponentProps<"div">, VariantProps<typeof dialogHeaderVariants> {}

function DialogHeader({ className, align, spacing, ...props }: DialogHeaderProps) {
  return (
    <div className={cn(dialogHeaderVariants({ align, spacing }), className)} data-slot="dialog-header" {...props} />
  );
}

const dialogFooterVariants = cva("flex shrink-0 p-4 [[data-slot=dialog-body]+&]:border-t", {
  defaultVariants: {
    direction: "responsive",
    gap: "md",
    justify: "end",
  },
  variants: {
    direction: {
      column: "flex-col",
      responsive: "flex-col-reverse sm:flex-row sm:items-center",
      row: "flex-row items-center",
    },
    gap: {
      lg: "gap-4",
      md: "gap-2",
      sm: "gap-1",
    },
    justify: {
      between: "justify-between",
      center: "justify-center",
      end: "justify-end sm:justify-end",
      start: "justify-start",
    },
  },
});

interface DialogFooterProps extends React.ComponentProps<"div">, VariantProps<typeof dialogFooterVariants> {}

function DialogFooter({ className, direction, justify, gap, ...props }: DialogFooterProps) {
  return (
    <div
      className={cn(dialogFooterVariants({ direction, gap, justify }), className)}
      data-slot="dialog-footer"
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("font-semibold text-lg leading-none tracking-tight", className)}
      data-slot="dialog-title"
      {...props}
    />
  );
}

function DialogDescription({
  className,
  children,
  asChild,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description> & { asChild?: boolean }) {
  // Render as <div> (not <p>) so block-level children don't trigger validateDOMNesting.
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      render={renderDescription({
        asChild,
        children,
        className: typeof className === "string" ? className : undefined,
        dataSlot: "dialog-description",
      })}
      {...props}
    />
  );
}

// min-h-0 lets the body shrink below its natural height so overflow-y-auto scrolls.
const dialogBodyVariants = cva("min-h-0 flex-1 overflow-y-auto p-4", {
  defaultVariants: {
    spacing: "md",
  },
  variants: {
    spacing: {
      lg: "space-y-6",
      md: "space-y-4",
      none: "",
      sm: "space-y-2",
    },
  },
});

interface DialogBodyProps extends React.ComponentProps<"div">, VariantProps<typeof dialogBodyVariants> {}

function DialogBody({ className, spacing, ...props }: DialogBodyProps) {
  return <div className={cn(dialogBodyVariants({ spacing }), className)} data-slot="dialog-body" {...props} />;
}

const dialogFieldVariants = cva("flex flex-col", {
  defaultVariants: {
    spacing: "normal",
  },
  variants: {
    spacing: {
      loose: "space-y-2",
      normal: "space-y-1.5",
      tight: "space-y-1",
    },
  },
});

interface DialogFieldProps extends React.ComponentProps<"div">, VariantProps<typeof dialogFieldVariants> {}

function DialogField({ className, spacing, ...props }: DialogFieldProps) {
  return <div className={cn(dialogFieldVariants({ spacing }), className)} {...props} />;
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogField,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
