'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import type { VariantProps } from 'class-variance-authority';
import { Separator } from '@/components/ui/separator';
import { buttonGroupVariants } from '@/components/ui/shared/button-group-variants';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

function ButtonGroup({
  className,
  orientation = 'horizontal',
  render,
  ...props
}: useRender.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: {
      ...mergeProps<'div'>({ role: 'group', className: cn(buttonGroupVariants({ orientation }), className) }, props),
      'data-orientation': orientation,
      'data-slot': 'button-group',
    },
  });
}
function ButtonGroupText({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(
          "flex items-center gap-2 rounded-lg border bg-muted px-2.5 text-sm font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: 'button-group-text',
    },
  });
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
