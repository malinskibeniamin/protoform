import { cva } from 'class-variance-authority';

export const alertVariants = cva(
  'group/alert relative grid w-full grid-cols-[0_minmax(0,1fr)] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[calc(var(--spacing)*4)_minmax(0,1fr)] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    defaultVariants: {
      variant: 'info',
    },
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          '!border-destructive/20 bg-destructive/10 text-destructive *:data-[slot=alert-description]:text-destructive/90 [&>href]:text-current [&>svg]:text-current',
        info: 'bg-card text-card-foreground',
        success: 'border-primary/20 bg-primary/5 text-foreground [&>svg]:text-primary',
        warning: 'border-primary/20 bg-muted text-foreground [&>svg]:text-primary',
      },
    },
  }
);
