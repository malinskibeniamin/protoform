"use client";

import React from "react";

import { useLayoutEffect } from "@/registry/base-nova/protoform/hooks/use-layout-effect";

// Prevent bundlers from trying to optimize the import
const useInsertionEffect = React.useInsertionEffect ?? useLayoutEffect;

type ChangeHandler<T> = (state: T) => void;
type SetStateFn<T> = React.Dispatch<React.SetStateAction<T>>;

interface UseControllableStateParams<T> {
  caller?: string | undefined;
  defaultProp: T;
  onChange?: ChangeHandler<T> | undefined;
  prop?: T | undefined;
}

/**
 * Taken from Radix UI
 * Controlled/uncontrolled state helper adapted for protoform components.
 */
export function useControllableState<T>({
  prop,
  defaultProp,
  onChange = () => {
    // Default no-op function
  },
}: UseControllableStateParams<T>): [T, SetStateFn<T>] {
  const [uncontrolledProp, setUncontrolledProp, onChangeRef] = useUncontrolledState({
    defaultProp,
    onChange,
  });
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledProp;

  const setValue: SetStateFn<T> = (nextValue) => {
    if (isControlled) {
      const newValue = isFunction(nextValue) ? nextValue(prop) : nextValue;
      if (newValue !== prop) {
        onChangeRef.current?.(newValue as T);
      }
    } else {
      setUncontrolledProp(nextValue);
    }
  };

  return [value, setValue];
}

function useUncontrolledState<T>({
  defaultProp,
  onChange,
}: Omit<UseControllableStateParams<T>, "prop">): [
  Value: T,
  setValue: React.Dispatch<React.SetStateAction<T>>,
  OnChangeRef: React.RefObject<ChangeHandler<T> | undefined>,
] {
  const [value, setValue] = React.useState(defaultProp);
  const prevValueRef = React.useRef(value);

  const onChangeRef = React.useRef(onChange);
  useInsertionEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    if (prevValueRef.current !== value) {
      onChangeRef.current?.(value);
      prevValueRef.current = value;
    }
  }, [value]);

  return [value, setValue, onChangeRef];
}

function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === "function";
}
