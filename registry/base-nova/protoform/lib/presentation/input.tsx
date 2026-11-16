'use client';

import type { VariantProps } from 'class-variance-authority';
import { Eye, EyeOff, Minus, Plus } from 'lucide-react';
import React, { createContext, useEffect } from 'react';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';
import type { GroupPosition } from './group';
import type { inputVariants } from './input-variants';

type InputControlButton = React.ComponentType<{
  'aria-label': string;
  children: React.ReactNode;
  disabled?: boolean | undefined;
  onClick: () => void;
  size: 'icon-lg' | 'icon' | 'icon-sm' | 'icon-xs';
  type: 'button';
  variant: 'ghost' | 'outline';
}>;

const stepControlSizes = { lg: 'icon-lg', md: 'icon', sm: 'icon-sm' } as const;

export interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'>,
    Omit<VariantProps<typeof inputVariants>, 'size'>,
    SharedProps {
  children?: React.ReactNode;
  containerClassName?: string | undefined;
  showStepControls?: boolean | undefined;
  size?: VariantProps<typeof inputVariants>['size'] | number;
}

function dispatchInputChange(input: HTMLInputElement | null, newValue: string): void {
  if (!input) {
    return;
  }
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  if (!descriptor?.set) {
    throw new Error('The input does not expose a native value setter.');
  }
  descriptor.set.call(input, newValue);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function useNumberInputHandlers(
  value: string,
  setValue: React.Dispatch<React.SetStateAction<string>>,
  step: number,
  inputRef: React.RefObject<HTMLInputElement | null>,
  onChange?: React.ChangeEventHandler<HTMLInputElement>
) {
  const increment = () => {
    const currentValue = Number.parseFloat(value) || 0;
    const newValue = (currentValue + step).toString();
    dispatchInputChange(inputRef.current, newValue);
  };

  const decrement = () => {
    const currentValue = Number.parseFloat(value) || 0;
    const newValue = (currentValue - step).toString();
    dispatchInputChange(inputRef.current, newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange?.(e);
  };

  return { decrement, handleInputChange, increment };
}

function getInputGroupClasses(attached: boolean, groupPosition: GroupPosition | undefined) {
  let positionClasses = 'rounded-lg';
  if (attached && groupPosition === 'first') {
    positionClasses = 'rounded-r-none rounded-l-lg border-r-0';
  } else if (attached && groupPosition === 'last') {
    positionClasses = 'rounded-r-lg rounded-l-none border-l-0';
  } else if (attached && groupPosition === 'middle') {
    positionClasses = 'rounded-none border-r-0 border-l-0';
  }
  return positionClasses;
}

function getInputMode(
  type: InputProps['type'],
  variant: InputProps['variant'],
  showPassword: boolean,
  showStepControls: InputProps['showStepControls']
) {
  const isPasswordInput = type === 'password';
  const shouldShowControls = type === 'number' && showStepControls;
  let inputType = type;
  if (isPasswordInput) {
    inputType = showPassword ? 'text' : 'password';
  }

  let layout: 'number' | 'password' | 'standard' | null | undefined = variant === 'group' ? 'standard' : variant;
  if (shouldShowControls) {
    layout = 'number';
  } else if (isPasswordInput) {
    layout = 'password';
  }
  const inputVariant = isPasswordInput && variant !== 'group' ? 'password' : variant;
  return { inputType, inputVariant, layout };
}

function getInputValueProps(
  isNumberInput: boolean,
  value: string,
  controlledValue: InputProps['value'],
  defaultValue: InputProps['defaultValue']
) {
  let inputValueProps: Pick<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'value'>;
  if (isNumberInput) {
    inputValueProps = { value };
  } else if (controlledValue === undefined) {
    inputValueProps = { defaultValue };
  } else {
    inputValueProps = { value: controlledValue };
  }
  return inputValueProps;
}

function PasswordVisibilityControl({
  Button,
  size,
  disabled,
  showPassword,
  onToggle,
}: {
  Button: InputControlButton;
  size: VariantProps<typeof inputVariants>['size'];
  disabled: InputProps['disabled'];
  showPassword: boolean;
  onToggle: () => void;
}) {
  const passwordToggleSize = size === 'sm' ? 'icon-xs' : 'icon-sm';
  return (
    <InputEnd className="pointer-events-auto">
      <Button
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        disabled={disabled}
        onClick={onToggle}
        size={passwordToggleSize}
        type="button"
        variant="ghost"
      >
        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
      </Button>
    </InputEnd>
  );
}

function NumberInputControls({
  Button,
  size,
  disabled,
  increment,
  decrement,
}: {
  Button: InputControlButton;
  size: VariantProps<typeof inputVariants>['size'];
  disabled: InputProps['disabled'];
  increment: () => void;
  decrement: () => void;
}) {
  const controlSize = stepControlSizes[size ?? 'md'];
  return (
    <div className="flex flex-row gap-1">
      <Button
        aria-label="Increase value"
        disabled={disabled}
        onClick={increment}
        size={controlSize}
        type="button"
        variant="outline"
      >
        <Plus />
      </Button>
      <Button
        aria-label="Decrease value"
        disabled={disabled}
        onClick={decrement}
        size={controlSize}
        type="button"
        variant="outline"
      >
        <Minus />
      </Button>
    </div>
  );
}

function getInputSizes(requestedSize: InputProps['size']) {
  return {
    size: typeof requestedSize === 'number' ? undefined : requestedSize,
    nativeSize: typeof requestedSize === 'number' ? requestedSize : undefined,
  };
}

const inputEndClassNames = 'absolute inset-y-0 right-2 z-10 flex items-center pointer-events-none';

const InputContext = createContext<{
  setStartWidth: (width: number) => void;
  setEndWidth: (width: number) => void;
  startWidth: number | undefined;
  endWidth: number | undefined;
}>({
  endWidth: undefined,
  setEndWidth: () => undefined,
  setStartWidth: () => undefined,
  startWidth: undefined,
});

const useInputContext = () => React.useContext(InputContext);

const InputStart = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => {
  const { setStartWidth } = useInputContext();
  const startRef = React.useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setStartWidth(startRef.current?.offsetWidth ?? 0);
  }, [setStartWidth]);

  return (
    <span
      className={cn('pointer-events-none absolute inset-y-0 left-2 z-10 flex items-center', className)}
      ref={startRef}
      {...props}
    >
      {children}
    </span>
  );
};

const InputEnd = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => {
  const { setEndWidth } = useInputContext();
  const endRef = React.useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setEndWidth(endRef.current?.offsetWidth ?? 0);
  }, [setEndWidth]);

  return (
    <span className={cn(inputEndClassNames, className)} ref={endRef} {...props}>
      {children}
    </span>
  );
};

export {
  getInputGroupClasses,
  getInputMode,
  getInputSizes,
  getInputValueProps,
  InputContext,
  InputEnd,
  InputStart,
  NumberInputControls,
  PasswordVisibilityControl,
  useNumberInputHandlers,
};
