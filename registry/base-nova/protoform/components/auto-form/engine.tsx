"use client";

import React from "react";

import type { SchemaValidationError } from "./core-types";

export interface AutoFormFieldController {
  errors: string[];
  name: string;
  onBlur: () => void;
  onChange: (
    value: unknown,
    options?: { shouldDirty?: boolean; shouldTouch?: boolean; shouldValidate?: boolean }
  ) => void;
  ref: (element: HTMLElement | null) => void;
  value: unknown;
}

export interface AutoFormArrayController {
  append: (value: unknown) => void;
  items: Array<{ key: string; value: unknown }>;
  remove: (index: number) => void;
}

export interface AutoFormEngineHandle {
  clearErrors: (paths?: string[]) => void;
  focus: (path: string) => void;
  getValues: () => Record<string, unknown>;
  /** Establish the current values as the new clean baseline. */
  markClean: () => void;
  reset: (values: Record<string, unknown>, options?: { keepDefaultValues?: boolean }) => void;
  setValue: (
    path: string,
    value: unknown,
    options?: { shouldDirty?: boolean; shouldTouch?: boolean; shouldValidate?: boolean }
  ) => void;
}

export type AutoFormEngine = AutoFormEngineHandle & {
  ArrayController: React.ComponentType<{
    children: (controller: AutoFormArrayController) => React.ReactNode;
    name: string;
  }>;
  FieldController: React.ComponentType<{
    children: (controller: AutoFormFieldController) => React.ReactNode;
    name: string;
  }>;
  defaultValues: Record<string, unknown> | undefined;
  dirtyFields: Record<string, unknown>;
  errors: Record<string, unknown>;
  getFieldInvalid: (path: string) => boolean;
  handleSubmit: (
    onValid: (values: Record<string, unknown>) => void | Promise<void>
  ) => React.SubmitEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  isDirty: boolean;
  nativeForm: unknown;
  rootError: string | undefined;
  runNativeSubmit?: (() => void | Promise<void>) | undefined;
  setRootError: (message: string) => void;
  setValidationErrors: (errors: SchemaValidationError[]) => void;
  trigger: (paths?: string[]) => Promise<boolean>;
  /** Native validation already returns the schema's transformed output. */
  validatesSchema: boolean;
  values: Record<string, unknown>;
};

const AutoFormEngineContext = React.createContext<AutoFormEngine | null>(null);

export function AutoFormEngineProvider({ children, engine }: { children: React.ReactNode; engine: AutoFormEngine }) {
  return <AutoFormEngineContext.Provider value={engine}>{children}</AutoFormEngineContext.Provider>;
}

export function useAutoFormEngine(): AutoFormEngine {
  const engine = React.useContext(AutoFormEngineContext);
  if (!engine) {
    throw new Error("AutoForm engine controls must be used inside an AutoForm engine provider.");
  }
  return engine;
}

export function errorMessage(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Error) {
    return value.message;
  }
  if (value && typeof value === "object") {
    const message = Reflect.get(value, "message");
    if (typeof message === "string") {
      return message;
    }
  }
  return;
}

export function errorMessages(values: unknown[]): string[] {
  return values.map(errorMessage).filter((message): message is string => Boolean(message));
}

export function useDirtyStateNotification(isDirty: boolean, onDirtyChange: ((isDirty: boolean) => void) | undefined) {
  const callbackRef = React.useRef(onDirtyChange);
  const lastNotificationRef = React.useRef<boolean | undefined>(undefined);

  React.useEffect(() => {
    callbackRef.current = onDirtyChange;
  }, [onDirtyChange]);

  const notifyDirtyChange = React.useCallback((nextIsDirty: boolean) => {
    if (lastNotificationRef.current === nextIsDirty) {
      return;
    }
    lastNotificationRef.current = nextIsDirty;
    callbackRef.current?.(nextIsDirty);
  }, []);

  React.useEffect(() => {
    if (lastNotificationRef.current !== isDirty) {
      lastNotificationRef.current = isDirty;
      callbackRef.current?.(isDirty);
    }
  }, [isDirty]);

  return notifyDirtyChange;
}
