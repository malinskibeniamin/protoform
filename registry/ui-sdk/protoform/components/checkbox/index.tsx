'use client';

import { CheckIcon, MinusIcon } from 'lucide-react';
import type React from 'react';
import { stateClassName } from '@/components/ui/shared/state-class-name';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import {
  Checkbox as SDKCheckbox,
  CheckboxGroup as SDKCheckboxGroup,
  CheckboxIndicator as SDKCheckboxIndicator,
} from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/core-checkbox';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

function Checkbox({
  children,
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCheckbox>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCheckbox
      {...definedProps(props)}
      className={stateClassName(
        'peer inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-input outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:bg-primary data-indeterminate:text-primary-foreground',
        className
      )}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    >
      {children ?? (
        <SDKCheckboxIndicator>
          {(state) => (state.indeterminate ? <MinusIcon className="size-3" /> : <CheckIcon className="size-3" />)}
        </SDKCheckboxIndicator>
      )}
    </SDKCheckbox>
  );
}

const CheckboxGroup = SDKCheckboxGroup;

function CheckboxIndicator({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKCheckboxIndicator>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKCheckboxIndicator
      {...definedProps(props)}
      className={stateClassName('flex items-center justify-center', className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { Checkbox, CheckboxGroup, CheckboxIndicator };
