'use client';

import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

function Avatar({
  className,
  size = 'default',
  ...props
}: AvatarPrimitive.Root.Props & {
  size?: 'default' | 'sm' | 'lg';
}) {
  return (
    <AvatarPrimitive.Root
      className={(state) =>
        cn(
          'group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-slot="avatar"
      {...props}
    />
  );
}
function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      className={(state) =>
        cn(
          'aspect-square size-full rounded-full object-cover',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-slot="avatar-image"
      {...props}
    />
  );
}
function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      className={(state) =>
        cn(
          'flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-slot="avatar-fallback"
      {...props}
    />
  );
}

export { AvatarBadge, AvatarGroup, AvatarGroupCount } from '@/components/ui/shared/avatar';
export { Avatar, AvatarFallback, AvatarImage };
