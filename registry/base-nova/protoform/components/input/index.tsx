"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, Minus, Plus } from "lucide-react";
import React, { createContext, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useFieldContext } from "@/components/ui/field";
import { useGroup } from "@/components/ui/group";
import { cn, type SharedProps } from "@/registry/base-nova/protoform/lib/utils";

export const inputVariants = cva(
  "placeholder:!text-muted-foreground !border-input flex w-full min-w-0 border bg-transparent text-base outline-none transition-colors [-moz-appearance:textfield] selection:bg-selection selection:text-selection-foreground file:inline-flex file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:disabled:bg-input/80 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
  {
    defaultVariants: {
      size: "md",
      variant: "standard",
    },
    variants: {
      size: {
        lg: "h-9 px-3 py-1 file:h-7",
        md: "h-8 px-2.5 py-1 file:h-6",
        sm: "h-7 px-2 py-1 text-sm file:h-5",
      },
      variant: {
        group: "rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
        password: "pr-10",
        standard: "",
      },
    },
  }
);

const stepControlSizes = { lg: "icon-lg", md: "icon", sm: "icon-sm" } as const;

const inputContainerVariants = cva("", {
  defaultVariants: {
    layout: "standard",
  },
  variants: {
    layout: {
      number: "flex items-center gap-2",
      password: "relative flex w-full flex-1",
      standard: "relative flex items-center",
    },
  },
});

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants>,
    SharedProps {
  children?: React.ReactNode;
  containerClassName?: string | undefined;
  showStepControls?: boolean | undefined;
}

function useInputState(value: InputProps["value"], defaultValue: InputProps["defaultValue"]) {
  const [internalValue, setInternalValue] = useState<string>(() => String(value ?? defaultValue ?? ""));
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value.toString());
    }
  }, [value]);

  return { setShowPassword, setValue: setInternalValue, showPassword, value: internalValue };
}

function createChangeEvent(newValue: string): React.ChangeEvent<HTMLInputElement> {
  return {
    target: { value: newValue },
  } as React.ChangeEvent<HTMLInputElement>;
}

function useNumberInputHandlers(
  value: string,
  setValue: React.Dispatch<React.SetStateAction<string>>,
  step: number,
  onChange?: React.ChangeEventHandler<HTMLInputElement>
) {
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

  return { decrement, handleInputChange, increment };
}

function getInputGroupClasses(attached: boolean, groupPosition: ReturnType<typeof useGroup>["position"]) {
  let positionClasses = "rounded-lg";
  if (attached && groupPosition === "first") {
    positionClasses = "rounded-r-none rounded-l-lg border-r-0";
  } else if (attached && groupPosition === "last") {
    positionClasses = "rounded-r-lg rounded-l-none border-l-0";
  } else if (attached && groupPosition === "middle") {
    positionClasses = "rounded-none border-r-0 border-l-0";
  }
  return positionClasses;
}

function getInputMode(
  type: InputProps["type"],
  variant: InputProps["variant"],
  showPassword: boolean,
  showStepControls: InputProps["showStepControls"]
) {
  const isPasswordInput = type === "password";
  const shouldShowControls = type === "number" && showStepControls;
  let inputType = type;
  if (isPasswordInput) {
    inputType = showPassword ? "text" : "password";
  }

  let layout: "number" | "password" | "standard" | null | undefined = variant === "group" ? "standard" : variant;
  if (shouldShowControls) {
    layout = "number";
  } else if (isPasswordInput) {
    layout = "password";
  }
  const inputVariant = isPasswordInput && variant !== "group" ? "password" : variant;
  return { inputType, inputVariant, layout };
}

function getInputValueProps(
  isNumberInput: boolean,
  value: string,
  controlledValue: InputProps["value"],
  defaultValue: InputProps["defaultValue"]
) {
  let inputValueProps: Pick<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "value">;
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
  size,
  disabled,
  showPassword,
  onToggle,
}: {
  size: InputProps["size"];
  disabled: InputProps["disabled"];
  showPassword: boolean;
  onToggle: () => void;
}) {
  const passwordToggleSize = size === "sm" ? "icon-xs" : "icon-sm";
  return (
    <InputEnd className="pointer-events-auto">
      <Button
        aria-label={showPassword ? "Hide password" : "Show password"}
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
  size,
  disabled,
  increment,
  decrement,
}: {
  size: InputProps["size"];
  disabled: InputProps["disabled"];
  increment: () => void;
  decrement: () => void;
}) {
  const controlSize = stepControlSizes[size ?? "md"];
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
    const inputContextValue = React.useMemo(
      () => ({ endWidth, setEndWidth, setStartWidth, startWidth }),
      [endWidth, startWidth]
    );

    const isNumberInput = type === "number";
    const isPasswordInput = type === "password";
    const shouldShowControls = isNumberInput && showStepControls;
    const step = props.step ? Number(props.step) : 1;
    const { position: groupPosition, attached: groupAttached } = useGroup();
    const attached = groupAttached || isPasswordInput;

    const { increment, decrement, handleInputChange } = useNumberInputHandlers(value, setValue, step, props.onChange);

    const controlsDisabled = props.disabled || readOnly;

    const positionClasses = getInputGroupClasses(attached, groupPosition);

    const { inputType, inputVariant, layout } = getInputMode(type, variant, showPassword, showStepControls);

    const inputValueProps = getInputValueProps(isNumberInput, value, props.value, defaultValue);

    const inputElement = (
      <input
        {...props}
        aria-describedby={props["aria-describedby"] ?? fieldCtx.errorId}
        aria-invalid={props["aria-invalid"] ?? (fieldCtx.invalid || undefined)}
        className={cn(
          positionClasses,
          inputVariants({ size, variant: inputVariant }),
          isPasswordInput && "pr-10",
          "data-[start-adornment=true]:pl-(--input-start-padding)",
          "data-[end-adornment=true]:pr-(--input-end-padding)",
          className
        )}
        data-end-adornment={Boolean(endWidth)}
        data-slot="input"
        data-start-adornment={Boolean(startWidth)}
        data-testid={testId}
        onChange={isNumberInput ? handleInputChange : props.onChange}
        readOnly={readOnly}
        ref={ref}
        step={isNumberInput ? step : undefined}
        style={
          {
            "--input-start-padding": `${(startWidth ?? 0) + 16}px`,
            "--input-end-padding": `${(endWidth ?? 0) + 16}px`,
          } as React.CSSProperties
        }
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
              disabled={controlsDisabled}
              onToggle={() => setShowPassword(!showPassword)}
              showPassword={showPassword}
              size={size}
            />
          ) : null}
          {shouldShowControls ? (
            <NumberInputControls decrement={decrement} disabled={controlsDisabled} increment={increment} size={size} />
          ) : null}
        </div>
      </InputContext.Provider>
    );
  }
);

const inputEndClassNames = "absolute inset-y-0 right-2 z-10 flex items-center pointer-events-none";

const InputContext = createContext<{
  setStartWidth: (width: number) => void;
  setEndWidth: (width: number) => void;
  startWidth: number | undefined;
  endWidth: number | undefined;
}>({
  endWidth: undefined,
  setEndWidth: () => {
    // Default no-op function
  },
  setStartWidth: () => {
    // Default no-op function
  },
  startWidth: undefined,
});

const useInputContext = () => {
  const context = React.useContext(InputContext);
  if (!context) {
    throw new Error("useInputContext must be used within an InputContextProvider");
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
      className={cn("pointer-events-none absolute inset-y-0 left-2 z-10 flex items-center", className)}
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

Input.displayName = "Input";

export { Input, InputEnd, InputStart };
