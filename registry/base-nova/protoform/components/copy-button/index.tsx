"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, CopyIcon } from "lucide-react";
import { AnimatePresence, type HTMLMotionProps, motion } from "motion/react";
import React from "react";

import { cn } from "@/registry/base-nova/protoform/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
    variants: {
      size: {
        icon: "size-9",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        md: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
      },
      variant: {
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        outline:
          "!border-outline-primary border text-primary-inverse shadow-xs hover:border-outline-primary-hover hover:bg-primary-alpha-subtle active:border-outline-primary-pressed active:bg-primary-alpha-subtle-default disabled:border-outline-inverse-disabled disabled:text-disabled",
        primary: "bg-secondary text-inverse shadow-xs hover:bg-secondary/80",
        secondary: "bg-primary text-inverse shadow-xs hover:bg-primary/90",
      },
    },
  }
);

type CopyButtonProps = Omit<HTMLMotionProps<"button">, "onCopy" | "children"> &
  VariantProps<typeof buttonVariants> & {
    content?: string;
    delay?: number;
    onCopy?: (content: string) => void;
    isCopied?: boolean;
    onCopyChange?: (isCopied: boolean) => void;
    testId?: string;
    children?: React.ReactNode;
  };

function CopyButton({
  content,
  className,
  size,
  variant,
  delay = 3000,
  onClick,
  onCopy,
  isCopied,
  onCopyChange,
  testId,
  children,
  ...props
}: CopyButtonProps) {
  const [localIsCopied, setLocalIsCopied] = React.useState(false);
  const [copyError, setCopyError] = React.useState<string>();
  const copied = isCopied ?? localIsCopied;
  const Icon = copied ? CheckIcon : CopyIcon;

  const handleIsCopied = (isCopiedState: boolean) => {
    if (isCopied === undefined) {
      setLocalIsCopied(isCopiedState);
    }
    onCopyChange?.(isCopiedState);
  };

  const handleCopy = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (copied) {
      return;
    }
    if (content) {
      setCopyError(undefined);
      navigator.clipboard
        .writeText(content)
        .then(() => {
          handleIsCopied(true);
          setTimeout(() => handleIsCopied(false), delay);
          onCopy?.(content);
        })
        .catch((error: unknown) => {
          setCopyError(error instanceof Error ? error.message : "Clipboard access failed.");
          handleIsCopied(false);
        });
    }
    onClick?.(event);
  };

  return (
    <>
      <motion.button
        className={cn(buttonVariants({ size, variant }), className)}
        data-slot="copy-button"
        data-testid={testId}
        onClick={handleCopy}
        type="button"
        {...props}
      >
        <AnimatePresence mode="wait">
          <motion.span
            animate={{ opacity: 1, scale: 1 }}
            data-slot="copy-button-icon"
            exit={{ opacity: 0, scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.95 }}
            key={copied ? "check" : "copy"}
            transition={{ duration: 0.15 }}
          >
            <Icon />
          </motion.span>
        </AnimatePresence>
        {children}
      </motion.button>
      {copyError ? (
        <span aria-live="assertive" className="sr-only" role="alert">
          {copyError}
        </span>
      ) : null}
    </>
  );
}

export { buttonVariants, CopyButton, type CopyButtonProps };
