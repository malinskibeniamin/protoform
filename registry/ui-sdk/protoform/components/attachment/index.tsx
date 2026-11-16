'use client';

import { mergeProps, type PartProps, renderElement } from '@ui-sdk/react/primitive';
import type React from 'react';
import { Button } from '@/components/ui/sdk/button/index';
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
function AttachmentTrigger({ className, render, type, ...props }: PartProps<'button'>) {
  return renderElement(
    'button',
    {
      ...mergeProps(
        {
          type: render ? type : (type ?? 'button'),
          className: cn('absolute inset-0 z-10 outline-none', className),
        },
        props
      ),
      'data-slot': 'attachment-trigger',
    },
    render,
    {
      slot: 'attachment-trigger',
    }
  );
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
