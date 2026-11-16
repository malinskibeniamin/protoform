'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'xs',
  testId,
  ...props
}: React.ComponentProps<typeof Button> & SharedProps) {
  return (
    <Button
      className={className}
      data-size={size}
      size={size}
      testId={testId}
      type={type}
      variant={variant}
      {...props}
    />
  );
}

function InputGroupInput({ className, testId, ...props }: React.ComponentProps<'input'> & SharedProps) {
  return (
    <div className="flex-1">
      <Input className={className} data-slot="input-group-control" testId={testId} variant="group" {...props} />
    </div>
  );
}

const InputGroupTextarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'> & SharedProps>(
  ({ className, testId, ...props }, ref) => (
    <Textarea
      className={cn('flex-1', className)}
      data-slot="input-group-control"
      ref={ref}
      resize="none"
      testId={testId}
      variant="group"
      {...props}
    />
  )
);

InputGroupTextarea.displayName = 'InputGroupTextarea';

export {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from '@/components/ui/shared/input-group';
export { InputGroupButton, InputGroupInput, InputGroupTextarea };
