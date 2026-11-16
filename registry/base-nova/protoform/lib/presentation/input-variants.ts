import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  'flex w-full min-w-0 border !border-input bg-transparent text-base transition-colors outline-none [-moz-appearance:textfield] selection:bg-selection selection:text-selection-foreground file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:!text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
  {
    defaultVariants: {
      size: 'md',
      variant: 'standard',
    },
    variants: {
      size: {
        lg: 'h-9 px-3 py-1 file:h-7',
        md: 'h-8 px-2.5 py-1 file:h-6',
        sm: 'h-7 px-2 py-1 text-sm file:h-5',
      },
      variant: {
        group: 'rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent',
        password: 'pr-10',
        standard: '',
      },
    },
  }
);

export const inputContainerVariants = cva('', {
  defaultVariants: {
    layout: 'standard',
  },
  variants: {
    layout: {
      number: 'flex items-center gap-2',
      password: 'relative flex w-full flex-1',
      standard: 'relative flex items-center',
    },
  },
});
