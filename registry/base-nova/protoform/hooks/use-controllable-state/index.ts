'use client';

import React from 'react';
import { useLayoutEffect } from '@/registry/base-nova/protoform/hooks/use-layout-effect';

const useInsertionEffect = React.useInsertionEffect ?? useLayoutEffect;

type ChangeHandler<T> = (state: T) => void;
type SetStateFn<T> = React.Dispatch<React.SetStateAction<T>>;

interface UseControllableStateParams<T> {
  caller?: string | undefined;
  defaultProp: T;
  onChange?: ChangeHandler<T> | undefined;
  prop?: T | undefined;
}

export function useControllableState<T>({
  prop,
  defaultProp,
  onChange = () => undefined,
}: UseControllableStateParams<T>) {
  const [uncontrolledProp, setUncontrolledProp, onChangeRef] = useUncontrolledState({
    defaultProp,
    onChange,
  });
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledProp;

  const setValue: SetStateFn<T> = (nextValue) => {
    if (isControlled) {
      const newValue = isStateUpdater(nextValue) ? nextValue(prop) : nextValue;
      if (newValue !== prop) {
        onChangeRef.current?.(newValue);
      }
    } else {
      setUncontrolledProp(nextValue);
    }
  };

  const state: [T, SetStateFn<T>] = [value, setValue];
  return state;
}

function useUncontrolledState<T>({ defaultProp, onChange }: Omit<UseControllableStateParams<T>, 'prop'>) {
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

  const state: [
    Value: T,
    setValue: React.Dispatch<React.SetStateAction<T>>,
    OnChangeRef: React.RefObject<ChangeHandler<T> | undefined>,
  ] = [value, setValue, onChangeRef];
  return state;
}

function isStateUpdater<T>(value: React.SetStateAction<T>): value is (previous: T) => T {
  return typeof value === 'function';
}
