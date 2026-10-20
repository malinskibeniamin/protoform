import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';
import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { toggleVariants } from './toggle';

declare function ToggleGroup({
  className,
  variant,
  size,
  spacing,
  orientation,
  children,
  ...props
}: ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: 'horizontal' | 'vertical';
  }): React.JSX.Element;
declare function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>): React.JSX.Element;

export { ToggleGroup, ToggleGroupItem };
