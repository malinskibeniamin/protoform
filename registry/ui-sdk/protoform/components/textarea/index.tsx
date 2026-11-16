import type { VariantProps } from 'class-variance-authority';
import type React from 'react';
import { textareaVariants } from '@/components/ui/shared/textarea-variants';
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { Textarea as SDKTextarea } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/core-textarea';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

interface TextareaProps extends React.ComponentProps<'textarea'>, VariantProps<typeof textareaVariants>, SharedProps {}

function TextareaPrimitive({
  value,
  defaultValue,
  onSubmit: _onSubmit,
  ...props
}: React.ComponentProps<'textarea'> & { onValueChange?: React.ComponentProps<typeof SDKTextarea>['onValueChange'] }) {
  return (
    <SDKTextarea
      {...definedProps(props)}
      {...(value === undefined ? {} : { value: String(value) })}
      {...(defaultValue === undefined ? {} : { defaultValue: String(defaultValue) })}
    />
  );
}
const Textarea = ({
  className,
  size,
  resize,
  variant,
  testId,
  ref,
  ...props
}: TextareaProps & { ref?: React.Ref<HTMLTextAreaElement> | undefined }) => (
  <TextareaPrimitive
    className={cn(textareaVariants({ resize, size, variant }), className)}
    data-slot="textarea"
    data-testid={testId ?? props['data-testid']}
    ref={ref}
    {...props}
  />
);

Textarea.displayName = 'Textarea';

export { textareaVariants } from '@/components/ui/shared/textarea-variants';
export { Textarea };
