'use client';

import type React from 'react';
import { stateClassName } from '@/components/ui/shared/state-class-name';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { Separator as SDKSeparator } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/core-separator';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

function Separator({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSeparator>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSeparator
      {...definedProps(props)}
      className={stateClassName(
        'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className
      )}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { Separator };
