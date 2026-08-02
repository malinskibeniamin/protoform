import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

const textareaVariants = cva(
  '!border-input flex w-full rounded-lg border bg-transparent text-base outline-none transition-colors selection:bg-selected selection:text-selected-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      size: {
        sm: 'min-h-12 px-2 py-1.5 text-sm',
        default: 'min-h-16 px-2.5 py-2',
        lg: 'min-h-20 px-3 py-2.5',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
        auto: 'field-sizing-content',
      },
    },
    defaultVariants: {
      size: 'default',
      resize: 'auto',
    },
  }
);

interface TextareaProps extends React.ComponentProps<'textarea'>, VariantProps<typeof textareaVariants>, SharedProps {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, resize, testId, ...props }, ref) => (
    <textarea
      className={cn(textareaVariants({ size, resize }), className)}
      data-slot="textarea"
      data-testid={testId}
      ref={ref}
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
