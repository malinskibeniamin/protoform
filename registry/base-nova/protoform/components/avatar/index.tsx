'use client';

import {
  Avatar as SDKAvatar,
  AvatarFallback as SDKAvatarFallback,
  AvatarImage as SDKAvatarImage,
} from '@ui-sdk/react/avatar';

import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

function Avatar({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKAvatar>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKAvatar
      {...definedProps(props)}
      className={(state) =>
        cn(
          'relative flex size-8 shrink-0 overflow-hidden rounded-full',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function AvatarFallback({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKAvatarFallback>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKAvatarFallback
      {...definedProps(props)}
      className={(state) =>
        cn(
          'flex size-full items-center justify-center rounded-full bg-muted',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function AvatarImage({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKAvatarImage>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKAvatarImage
      {...definedProps(props)}
      className={(state) =>
        cn('aspect-square size-full object-cover', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage };

export function AvatarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div {...props} className={cn('flex flex-col gap-2', className)} data-slot="avatar-group" />;
}

export function AvatarBadge({ className, ...props }: React.ComponentProps<'div'>) {
  return <div {...props} className={cn('flex flex-col gap-2', className)} data-slot="avatar-badge" />;
}

export function AvatarGroupCount({ className, ...props }: React.ComponentProps<'div'>) {
  return <div {...props} className={cn('flex flex-col gap-2', className)} data-slot="avatar-group-count" />;
}
