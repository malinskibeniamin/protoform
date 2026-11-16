import { cva } from 'class-variance-authority';

export const textareaVariants = cva(
  'flex w-full rounded-lg border !border-input bg-transparent text-base transition-colors outline-none selection:bg-selected selection:text-selected-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
  {
    defaultVariants: {
      resize: 'auto',
      size: 'default',
    },
    variants: {
      variant: {
        group: 'rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent',
      },
      resize: {
        auto: 'field-sizing-content',
        both: 'resize',
        horizontal: 'resize-x',
        none: 'resize-none',
        vertical: 'resize-y',
      },
      size: {
        default: 'min-h-16 px-2.5 py-2',
        lg: 'min-h-20 px-3 py-2.5',
        sm: 'min-h-12 px-2 py-1.5 text-sm',
      },
    },
  }
);
