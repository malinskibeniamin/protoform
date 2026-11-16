import type { VariantProps } from 'class-variance-authority';
import React from 'react';
import { textareaVariants } from '@/components/ui/shared/textarea-variants';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

interface TextareaProps extends React.ComponentProps<'textarea'>, VariantProps<typeof textareaVariants>, SharedProps {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, resize, variant, testId, ...props }, ref) => (
    <textarea
      className={cn(textareaVariants({ resize, size, variant }), className)}
      data-slot="textarea"
      data-testid={testId}
      ref={ref}
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';

export { textareaVariants } from '@/components/ui/shared/textarea-variants';
export { Textarea };
