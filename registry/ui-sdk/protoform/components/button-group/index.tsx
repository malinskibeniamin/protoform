'use client';

import { mergeProps, type PartProps, renderElement } from '@ui-sdk/react/primitive';
import type { VariantProps } from 'class-variance-authority';
import { Separator } from '@/components/ui/sdk/separator/index';
import { buttonGroupVariants } from '@/components/ui/shared/button-group-variants';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

function ButtonGroup({
  className,
  orientation = 'horizontal',
  render,
  ...props
}: PartProps<'div'> & VariantProps<typeof buttonGroupVariants>) {
  return renderElement(
    'div',
    {
      ...mergeProps({ role: 'group', className: cn(buttonGroupVariants({ orientation }), className) }, props),
      'data-orientation': orientation,
      'data-slot': 'button-group',
    },
    render
  );
}
function ButtonGroupText({ className, render, ...props }: PartProps<'div'>) {
  return renderElement(
    'div',
    {
      ...mergeProps(
        {
          className: cn(
            "flex items-center gap-2 rounded-lg border bg-muted px-2.5 text-sm font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
            className
          ),
        },
        props
      ),
      'data-slot': 'button-group-text',
    },
    render,
    {
      slot: 'button-group-text',
    }
  );
}
function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      className={className}
      data-slot="button-group-separator"
      orientation={orientation}
      variant="group"
      {...props}
    />
  );
}

export { buttonGroupVariants } from '@/components/ui/shared/button-group-variants';
export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText };
