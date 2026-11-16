import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import type { VariantProps } from 'class-variance-authority';

declare const toggleVariants: (
  props?: {
    variant?: 'default' | 'outline' | null | undefined;
    size?: 'default' | 'sm' | 'lg' | null | undefined;
  } & import('class-variance-authority/types').ClassProp
) => string;
declare function Toggle({
  className,
  variant,
  size,
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>): import('react').JSX.Element;

export { Toggle, toggleVariants };
