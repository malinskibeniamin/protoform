'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

function AttachmentAction({ className, variant, size = 'icon-xs', ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={className}
      data-slot="attachment-action"
      size={size}
      type="button"
      variant={variant ?? 'ghost'}
      {...props}
    />
  );
}
function AttachmentTrigger({ className, render, type, ...props }: useRender.ComponentProps<'button'>) {
  return useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(
      {
        type: render ? type : (type ?? 'button'),
        className: cn('absolute inset-0 z-10 outline-none', className),
      },
      props
    ),
    render,
    state: {
      slot: 'attachment-trigger',
    },
  });
}

export {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/shared/attachment';
export { AttachmentAction, AttachmentTrigger };
