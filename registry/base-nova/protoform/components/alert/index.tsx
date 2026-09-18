import { cva, type VariantProps } from "class-variance-authority";
import { InfoIcon } from "lucide-react";
import React from "react";

import { cn, type SharedProps } from "@/registry/base-nova/protoform/lib/utils";

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    defaultVariants: {
      variant: "info",
    },
    variants: {
      variant: {
        destructive:
          "!border-destructive/20 bg-destructive/10 text-destructive *:data-[slot=alert-description]:text-destructive/90 [&>href]:text-current [&>svg]:text-current",
        info: "bg-card text-card-foreground",
        success: "border-primary/20 bg-primary/5 text-foreground [&>svg]:text-primary",
        warning: "border-primary/20 bg-muted text-foreground [&>svg]:text-primary",
      },
    },
  }
);
const DEFAULT_ALERT_ICON = <InfoIcon />;

const Alert = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & VariantProps<typeof alertVariants> & SharedProps & { icon?: React.ReactNode }
>(({ className, variant, testId, icon = DEFAULT_ALERT_ICON, children, ...props }, ref) => (
  <div
    className={cn(alertVariants({ variant }), className)}
    data-slot="alert"
    data-testid={testId}
    ref={ref}
    role="alert"
    {...props}
  >
    {icon}
    {children}
  </div>
));

Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & SharedProps>(
  ({ className, testId, ...props }, ref) => (
    <div
      className={cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className)}
      data-slot="alert-title"
      data-testid={testId}
      ref={ref}
      {...props}
    />
  )
);

AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & SharedProps>(
  ({ className, testId, ...props }, ref) => (
    <div
      className={cn(
        "col-start-2 grid w-full min-w-0 justify-items-start gap-1 text-muted-foreground text-sm [&_p]:leading-relaxed [&_pre]:w-full",
        className
      )}
      data-slot="alert-description"
      data-testid={testId}
      ref={ref}
      {...props}
    />
  )
);

AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
