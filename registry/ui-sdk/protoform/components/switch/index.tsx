'use client';

import type React from 'react';
import { stateClassName } from '@/components/ui/shared/state-class-name';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import {
  Switch as SDKSwitch,
  SwitchThumb as SDKSwitchThumb,
} from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/core-switch';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

function Switch({
  children,
  className,
  testId,
  variant,
  size = 'default',
  ...props
}: UIProps<React.ComponentProps<typeof SDKSwitch>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSwitch
      {...definedProps(props)}
      className={stateClassName(
        'group inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-input outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-checked:bg-primary',
        className
      )}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    >
      {children ?? <SwitchThumb />}
    </SDKSwitch>
  );
}

function SwitchThumb({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKSwitchThumb>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKSwitchThumb
      {...definedProps(props)}
      className={stateClassName(
        'pointer-events-none block size-4 rounded-full bg-background transition-transform group-data-checked:translate-x-4 rtl:group-data-checked:-translate-x-4',
        className
      )}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { Switch, SwitchThumb };
