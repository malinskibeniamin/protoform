import type { VariantProps } from 'class-variance-authority';
import { InfoIcon } from 'lucide-react';
import type React from 'react';
import { alertVariants } from '@/components/ui/shared/alert-variants';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

const DEFAULT_ALERT_ICON = <InfoIcon />;
const Alert = ({
  className,
  variant,
  testId,
  icon = DEFAULT_ALERT_ICON,
  children,
  ref,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof alertVariants> &
  SharedProps & { icon?: React.ReactNode } & { ref?: React.Ref<HTMLDivElement> | undefined }) => (
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
);
Alert.displayName = 'Alert';
const AlertTitle = ({
  className,
  testId,
  ref,
  ...props
}: React.ComponentProps<'div'> & SharedProps & { ref?: React.Ref<HTMLDivElement> | undefined }) => (
  <div
    className={cn(
      'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight group-has-data-[slot=alert-action]/alert:line-clamp-none',
      className
    )}
    data-slot="alert-title"
    data-testid={testId}
    ref={ref}
    {...props}
  />
);
AlertTitle.displayName = 'AlertTitle';
const AlertDescription = ({
  className,
  testId,
  ref,
  ...props
}: React.ComponentProps<'div'> & SharedProps & { ref?: React.Ref<HTMLDivElement> | undefined }) => (
  <div
    className={cn(
      'col-start-2 grid w-full min-w-0 justify-items-start gap-1 text-sm wrap-anywhere text-muted-foreground [&_p]:leading-relaxed [&_pre]:w-full',
      className
    )}
    data-slot="alert-description"
    data-testid={testId}
    ref={ref}
    {...props}
  />
);
AlertDescription.displayName = 'AlertDescription';
function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('absolute top-2 right-2', className)} data-slot="alert-action" {...props} />;
}

export { Alert, AlertAction, AlertDescription, AlertTitle };
