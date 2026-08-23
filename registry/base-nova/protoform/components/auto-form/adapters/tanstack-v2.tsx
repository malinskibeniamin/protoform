"use client";

import {
  type DefaultReactFormComponentMap,
  type FormOptions,
  type FormValidator,
  type FormValidators,
  type ReactFormApi,
  type ToFormErrorTypes,
  useForm,
  useSelector,
  type ValidationErrorMap,
} from "@tanstack/react-form-v2";
import React from "react";

import { useMemoizedArray } from "../../../lib/input-utils";
import { dirtyFieldsFromValues } from "../../../lib/protobuf-provider";
import type { SchemaValidation, SchemaValidationError } from "../core-types";
import {
  type AutoFormArrayController,
  type AutoFormEngine,
  AutoFormEngineProvider,
  type AutoFormFieldController,
  errorMessages,
  useDirtyStateNotification,
} from "../engine";
import type { AutoFormRevalidationMode, AutoFormValidationMode } from "../types";

type FormValues = Record<string, unknown>;
type V2Validators = FormValidators<FormValues>;
type V2ErrorTypes = ToFormErrorTypes<V2Validators, unknown>;
interface DynamicArrayFieldApi {
  pushValue: (value: unknown) => void;
  removeValue: (index: number) => void;
  value: unknown;
}
type DynamicArrayFieldComponent = React.ComponentType<{
  children: (field: DynamicArrayFieldApi) => React.ReactNode;
  name: string;
}>;

export type TanStackFormV2Options = Omit<
  FormOptions<FormValues, V2Validators, unknown, DefaultReactFormComponentMap>,
  "defaultValues"
>;

export type TanStackV2AutoFormApi = ReactFormApi<FormValues, V2ErrorTypes, DefaultReactFormComponentMap>;

interface TanStackV2EngineContextValue {
  clearFieldErrors: (name: string) => void;
  fieldErrors: Map<string, string[]>;
  form: TanStackV2AutoFormApi;
  nativeFieldErrors: Map<string, string[]>;
  registerRef: (name: string, element: HTMLElement | null) => void;
  setNativeFieldErrors: React.Dispatch<React.SetStateAction<Map<string, string[]>>>;
}

const TanStackV2EngineContext = React.createContext<TanStackV2EngineContextValue | null>(null);
const DIGITS_PATTERN = /^\d+$/;

function toTanStackV2Path(path: string): string {
  return path
    .split(".")
    .map((segment, index) => {
      if (DIGITS_PATTERN.test(segment)) {
        return `[${segment}]`;
      }
      return index === 0 ? segment : `.${segment}`;
    })
    .join("");
}

function sameMessages(left: string[] | undefined, right: string[]) {
  const current = left ?? [];
  return current.length === right.length && current.every((message, index) => message === right[index]);
}

function useTanStackV2EngineContext() {
  const context = React.useContext(TanStackV2EngineContext);
  if (!context) {
    throw new Error("TanStack Form v2 AutoForm controls must be rendered inside the v2 engine.");
  }
  return context;
}

function NativeFieldErrorsRegistration({ messages, name }: { messages: string[]; name: string }) {
  const { setNativeFieldErrors } = useTanStackV2EngineContext();
  const stableMessages = useMemoizedArray(messages);

  React.useEffect(
    function syncNativeFieldErrors() {
      setNativeFieldErrors((current) => {
        if (sameMessages(current.get(name), stableMessages)) {
          return current;
        }
        const next = new Map(current);
        if (stableMessages.length > 0) {
          next.set(name, stableMessages);
        } else {
          next.delete(name);
        }
        return next;
      });
    },
    [name, setNativeFieldErrors, stableMessages]
  );

  React.useEffect(
    function unregisterNativeFieldErrors() {
      return () => {
        setNativeFieldErrors((current) => {
          if (!current.has(name)) {
            return current;
          }
          const next = new Map(current);
          next.delete(name);
          return next;
        });
      };
    },
    [name, setNativeFieldErrors]
  );

  return null;
}

function TanStackV2FieldController({
  children,
  name,
}: {
  children: (controller: AutoFormFieldController) => React.ReactNode;
  name: string;
}) {
  const { clearFieldErrors, fieldErrors, form, registerRef } = useTanStackV2EngineContext();
  const fieldName = toTanStackV2Path(name);

  return (
    <form.Field name={fieldName}>
      {(field) => {
        const nativeMessages = errorMessages(field.errors);
        const messages = [...nativeMessages, ...(fieldErrors.get(name) ?? [])];
        return (
          <>
            <NativeFieldErrorsRegistration messages={nativeMessages} name={name} />
            {children({
              errors: [...new Set(messages)],
              name,
              onBlur: field.handleBlur,
              onChange: (value, options) => {
                clearFieldErrors(name);
                field.handleChange(value, {
                  ...(options?.shouldValidate === undefined ? {} : { causeValidation: options.shouldValidate }),
                  ...(options?.shouldDirty === undefined ? {} : { markAsDirty: options.shouldDirty }),
                  ...(options?.shouldTouch === undefined ? {} : { markAsTouched: options.shouldTouch }),
                });
              },
              ref: (element) => registerRef(name, element),
              value: field.value,
            })}
          </>
        );
      }}
    </form.Field>
  );
}

function TanStackV2ArrayController({
  children,
  name,
}: {
  children: (controller: AutoFormArrayController) => React.ReactNode;
  name: string;
}) {
  const { form } = useTanStackV2EngineContext();
  const ArrayField = form.ArrayField as unknown as DynamicArrayFieldComponent;
  const collectionId = React.useId();
  const nextItemId = React.useRef(0);
  const keys = React.useRef<string[]>([]);
  const fieldName = toTanStackV2Path(name);

  return (
    <ArrayField name={fieldName}>
      {(field) => {
        const arrayValue = Array.isArray(field.value) ? field.value : [];
        while (keys.current.length < arrayValue.length) {
          nextItemId.current += 1;
          keys.current.push(`${collectionId}-${nextItemId.current}`);
        }
        if (keys.current.length > arrayValue.length) {
          keys.current.length = arrayValue.length;
        }

        return children({
          append: (item) => {
            nextItemId.current += 1;
            keys.current.push(`${collectionId}-${nextItemId.current}`);
            field.pushValue(item);
          },
          items: arrayValue.map((item, index) => ({
            key: keys.current[index] ?? `auto-form-item-${index}`,
            value: item,
          })),
          remove: (index) => {
            keys.current.splice(index, 1);
            field.removeValue(index);
          },
        });
      }}
    </ArrayField>
  );
}

function validationErrorsByPath(errors: SchemaValidationError[]): Map<string, string[]> {
  const byPath = new Map<string, string[]>();
  for (const error of errors) {
    if (error.path.length === 0) {
      continue;
    }
    const path = error.path.join(".");
    byPath.set(path, [...(byPath.get(path) ?? []), error.message]);
  }
  return byPath;
}

function setErrorAtPath(target: Record<string, unknown>, path: string[], messages: string[]) {
  let current = target;
  for (const [index, segment] of path.entries()) {
    if (index === path.length - 1) {
      current[segment] = { message: messages.join("\n") };
      return;
    }
    const existing = current[segment];
    if (existing && typeof existing === "object" && !Array.isArray(existing)) {
      current = existing as Record<string, unknown>;
      continue;
    }
    const nested: Record<string, unknown> = {};
    current[segment] = nested;
    current = nested;
  }
}

function toV2ValidationError(errors: SchemaValidationError[]): ValidationErrorMap<FormValues> {
  const fieldEntries = validationErrorsByPath(errors);
  const formErrors: string[] = [];
  for (const error of errors) {
    if (error.path.length === 0) {
      formErrors.push(error.message);
    }
  }
  return {
    ...(formErrors.length > 0 ? { form: formErrors } : {}),
    fields: Object.fromEntries([...fieldEntries].map(([path, messages]) => [toTanStackV2Path(path), messages])),
  };
}

function shouldValidateForMode(mode: AutoFormValidationMode | AutoFormRevalidationMode, event: "blur" | "change") {
  return mode === event;
}

export interface TanStackV2EngineProps {
  children: (engine: AutoFormEngine) => React.ReactNode;
  defaultValues: FormValues;
  formOptions?: TanStackFormV2Options | undefined;
  onDirtyChange?: ((isDirty: boolean) => void) | undefined;
  revalidationMode?: AutoFormRevalidationMode | undefined;
  validateSchema: (values: FormValues, signal: AbortSignal) => Promise<SchemaValidation>;
  validationMode?: AutoFormValidationMode | undefined;
  values?: FormValues | undefined;
}

export function TanStackV2Engine({
  children,
  defaultValues,
  formOptions,
  onDirtyChange,
  revalidationMode = "change",
  validateSchema,
  validationMode = "submit",
  values,
}: TanStackV2EngineProps) {
  const formDefaultValuesRef = React.useRef(defaultValues);
  const cleanValuesRef = React.useRef<FormValues>(defaultValues);
  const hasNormalizedDefaultsRef = React.useRef(false);
  const validatedValuesRef = React.useRef<FormValues | undefined>(undefined);
  const manualValidationRef = React.useRef(false);
  const [validationErrors, setValidationErrors] = React.useState<SchemaValidationError[]>([]);
  const [submitError, setSubmitError] = React.useState<string>();
  const [isAutoFormSubmitting, setIsAutoFormSubmitting] = React.useState(false);
  const [nativeFieldErrors, setNativeFieldErrors] = React.useState(new Map<string, string[]>());
  const fieldRefs = React.useRef(new Map<string, HTMLElement>());

  const providerValidator: FormValidator<FormValues> = {
    run: async ({ signal, value }) => {
      const result = await validateSchema(value, signal);
      if (signal.aborted) {
        return;
      }
      if (result.success) {
        validatedValuesRef.current = result.data as FormValues;
        setValidationErrors([]);
        return;
      }
      setValidationErrors(result.errors);
      return toV2ValidationError(result.errors);
    },
    triggers: [
      {
        trigger: "change",
        when: ({ formApi }) =>
          manualValidationRef.current ||
          shouldValidateForMode(formApi.state.submissionAttempts > 0 ? revalidationMode : validationMode, "change"),
      },
      {
        trigger: "blur",
        when: ({ formApi }) =>
          manualValidationRef.current ||
          shouldValidateForMode(formApi.state.submissionAttempts > 0 ? revalidationMode : validationMode, "blur"),
      },
    ],
  };
  const form = useForm<FormValues, V2Validators, unknown>({
    ...(formOptions ?? {}),
    defaultValues: formDefaultValuesRef.current,
    validators: [...(formOptions?.validators ?? []), providerValidator],
  });
  const state = useSelector(form.atom, (current) => current);
  const fieldErrors = React.useMemo(() => validationErrorsByPath(validationErrors), [validationErrors]);
  const dirtyFields = dirtyFieldsFromValues(state.values, cleanValuesRef.current);
  const isDirty = !state.isDefaultValue;
  const notifyDirtyChange = useDirtyStateNotification(isDirty, onDirtyChange);
  const errors: Record<string, unknown> = {};
  for (const [path, messages] of [...fieldErrors, ...nativeFieldErrors]) {
    setErrorAtPath(errors, path.split("."), messages);
  }
  const validationRootErrors: string[] = [];
  for (const error of validationErrors) {
    if (error.path.length === 0) {
      validationRootErrors.push(error.message);
    }
  }
  const rootError =
    [...new Set([...errorMessages(state.errors), ...validationRootErrors, ...(submitError ? [submitError] : [])])].join(
      "\n"
    ) || undefined;

  React.useEffect(
    function normalizeMountedDefaults() {
      if (!hasNormalizedDefaultsRef.current) {
        hasNormalizedDefaultsRef.current = true;
        const normalizedDefaults = form.state.values;
        formDefaultValuesRef.current = normalizedDefaults;
        cleanValuesRef.current = normalizedDefaults;
        form.reset(normalizedDefaults);
        notifyDirtyChange(false);
      }
    },
    [form, notifyDirtyChange]
  );

  React.useEffect(
    function syncControlledValues() {
      if (values) {
        validatedValuesRef.current = undefined;
        setSubmitError(undefined);
        setValidationErrors([]);
        setNativeFieldErrors(new Map());
        formDefaultValuesRef.current = values;
        cleanValuesRef.current = values;
        form.reset(values);
        notifyDirtyChange(false);
      }
    },
    [form, values, notifyDirtyChange]
  );

  const clearErrors = (paths?: string[]) => {
    setSubmitError(undefined);
    setValidationErrors((current) => {
      if (!paths) {
        return [];
      }
      const targets = new Set(paths);
      return current.filter((error) => !targets.has(error.path.join(".")));
    });
  };

  const clearFieldErrors = React.useCallback((name: string) => {
    setValidationErrors((current) => current.filter((error) => error.path.join(".") !== name));
  }, []);
  const registerRef = React.useCallback((name: string, element: HTMLElement | null) => {
    if (element) {
      fieldRefs.current.set(name, element);
    } else {
      fieldRefs.current.delete(name);
    }
  }, []);
  const contextValue = React.useMemo<TanStackV2EngineContextValue>(
    () => ({ clearFieldErrors, fieldErrors, form, nativeFieldErrors, registerRef, setNativeFieldErrors }),
    [clearFieldErrors, fieldErrors, form, nativeFieldErrors, registerRef]
  );

  const engine: AutoFormEngine = {
    ArrayController: TanStackV2ArrayController,
    clearErrors,
    defaultValues: cleanValuesRef.current,
    dirtyFields,
    errors,
    FieldController: TanStackV2FieldController,
    focus: (path) => fieldRefs.current.get(path)?.focus(),
    getFieldInvalid: (path) => Boolean(fieldErrors.get(path)?.length || nativeFieldErrors.get(path)?.length),
    getValues: () => form.state.values,
    handleSubmit: (onValid) => (event) => {
      event.preventDefault();
      setIsAutoFormSubmitting(true);
      validatedValuesRef.current = undefined;
      form
        .handleSubmit()
        .then(async (submitErrors) => {
          if (submitErrors.length === 0) {
            await onValid(validatedValuesRef.current ?? form.state.values);
          }
        })
        .catch((error: unknown) => {
          setSubmitError(error instanceof Error ? error.message : "Submission failed.");
        })
        .finally(() => setIsAutoFormSubmitting(false));
    },
    isDirty,
    isSubmitting: state.isSubmitting || isAutoFormSubmitting,
    markClean: () => {
      const currentValues = form.state.values;
      formDefaultValuesRef.current = currentValues;
      cleanValuesRef.current = currentValues;
      form.reset(currentValues);
      notifyDirtyChange(false);
    },
    nativeForm: form,
    reset: (nextValues, options) => {
      validatedValuesRef.current = undefined;
      setSubmitError(undefined);
      setValidationErrors([]);
      setNativeFieldErrors(new Map());
      if (!options?.keepDefaultValues) {
        formDefaultValuesRef.current = nextValues;
        cleanValuesRef.current = nextValues;
      }
      form.reset(nextValues, {
        updateDefaultValues: !options?.keepDefaultValues,
      });
    },
    rootError,
    setRootError: setSubmitError,
    setValidationErrors,
    setValue: (path, value, options) => {
      setValidationErrors((current) => current.filter((error) => error.path.join(".") !== path));
      Reflect.apply(form.setFieldValue, form, [
        toTanStackV2Path(path),
        value,
        {
          causeValidation: options?.shouldValidate,
          markAsDirty: options?.shouldDirty,
          markAsTouched: options?.shouldTouch,
        },
      ]);
    },
    trigger: async () => {
      manualValidationRef.current = true;
      try {
        const results = await form.validate("change");
        return results.length === 0;
      } finally {
        manualValidationRef.current = false;
      }
    },
    validatesSchema: true,
    values: state.values,
  };

  return (
    <TanStackV2EngineContext.Provider value={contextValue}>
      <AutoFormEngineProvider engine={engine}>{children(engine)}</AutoFormEngineProvider>
    </TanStackV2EngineContext.Provider>
  );
}
