'use client';

import {
  Checkbox as SDKCheckbox,
  CheckboxGroup as SDKCheckboxGroup,
  CheckboxIndicator as SDKCheckboxIndicator,
} from '@ui-sdk/react/checkbox';

import { CheckIcon, MinusIcon } from 'lucide-react';
import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
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
      className={(state) =>
        cn(
          'peer inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-input outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:bg-primary data-indeterminate:text-primary-foreground',
          typeof className === 'function' ? className(state) : className
        )
      }
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
      className={(state) =>
        cn('flex items-center justify-center', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { Checkbox, CheckboxGroup, CheckboxIndicator };
