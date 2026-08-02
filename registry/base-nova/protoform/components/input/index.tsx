/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: this is a complex component */
'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Eye, EyeOff, Minus, Plus } from 'lucide-react';
import React, { createContext, useEffect, useState } from 'react';

import { Button } from '@/registry/base-nova/protoform/components/button';
import { useFieldContext } from '@/registry/base-nova/protoform/components/field';
import { useGroup } from '@/registry/base-nova/protoform/components/group';
import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

export const inputVariants = cva(
  'placeholder:!text-muted-foreground !border-input flex w-full min-w-0 border bg-transparent text-base outline-none transition-colors [-moz-appearance:textfield] selection:bg-selection selection:text-selection-foreground file:inline-flex file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
  {
    variants: {
      size: {
        sm: 'h-7 px-2 py-1 text-sm file:h-5',
        md: 'h-8 px-2.5 py-1 file:h-6',
        lg: 'h-9 px-3 py-1 file:h-7',
      },
      variant: {
        standard: '',
        password: 'pr-10',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'standard',
    },
  }
);

const stepControlVariants = cva('flex items-center justify-center', {
  variants: {
    size: {
      sm: 'size-7 [&_svg]:size-3',
      md: 'size-8 [&_svg]:size-3.5',
      lg: 'size-9 [&_svg]:size-4',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const inputContainerVariants = cva('', {
  variants: {
    layout: {
      standard: 'relative flex items-center',
      password: 'relative flex w-full flex-1',
      number: 'flex items-center gap-2',
    },
  },
  defaultVariants: {
    layout: 'standard',
  },
});

export interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'>,
    VariantProps<typeof inputVariants>,
    SharedProps {
  children?: React.ReactNode;
  containerClassName?: string;
  showStepControls?: boolean;
}

function useInputState(value: InputProps['value'], defaultValue: InputProps['defaultValue']) {
  const [internalValue, setInternalValue] = useState<string>(value?.toString() || defaultValue?.toString() || '');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value.toString());
    }
  }, [value]);

  return { value: internalValue, setValue: setInternalValue, showPassword, setShowPassword };
}

function useNumberInputHandlers(
  value: string,
  setValue: React.Dispatch<React.SetStateAction<string>>,
  step: number,
  onChange?: React.ChangeEventHandler<HTMLInputElement>
) {
  const createChangeEvent = (newValue: string): React.ChangeEvent<HTMLInputElement> =>
    ({
      target: { value: newValue },
    }) as React.ChangeEvent<HTMLInputElement>;

  const increment = () => {
    const currentValue = Number.parseFloat(value) || 0;
    const newValue = (currentValue + step).toString();
    setValue(newValue);
    onChange?.(createChangeEvent(newValue));
  };

  const decrement = () => {
    const currentValue = Number.parseFloat(value) || 0;
    const newValue = (currentValue - step).toString();
    setValue(newValue);
    onChange?.(createChangeEvent(newValue));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange?.(e);
  };

  return { increment, decrement, handleInputChange };
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      showStepControls,
      size,
      variant,
      testId,
      children,
      containerClassName,
      readOnly,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const { value, setValue, showPassword, setShowPassword } = useInputState(props.value, defaultValue);
    const fieldCtx = useFieldContext();
    const [startWidth, setStartWidth] = useState<number | undefined>();
    const [endWidth, setEndWidth] = useState<number | undefined>();

    const isNumberInput = type === 'number';
    const isPasswordInput = type === 'password';
    const shouldShowControls = isNumberInput && showStepControls;
    const step = props.step ? Number(props.step) : 1;
    const inputVariant = isPasswordInput ? 'password' : variant;
    const { position: groupPosition, attached: groupAttached } = useGroup();
    const attached = groupAttached || isPasswordInput;

    const { increment, decrement, handleInputChange } = useNumberInputHandlers(value, setValue, step, props.onChange);

    // Map input size to a button icon size that fits comfortably inside the input
    // sm (h-8/32px) → icon-xs (24px), md (h-9/36px) → icon-sm (32px), lg (h-10/40px) → icon-sm (32px)
    const passwordToggleSize = size === 'sm' ? ('icon-xs' as const) : ('icon-sm' as const);

    let positionClasses = 'rounded-lg';
    if (attached && groupPosition === 'first') {
      positionClasses = 'rounded-r-none rounded-l-lg border-r-0';
    } else if (attached && groupPosition === 'last') {
      positionClasses = 'rounded-r-lg rounded-l-none border-l-0';
    } else if (attached && groupPosition === 'middle') {
      positionClasses = 'rounded-none border-r-0 border-l-0';
    }

    let inputType = type;
    if (isPasswordInput) {
      inputType = showPassword ? 'text' : 'password';
    }

    let layout: 'number' | 'password' | typeof variant = variant;
    if (shouldShowControls) {
      layout = 'number';
    } else if (isPasswordInput) {
      layout = 'password';
    }

    const inputElement = (
      <input
        {...props}
        aria-describedby={props['aria-describedby'] ?? fieldCtx.errorId}
        aria-invalid={props['aria-invalid'] ?? (fieldCtx.invalid || undefined)}
        className={cn(inputVariants({ size, variant: inputVariant }), positionClasses, className)}
        data-slot="input"
        data-testid={testId}
        onChange={isNumberInput ? handleInputChange : props.onChange}
        readOnly={readOnly}
        ref={ref}
        step={isNumberInput ? step : undefined}
        style={{
          paddingLeft: startWidth ? startWidth + 16 : undefined,
          paddingRight: endWidth ? endWidth + 16 : undefined,
        }}
        type={inputType}
        {...(isNumberInput ? { value } : props.value !== undefined ? { value: props.value } : { defaultValue })}
      />
    );

    return (
      <InputContext.Provider
        value={{
          startWidth,
          setStartWidth,
          endWidth,
          setEndWidth,
        }}
      >
        <div
          className={cn(
            inputContainerVariants({
              layout,
            }),
            containerClassName
          )}
        >
          {inputElement}
          {children}
          {isPasswordInput ? (
            <InputEnd className="pointer-events-auto">
              <Button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={props.disabled || readOnly}
                onClick={() => setShowPassword(!showPassword)}
                size={passwordToggleSize}
                type="button"
                variant="ghost"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </Button>
            </InputEnd>
          ) : null}
          {shouldShowControls ? (
            <div className="flex flex-row gap-1">
              <Button
                aria-label="Increase value"
                className={stepControlVariants({ size })}
                disabled={props.disabled || readOnly}
                onClick={increment}
                type="button"
                variant="outline"
              >
                <Plus />
              </Button>
              <Button
                aria-label="Decrease value"
                className={stepControlVariants({ size })}
                disabled={props.disabled || readOnly}
                onClick={decrement}
                type="button"
                variant="outline"
              >
                <Minus />
              </Button>
            </div>
          ) : null}
        </div>
      </InputContext.Provider>
    );
  }
);

const inputEndClassNames = 'absolute inset-y-0 right-2 z-10 flex items-center pointer-events-none';

const InputContext = createContext<{
  setStartWidth: (width: number) => void;
  setEndWidth: (width: number) => void;
  startWidth: number | undefined;
  endWidth: number | undefined;
}>({
  setStartWidth: () => {
    // Default no-op function
  },
  setEndWidth: () => {
    // Default no-op function
  },
  startWidth: undefined,
  endWidth: undefined,
});

const useInputContext = () => {
  const context = React.useContext(InputContext);
  if (!context) {
    throw new Error('useInputContext must be used within an InputContextProvider');
  }
  return context;
};

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

Input.displayName = 'Input';

export { Input, InputEnd, InputStart };
