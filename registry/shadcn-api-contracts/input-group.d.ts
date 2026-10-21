import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { Button } from './button';

declare function InputGroup({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
declare const inputGroupAddonVariants: (
  props?: {
    align?: 'inline-end' | 'inline-start' | 'block-end' | 'block-start' | null | undefined;
  } & import('class-variance-authority/types').ClassProp
) => string;
declare function InputGroupAddon({
  className,
  align,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>): React.JSX.Element;
declare const inputGroupButtonVariants: (
  props?: {
    size?: 'sm' | 'xs' | 'icon-xs' | 'icon-sm' | null | undefined;
  } & import('class-variance-authority/types').ClassProp
) => string;
declare function InputGroupButton({
  className,
  type,
  variant,
  size,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size' | 'type'> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: 'button' | 'submit' | 'reset';
  }): React.JSX.Element;
declare function InputGroupText({ className, ...props }: React.ComponentProps<'span'>): React.JSX.Element;
declare function InputGroupInput({ className, ...props }: React.ComponentProps<'input'>): React.JSX.Element;
declare function InputGroupTextarea({ className, ...props }: React.ComponentProps<'textarea'>): React.JSX.Element;

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea };
