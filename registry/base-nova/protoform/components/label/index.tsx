'use client';

import { Label as SDKLabel } from '@ui-sdk/react/label';

import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
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
      className={(state) =>
        cn('text-sm leading-none font-medium', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { Label };
