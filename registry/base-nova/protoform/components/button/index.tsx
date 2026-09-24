"use client";

import { cva, type VariantProps } from "class-variance-authority";
import React, { type ElementType } from "react";

import { useGroup } from "@/components/ui/group";
import { Spinner } from "@/components/ui/spinner";
import { Slot } from "@/registry/base-nova/protoform/lib/base-ui-compat";
import { cn, type SharedProps } from "@/registry/base-nova/protoform/lib/utils";

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center",
    "whitespace-nowrap rounded-lg border border-transparent bg-clip-padding font-medium text-sm",
    "select-none outline-none transition-all",
    "cursor-pointer",
    // Optional semantic slot: stock host Buttons can ignore this styling hook
    // without requiring a Protoform-specific variant in the consumer contract.
    "data-[slot=help-trigger]:rounded-full data-[slot=help-trigger]:text-muted-foreground data-[slot=help-trigger]:shadow-none data-[slot=help-trigger]:hover:text-foreground",
    "disabled:pointer-events-none disabled:cursor-not-allowed",
    "disabled:opacity-50",
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
    "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
    "selection:bg-selected selection:text-selected-foreground",
    "active:not-aria-[haspopup]:translate-y-px",
    '[&_svg:not([class*="size-"])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
    variants: {
      size: {
        icon: "size-8 [&_svg]:size-4",
        "icon-lg": "size-9 [&_svg]:size-4",
        "icon-sm": "size-7 [&_svg]:size-3.5",
        "icon-xs": "size-6 [&_svg]:size-3",
        lg: "h-9 gap-1.5 px-2.5 has-[>svg]:px-2 [&_svg]:size-4",
        md: "h-8 gap-1.5 px-2.5 has-[>svg]:px-2 [&_svg]:size-4",
        sm: "h-7 gap-1 px-2.5 text-xs has-[>svg]:px-2 [&_svg]:size-3.5",
        xs: "h-6 gap-1 px-2 text-xs has-[>svg]:px-1.5 [&_svg]:size-3",
      },
      variant: {
        calendar:
          "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 bg-transparent font-normal text-foreground leading-none hover:bg-muted hover:text-foreground active:bg-muted/80 data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-start=true]:rounded-l-md data-[range-end=true]:bg-selected data-[range-middle=true]:bg-accent data-[range-start=true]:bg-selected data-[selected-single=true]:bg-selected data-[range-end=true]:text-selected-foreground data-[range-middle=true]:text-accent-foreground data-[range-start=true]:text-selected-foreground data-[selected-single=true]:text-selected-foreground group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-selected group-data-[focused=true]/day:ring-3 group-data-[focused=true]/day:ring-selected/50 dark:hover:text-accent-foreground [&>span]:text-xs [&>span]:opacity-70",
        accent: [
          "bg-primary text-primary-foreground shadow-xs",
          "hover:bg-primary/90",
          "active:bg-primary/80",
          "disabled:bg-muted disabled:text-muted-foreground",
        ],
        "accent-ghost": [
          "bg-transparent text-primary",
          "hover:bg-primary/10 hover:text-primary",
          "active:bg-primary/15",
          "disabled:text-muted-foreground",
        ],
        "accent-outline": [
          "!border-primary border bg-transparent text-primary shadow-xs",
          "hover:border-primary/80 hover:bg-primary/10",
          "active:border-primary/70 active:bg-primary/15",
          "disabled:border-border disabled:text-muted-foreground",
        ],
        // Dashed border variant
        dashed: [
          "!border-primary border-2 border-dashed bg-transparent text-primary",
          "hover:border-primary/80 hover:bg-primary/5",
          "active:bg-primary/10",
          "disabled:border-border disabled:text-muted-foreground",
        ],
        destructive: [
          "bg-destructive text-primary-foreground shadow-xs",
          "hover:bg-destructive/90",
          "active:bg-destructive/80",
          "focus-visible:ring-destructive",
          "disabled:bg-muted disabled:text-muted-foreground",
        ],
        "destructive-ghost": [
          "bg-transparent text-destructive",
          "hover:bg-destructive/10 hover:text-destructive",
          "active:bg-destructive/10",
          "focus-visible:ring-destructive",
          "disabled:text-muted-foreground",
        ],
        "destructive-outline": [
          "!border-destructive border bg-transparent text-destructive shadow-xs",
          "hover:border-destructive/80 hover:bg-destructive/10",
          "active:border-destructive/70 active:bg-destructive/15",
          "focus-visible:ring-destructive",
          "disabled:border-border disabled:text-muted-foreground",
        ],
        ghost: ["bg-transparent text-foreground", "hover:bg-muted hover:text-foreground", "active:bg-muted/80"],
        inverse: [
          "bg-foreground text-background shadow-xs",
          "hover:bg-foreground/90",
          "active:bg-foreground/80",
          "disabled:bg-muted disabled:text-muted-foreground",
        ],
        "inverse-ghost": [
          "bg-transparent text-primary-foreground",
          "hover:bg-primary-foreground/10",
          "active:bg-primary-foreground/15",
          "disabled:text-muted-foreground",
        ],
        "inverse-outline": [
          "!border-primary-foreground border bg-transparent text-primary-foreground shadow-xs",
          "hover:border-transparent hover:bg-primary-foreground/10",
          "active:border-transparent active:bg-primary-foreground/15",
          "disabled:border-muted-foreground disabled:text-muted-foreground",
        ],
        // Link variant
        link: [
          "text-primary underline-offset-4",
          "hover:text-primary/80 hover:underline",
          "active:text-primary/60",
          "disabled:text-muted-foreground disabled:no-underline",
        ],
        outline: [
          "border border-input bg-background text-foreground shadow-xs",
          "hover:bg-muted hover:text-foreground",
          "active:bg-muted/80",
        ],
        primary: [
          "bg-primary text-primary-foreground shadow-xs",
          "hover:bg-primary/90",
          "active:bg-primary/80",
          undefined,
        ],
        secondary: [
          "bg-primary text-primary-foreground shadow-xs",
          "hover:bg-primary/90",
          "active:bg-primary/80",
          "disabled:bg-muted disabled:text-muted-foreground",
        ],
        "secondary-ghost": [
          "bg-transparent text-secondary-foreground",
          "hover:bg-secondary",
          "active:bg-secondary/80",
          "disabled:text-muted-foreground",
        ],
        "secondary-outline": [
          "!border-primary-foreground border text-secondary-foreground shadow-xs",
          "hover:border-ring hover:bg-secondary/50",
          "active:border-ring active:bg-secondary/80",
          "disabled:border-border disabled:text-muted-foreground",
        ],
      },
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export type ButtonProps = React.ComponentProps<"button"> &
  ButtonVariants & {
    asChild?: boolean | undefined;
    as?: ElementType | undefined;
    to?: string | undefined;
    icon?: React.ReactNode | undefined;
    /**
     * Renders a centered spinner overlay while keeping the button at its
     * natural width. Also disables interaction and sets aria-busy.
     */
    isLoading?: boolean | undefined;
    // Support anchor element props when as="a"
    href?: string | undefined;
    target?: string | undefined;
    rel?: string | undefined;
  } & SharedProps;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      testId,
      as,
      to,
      icon,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = as ?? (asChild ? Slot : "button");
    const { attached, position } = useGroup();

    let positionClasses = "rounded-lg";
    if (attached && position === "first") {
      positionClasses = "rounded-r-none rounded-l-lg border-r-0";
    } else if (attached && position === "last") {
      positionClasses = "rounded-r-lg rounded-l-none border-l-0";
    } else if (attached && position === "middle") {
      positionClasses = "rounded-none border-r-0 border-l-0";
    }

    const isDisabled = disabled || isLoading;

    // When asChild is used with Slot, we can only pass ONE child element
    // to satisfy React.Children.only(). In asChild mode, users must include
    // icons inside children instead of using the icon prop.
    const renderContent = () => {
      if (asChild) {
        return children;
      }

      // Normal button mode - can have children + icon prop
      const content = icon ? (
        <>
          {children}
          {icon}
        </>
      ) : (
        children
      );

      if (isLoading) {
        return (
          <>
            <span className="invisible contents">{content}</span>
            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </span>
          </>
        );
      }

      return content;
    };

    return (
      <Comp
        aria-busy={isLoading || undefined}
        className={cn(
          buttonVariants({ className, size, variant }),
          positionClasses,
          icon && "gap-2",
          isLoading && "relative",
          className
        )}
        data-loading={isLoading || undefined}
        data-slot="button"
        data-testid={testId}
        disabled={isDisabled}
        ref={ref}
        to={to}
        {...props}
      >
        {renderContent()}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
