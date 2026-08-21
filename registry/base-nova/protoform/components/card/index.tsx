import { cva, type VariantProps } from "class-variance-authority";
import { type MotionProps, motion } from "motion/react";
import React from "react";

import { Heading, Text } from "@/registry/base-nova/protoform/components/typography";
import { cn, type SharedProps } from "@/registry/base-nova/protoform/lib/utils";

const cardVariants = cva(
  "flex min-w-0 flex-col rounded-lg border border-border border-solid bg-card text-card-foreground",
  {
    defaultVariants: {
      size: "md",
      variant: "elevated",
    },
    variants: {
      size: {
        full: "w-full gap-4 px-8 py-6",
        lg: "max-w-lg gap-4 px-10 py-8",
        md: "max-w-md gap-4 px-8 py-6",
        sm: "max-w-sm gap-2 px-6 py-4",
        xl: "max-w-xl gap-6 px-12 py-10",
      },
      variant: {
        elevated: "shadow-elevated",
        ghost: "border-0 bg-transparent shadow-none dark:bg-transparent",
        outlined: "border-1",
        standard: "",
      },
    },
  }
);

export type CardVariant = VariantProps<typeof cardVariants>["variant"];
export type CardSize = VariantProps<typeof cardVariants>["size"];

type BaseCardProps = SharedProps & {
  size?: CardSize;
  variant?: CardVariant;
  className?: string;
};

type StaticCardProps = BaseCardProps & Omit<React.ComponentProps<"div">, keyof BaseCardProps> & { animated?: false };
type AnimatedCardProps = BaseCardProps & Omit<MotionProps, keyof BaseCardProps> & { animated: true };

export type CardProps = StaticCardProps | AnimatedCardProps;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, size, variant, testId, animated = false, ...props }, ref) => {
    const cardClassName = cn(cardVariants({ size, variant }), className);

    if (animated) {
      return (
        <motion.div
          className={cardClassName}
          data-slot="card"
          data-testid={testId}
          ref={ref}
          {...(props as Omit<AnimatedCardProps, "animated" | "className" | "size" | "variant" | "testId">)}
        />
      );
    }

    return (
      <div
        className={cardClassName}
        data-slot="card"
        data-testid={testId}
        ref={ref}
        {...(props as Omit<StaticCardProps, "animated" | "className" | "size" | "variant" | "testId">)}
      />
    );
  }
);

Card.displayName = "Card";

const cardHeaderVariants = cva(
  "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
  {
    defaultVariants: {
      padding: "none",
      spacing: "normal",
    },
    variants: {
      padding: {
        lg: "px-8",
        md: "px-6",
        none: "",
        sm: "px-3",
      },
      spacing: {
        loose: "gap-2",
        normal: "gap-1.5",
        tight: "gap-1",
      },
    },
  }
);

interface CardHeaderProps extends React.ComponentProps<"div">, VariantProps<typeof cardHeaderVariants>, SharedProps {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, spacing, padding, testId, ...props }, ref) => (
    <div
      className={cn(cardHeaderVariants({ padding, spacing }), className)}
      data-slot="card-header"
      data-testid={testId}
      ref={ref}
      {...props}
    />
  )
);

CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<"div"> & SharedProps & { level?: 1 | 2 | 3 | 4 }
>(({ className, level = 4, testId, children, ...props }, ref) => {
  let content: React.ReactNode = null;
  if (children) {
    content = typeof children === "string" ? <Heading level={level}>{children}</Heading> : children;
  }

  return (
    <div className={className} data-slot="card-title" data-testid={testId} ref={ref} {...props}>
      {content}
    </div>
  );
});

CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & SharedProps>(
  ({ className, testId, children, ...props }, ref) => {
    let content: React.ReactNode = null;
    if (children) {
      content = typeof children === "string" ? <Text>{children}</Text> : children;
    }

    return (
      <div
        className={cn("text-muted-foreground text-sm", className)}
        data-slot="card-description"
        data-testid={testId}
        ref={ref}
        {...props}
      >
        {content}
      </div>
    );
  }
);

CardDescription.displayName = "CardDescription";

const CardAction = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & SharedProps>(
  ({ className, testId, ...props }, ref) => (
    <div
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      data-slot="card-action"
      data-testid={testId}
      ref={ref}
      {...props}
    />
  )
);

CardAction.displayName = "CardAction";

const cardContentVariants = cva("", {
  defaultVariants: {
    padding: "none",
    space: "md",
  },
  variants: {
    padding: {
      lg: "px-8",
      md: "px-6",
      none: "",
      sm: "px-3",
    },
    space: {
      lg: "space-y-6",
      md: "space-y-4",
      none: "",
      sm: "space-y-2",
    },
  },
});

interface CardContentProps extends React.ComponentProps<"div">, VariantProps<typeof cardContentVariants>, SharedProps {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding, space, testId, ...props }, ref) => (
    <div
      className={cn(cardContentVariants({ padding, space }), className)}
      data-slot="card-content"
      data-testid={testId}
      ref={ref}
      {...props}
    />
  )
);

CardContent.displayName = "CardContent";

const cardFooterVariants = cva("flex items-center [.border-t]:pt-6", {
  defaultVariants: {
    direction: "row",
    gap: "sm",
    justify: "between",
    padding: "none",
  },
  variants: {
    direction: {
      column: "flex-col",
      row: "flex-row",
    },
    gap: {
      lg: "gap-6",
      md: "gap-4",
      none: "",
      sm: "gap-2",
    },
    justify: {
      around: "justify-around",
      between: "justify-between",
      center: "justify-center",
      end: "justify-end",
      start: "justify-start",
    },
    padding: {
      lg: "px-8",
      md: "px-6",
      none: "",
      sm: "px-3",
    },
  },
});

interface CardFooterProps extends React.ComponentProps<"div">, VariantProps<typeof cardFooterVariants>, SharedProps {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, direction, justify, gap, padding, testId, ...props }, ref) => (
    <div
      className={cn(cardFooterVariants({ direction, gap, justify, padding }), className)}
      data-slot="card-footer"
      data-testid={testId}
      ref={ref}
      {...props}
    />
  )
);

CardFooter.displayName = "CardFooter";

// Form-specific layout helpers
const cardFormVariants = cva("grid w-full items-center", {
  defaultVariants: {
    gap: "md",
  },
  variants: {
    gap: {
      lg: "gap-6",
      md: "gap-4",
      sm: "gap-2",
    },
  },
});

interface CardFormProps extends React.ComponentProps<"div">, VariantProps<typeof cardFormVariants>, SharedProps {}

const CardForm = React.forwardRef<HTMLDivElement, CardFormProps>(({ className, gap, testId, ...props }, ref) => (
  <div className={cn(cardFormVariants({ gap }), className)} data-testid={testId} ref={ref} {...props} />
));

CardForm.displayName = "CardForm";

const cardFieldVariants = cva("flex flex-col", {
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

interface CardFieldProps extends React.ComponentProps<"div">, VariantProps<typeof cardFieldVariants>, SharedProps {}

const CardField = React.forwardRef<HTMLDivElement, CardFieldProps>(({ className, spacing, testId, ...props }, ref) => (
  <div className={cn(cardFieldVariants({ spacing }), className)} data-testid={testId} ref={ref} {...props} />
));

CardField.displayName = "CardField";

export { Card, CardAction, CardContent, CardDescription, CardField, CardFooter, CardForm, CardHeader, CardTitle };
