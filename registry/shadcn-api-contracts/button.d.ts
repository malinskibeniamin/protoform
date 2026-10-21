import { Button as ButtonPrimitive } from '@base-ui/react/button';
import type { VariantProps } from 'class-variance-authority';

declare const buttonVariants: (
  props?: {
    variant?: 'link' | 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | null | undefined;
    size?: 'default' | 'sm' | 'xs' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg' | null | undefined;
  } & import('class-variance-authority/types').ClassProp
) => string;
declare function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>): import('react').JSX.Element;

export { Button, buttonVariants };
