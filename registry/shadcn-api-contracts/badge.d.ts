import { useRender } from '@base-ui/react/use-render';
import type { VariantProps } from 'class-variance-authority';

declare const badgeVariants: (
  props?: {
    variant?: 'link' | 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | null | undefined;
  } & import('class-variance-authority/types').ClassProp
) => string;
declare function Badge({
  className,
  variant,
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>): ReturnType<typeof useRender>;

export { Badge, badgeVariants };
