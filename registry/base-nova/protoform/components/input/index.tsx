'use client';

import type { CSSProperties } from 'react';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFieldContext } from '@/components/ui/field';
import { useGroup } from '@/components/ui/group';
import type { InputProps } from '@/components/ui/shared/input';
import {
  getInputGroupClasses,
  getInputMode,
  getInputSizes,
  getInputValueProps,
  InputContext,
  NumberInputControls,
  PasswordVisibilityControl,
  useNumberInputHandlers,
} from '@/components/ui/shared/input';
import { inputContainerVariants, inputVariants } from '@/components/ui/shared/input-variants';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

function useInputState(value: InputProps['value'], defaultValue: InputProps['defaultValue']) {
  const [internalValue, setInternalValue] = useState<string>(() => String(value ?? defaultValue ?? ''));
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value.toString());
    }
  }, [value]);

  return { setShowPassword, setValue: setInternalValue, showPassword, value: internalValue };
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      showStepControls,
      size: requestedSize,
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
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => {
      const input = inputRef.current;
      if (!input) {
        throw new Error('The input ref is not attached.');
      }
      return input;
    }, []);
    const { size, nativeSize } = getInputSizes(requestedSize);
    const { value, setValue, showPassword, setShowPassword } = useInputState(props.value, defaultValue);
    const fieldCtx = useFieldContext();
    const [startWidth, setStartWidth] = useState<number | undefined>();
    const [endWidth, setEndWidth] = useState<number | undefined>();
    const inputContextValue = React.useMemo(
      () => ({ endWidth, setEndWidth, setStartWidth, startWidth }),
      [endWidth, startWidth]
    );

    const isNumberInput = type === 'number';
    const isPasswordInput = type === 'password';
    const shouldShowControls = isNumberInput && showStepControls;
    const step = props.step ? Number(props.step) : 1;
    const { position: groupPosition, attached: groupAttached } = useGroup();
    const attached = groupAttached || isPasswordInput;

    const { increment, decrement, handleInputChange } = useNumberInputHandlers(
      value,
      setValue,
      step,
      inputRef,
      props.onChange
    );

    const controlsDisabled = props.disabled || readOnly;

    const positionClasses = getInputGroupClasses(attached, groupPosition);

    const { inputType, inputVariant, layout } = getInputMode(type, variant, showPassword, showStepControls);

    const inputValueProps = getInputValueProps(isNumberInput, value, props.value, defaultValue);

    const adornmentStyle: CSSProperties & Record<`--${string}`, string | number | undefined> = {
      '--input-start-padding': `${(startWidth ?? 0) + 16}px`,
      '--input-end-padding': `${(endWidth ?? 0) + 16}px`,
    };
    const inputElement = (
      <input
        {...props}
        aria-describedby={props['aria-describedby'] ?? fieldCtx.errorId}
        aria-invalid={props['aria-invalid'] ?? (fieldCtx.invalid || undefined)}
        className={cn(
          positionClasses,
          inputVariants({ size, variant: inputVariant }),
          isPasswordInput && 'pr-10',
          'data-[start-adornment=true]:pl-(--input-start-padding)',
          'data-[end-adornment=true]:pr-(--input-end-padding)',
          className
        )}
        data-end-adornment={Boolean(endWidth)}
        data-slot="input"
        data-start-adornment={Boolean(startWidth)}
        data-testid={testId}
        onChange={isNumberInput ? handleInputChange : props.onChange}
        readOnly={readOnly}
        ref={inputRef}
        size={nativeSize}
        step={isNumberInput ? step : undefined}
        style={adornmentStyle}
        type={inputType}
        {...inputValueProps}
      />
    );

    return (
      <InputContext.Provider value={inputContextValue}>
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
            <PasswordVisibilityControl
              Button={Button}
              disabled={controlsDisabled}
              onToggle={() => setShowPassword(showPassword !== true)}
              showPassword={showPassword}
              size={size}
            />
          ) : null}
          {shouldShowControls === true ? (
            <NumberInputControls
              Button={Button}
              decrement={decrement}
              disabled={controlsDisabled}
              increment={increment}
              size={size}
            />
          ) : null}
        </div>
      </InputContext.Provider>
    );
  }
);

Input.displayName = 'Input';

export type { InputProps } from '@/components/ui/shared/input';

export { InputEnd, InputStart } from '@/components/ui/shared/input';
export { Input };
