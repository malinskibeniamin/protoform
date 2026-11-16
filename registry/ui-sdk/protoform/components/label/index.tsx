'use client';

import type React from 'react';
import { stateClassName } from '@/components/ui/shared/state-class-name';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { Label as SDKLabel } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/core-label';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

function Label({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKLabel>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKLabel
      {...definedProps(props)}
      className={stateClassName('text-sm leading-none font-medium', className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { Label };
