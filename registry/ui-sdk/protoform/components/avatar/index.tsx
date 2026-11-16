'use client';

import type React from 'react';
import { stateClassName } from '@/components/ui/shared/state-class-name';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import {
  Avatar as SDKAvatar,
  AvatarFallback as SDKAvatarFallback,
  AvatarImage as SDKAvatarImage,
} from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/core-avatar';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

function Avatar({
  className,
  testId,
  variant,
  size = 'default',
  ...props
}: UIProps<React.ComponentProps<typeof SDKAvatar>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKAvatar
      {...definedProps(props)}
      className={stateClassName(
        'group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten',
        className
      )}
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
      className={stateClassName(
        'flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs',
        className
      )}
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
      className={stateClassName('aspect-square size-full rounded-full object-cover', className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { AvatarBadge, AvatarGroup, AvatarGroupCount } from '@/components/ui/shared/avatar';
export { Avatar, AvatarFallback, AvatarImage };
