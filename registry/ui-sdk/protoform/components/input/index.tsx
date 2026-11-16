'use client';
import type { CSSProperties } from 'react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/sdk/button/index';
import { useFieldContext } from '@/components/ui/sdk/field/index';
import { useGroup } from '@/components/ui/sdk/group/index';
import type { InputProps as NativeInputProps } from '@/components/ui/shared/input';
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
import { definedProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { Input as SDKInput } from '@/registry/base-nova/protoform/lib/ui-sdk/adapters/core-input';
import { cn } from '@/registry/base-nova/protoform/lib/utils';

export interface InputProps extends NativeInputProps {
  controller?: React.ComponentProps<typeof SDKInput>['controller'];
  'data-agent-secret'?: boolean | string | undefined;
  onValueChange?: React.ComponentProps<typeof SDKInput>['onValueChange'];
}

function useInputState(value: InputProps['value'], defaultValue: InputProps['defaultValue']) {
  const [mirror, setMirror] = useState(() => ({ controlled: value, value: String(value ?? defaultValue ?? '') }));
  const [showPassword, setShowPassword] = useState(false);
  if (!Object.is(value, mirror.controlled)) {
    setMirror({ controlled: value, value: value === undefined ? mirror.value : String(value) });
  }
  const setValue = React.useCallback((next: React.SetStateAction<string>) => {
    setMirror((previous) => ({ ...previous, value: typeof next === 'function' ? next(previous.value) : next }));
  }, []);
  return { setShowPassword, setValue, showPassword, value: mirror.value };
}

function InputPrimitive({
  value,
  defaultValue,
  ...props
}: React.ComponentProps<'input'> & { onValueChange?: React.ComponentProps<typeof SDKInput>['onValueChange'] }) {
  return (
    <SDKInput
      {...definedProps(props)}
      {...(value === undefined ? {} : { value: String(value) })}
      {...(defaultValue === undefined ? {} : { defaultValue: String(defaultValue) })}
    />
  );
}
function getInputAccessibilityProps(
  props: InputProps,
  field: ReturnType<typeof useFieldContext>,
  testId: string | undefined
) {
  return {
    'aria-describedby': props['aria-describedby'] ?? field.errorId,
    'aria-invalid': props['aria-invalid'] ?? (field.invalid || undefined),
    'data-testid': testId ?? props['data-testid'],
  };
}

const Input = ({
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
  'data-agent-secret': agentSecret,
  ref,
  ...props
}: InputProps & { ref?: React.Ref<HTMLInputElement> | undefined }) => {
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
    <InputPrimitive
      {...props}
      {...getInputAccessibilityProps(props, fieldCtx, testId)}
      className={cn(
        positionClasses,
        inputVariants({ size, variant: inputVariant }),
        isPasswordInput && 'pr-10',
        'data-[start-adornment=true]:pl-(--input-start-padding)',
        'data-[end-adornment=true]:pr-(--input-end-padding)',
        className
      )}
      data-agent-secret={isPasswordInput === true ? true : agentSecret}
      data-end-adornment={Boolean(endWidth)}
      data-slot="input"
      data-start-adornment={Boolean(startWidth)}
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
};

Input.displayName = 'Input';

export { InputEnd, InputStart } from '@/components/ui/shared/input';
export { Input };
