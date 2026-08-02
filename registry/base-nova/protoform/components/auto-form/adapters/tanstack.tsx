'use client';

import {
  type FormAsyncValidateOrFn,
  type FormOptions,
  type FormValidateOrFn,
  type ReactFormExtendedApi,
  useForm,
  useStore,
} from '@tanstack/react-form';
import React from 'react';

import type { SchemaValidationError } from '../core-types';
import {
  type AutoFormArrayController,
  type AutoFormEngine,
  AutoFormEngineProvider,
  type AutoFormFieldController,
  errorMessages,
} from '../engine';
import { getPathInObject } from '../field-utils';

type FormValues = Record<string, unknown>;
type SyncValidator = FormValidateOrFn<FormValues> | undefined;
type AsyncValidator = FormAsyncValidateOrFn<FormValues> | undefined;

export type TanStackFormOptions = FormOptions<
  FormValues,
  SyncValidator,
  SyncValidator,
  AsyncValidator,
  SyncValidator,
  AsyncValidator,
  SyncValidator,
  AsyncValidator,
  SyncValidator,
  AsyncValidator,
  AsyncValidator,
  unknown
>;

export type TanStackAutoFormApi = ReactFormExtendedApi<
  FormValues,
  SyncValidator,
  SyncValidator,
  AsyncValidator,
  SyncValidator,
  AsyncValidator,
  SyncValidator,
  AsyncValidator,
  SyncValidator,
  AsyncValidator,
  AsyncValidator,
  unknown
>;

type TanStackSubmitPayload = Parameters<NonNullable<TanStackFormOptions['onSubmit']>>[0];

type TanStackEngineContextValue = {
  clearFieldErrors: (name: string) => void;
  fieldErrors: Map<string, string[]>;
  form: TanStackAutoFormApi;
  registerRef: (name: string, element: HTMLElement | null) => void;
};

const TanStackEngineContext = React.createContext<TanStackEngineContextValue | null>(null);

function useTanStackEngineContext() {
  const context = React.useContext(TanStackEngineContext);
  if (!context) {
    throw new Error('TanStack AutoForm controls must be rendered inside the TanStack engine.');
  }
  return context;
}

function TanStackFieldController({
  children,
  name,
}: {
  children: (controller: AutoFormFieldController) => React.ReactNode;
  name: string;
}) {
  const { clearFieldErrors, fieldErrors, form, registerRef } = useTanStackEngineContext();

  return (
    <form.Field name={name}>
      {(field) => {
        const messages = [
          ...errorMessages(field.state.meta.errors),
          ...(fieldErrors.get(name) ?? []),
        ];
        return children({
          errors: [...new Set(messages)],
          name,
          onBlur: field.handleBlur,
          onChange: (value, options) => {
            clearFieldErrors(name);
            if (options) {
              form.setFieldValue(name, value, {
                dontUpdateMeta: options.shouldDirty === false && options.shouldTouch === false,
                dontValidate: options.shouldValidate === false,
              });
              return;
            }
            field.handleChange(value);
          },
          ref: (element) => registerRef(name, element),
          value: field.state.value,
        });
      }}
    </form.Field>
  );
}

function TanStackArrayController({
  children,
  name,
}: {
  children: (controller: AutoFormArrayController) => React.ReactNode;
  name: string;
}) {
  const { form } = useTanStackEngineContext();
  const value = useStore(form.store, (state) => getPathInObject(state.values, name.split('.')));
  const arrayValue = Array.isArray(value) ? value : [];
  const collectionId = React.useId();
  const nextItemId = React.useRef(0);
  const keys = React.useRef<string[]>([]);

  while (keys.current.length < arrayValue.length) {
    keys.current.push(`${collectionId}-${nextItemId.current++}`);
  }
  if (keys.current.length > arrayValue.length) {
    keys.current.length = arrayValue.length;
  }

  return children({
    append: (item) => {
      keys.current.push(`${collectionId}-${nextItemId.current++}`);
      form.setFieldValue(name, [...arrayValue, item]);
    },
    items: arrayValue.map((item, index) => ({
      key: keys.current[index] ?? `auto-form-item-${index}`,
      value: item,
    })),
    remove: (index) => {
      keys.current.splice(index, 1);
      form.setFieldValue(
        name,
        arrayValue.filter((_, itemIndex) => itemIndex !== index)
      );
    },
  });
}

function setErrorAtPath(target: Record<string, unknown>, path: string[], messages: string[]) {
  let current = target;
  for (const [index, segment] of path.entries()) {
    if (index === path.length - 1) {
      current[segment] = { message: messages.join('\n') };
      return;
    }
    const existing = current[segment];
    if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
      current = existing as Record<string, unknown>;
      continue;
    }
    const nested: Record<string, unknown> = {};
    current[segment] = nested;
    current = nested;
  }
}

function validationErrorsByPath(errors: SchemaValidationError[]): Map<string, string[]> {
  const byPath = new Map<string, string[]>();
  for (const error of errors) {
    if (error.path.length === 0) {
      continue;
    }
    const path = error.path.join('.');
    byPath.set(path, [...(byPath.get(path) ?? []), error.message]);
  }
  return byPath;
}

function setDirtyAtPath(target: Record<string, unknown>, path: string[]) {
  let current = target;
  for (const [index, segment] of path.entries()) {
    if (index === path.length - 1) {
      current[segment] = true;
      return;
    }
    const existing = current[segment];
    if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
      current = existing as Record<string, unknown>;
    } else {
      const nested: Record<string, unknown> = {};
      current[segment] = nested;
      current = nested;
    }
  }
}

function dirtyFieldsFromMeta(
  fieldMeta: Record<string, { isDefaultValue?: boolean; isDirty?: boolean } | undefined>
) {
  const dirtyFields: Record<string, unknown> = {};
  for (const [path, meta] of Object.entries(fieldMeta)) {
    if (meta?.isDirty && !meta.isDefaultValue) {
      setDirtyAtPath(dirtyFields, path.split('.'));
    }
  }
  return dirtyFields;
}

export type TanStackEngineProps = {
  children: (engine: AutoFormEngine) => React.ReactNode;
  defaultValues: FormValues;
  formOptions?: TanStackFormOptions;
  values?: FormValues;
};

export function TanStackEngine({
  children,
  defaultValues,
  formOptions,
  values,
}: TanStackEngineProps) {
  const submitRef = React.useRef<((values: FormValues) => void | Promise<void>) | undefined>(undefined);
  const nativeSubmissionRef = React.useRef<TanStackSubmitPayload | undefined>(undefined);
  const nativeOnSubmit = formOptions?.onSubmit;
  const form = useForm<
    FormValues,
    SyncValidator,
    SyncValidator,
    AsyncValidator,
    SyncValidator,
    AsyncValidator,
    SyncValidator,
    AsyncValidator,
    SyncValidator,
    AsyncValidator,
    AsyncValidator,
    unknown
  >({
    ...(formOptions ?? {}),
    defaultValues,
    onSubmit: async (submission) => {
      nativeSubmissionRef.current = submission;
      await submitRef.current?.(submission.value);
    },
  });
  const state = useStore(form.store, (current) => current);
  const [validationErrors, setValidationErrors] = React.useState<SchemaValidationError[]>([]);
  const [submitError, setSubmitError] = React.useState<string>();
  const fieldRefs = React.useRef(new Map<string, HTMLElement>());
  const fieldErrors = validationErrorsByPath(validationErrors);
  const errors: Record<string, unknown> = {};
  for (const [path, meta] of Object.entries(state.fieldMeta)) {
    const messages = errorMessages(meta?.errors ?? []);
    if (messages.length > 0) {
      setErrorAtPath(errors, path.split('.'), messages);
    }
  }
  for (const [path, messages] of fieldErrors) {
    setErrorAtPath(errors, path.split('.'), messages);
  }
  const validationRootErrors = validationErrors
    .filter((error) => error.path.length === 0)
    .map((error) => error.message);
  const nativeRootErrors = errorMessages(state.errors);
  const rootError = [...nativeRootErrors, ...validationRootErrors, ...(submitError ? [submitError] : [])].join('\n') ||
    undefined;

  React.useEffect(() => {
    if (values) {
      form.reset(values, { keepDefaultValues: true });
    }
  }, [form, values]);

  const clearErrors = (paths?: string[]) => {
    setSubmitError(undefined);
    setValidationErrors((current) => {
      if (!paths) {
        return [];
      }
      const targets = new Set(paths);
      return current.filter((error) => !targets.has(error.path.join('.')));
    });
  };

  const contextValue: TanStackEngineContextValue = {
    clearFieldErrors: (name) =>
      setValidationErrors((current) => current.filter((error) => error.path.join('.') !== name)),
    fieldErrors,
    form,
    registerRef: (name, element) => {
      if (element) {
        fieldRefs.current.set(name, element);
      } else {
        fieldRefs.current.delete(name);
      }
    },
  };

  const engine: AutoFormEngine = {
    ArrayController: TanStackArrayController,
    FieldController: TanStackFieldController,
    clearErrors,
    defaultValues,
    dirtyFields: dirtyFieldsFromMeta(state.fieldMeta),
    errors,
    focus: (path) => fieldRefs.current.get(path)?.focus(),
    getFieldInvalid: (path) =>
      Boolean(state.fieldMeta[path]?.errors.length || fieldErrors.get(path)?.length),
    getValues: () => form.state.values,
    handleSubmit: (onValid) => (event) => {
      event.preventDefault();
      submitRef.current = onValid;
      void form.handleSubmit();
    },
    isSubmitting: state.isSubmitting,
    nativeForm: form,
    reset: (nextValues, options) => form.reset(nextValues, options),
    rootError,
    runNativeSubmit: nativeOnSubmit
      ? async () => {
          const submission = nativeSubmissionRef.current;
          if (submission) {
            await nativeOnSubmit(submission);
          }
        }
      : undefined,
    setRootError: setSubmitError,
    setValidationErrors,
    setValue: (path, value, options) => {
      setValidationErrors((current) => current.filter((error) => error.path.join('.') !== path));
      form.setFieldValue(path, value, {
        dontUpdateMeta: options?.shouldDirty === false && options.shouldTouch === false,
        dontValidate: options?.shouldValidate === false,
      });
    },
    trigger: async (paths) => {
      const results = paths
        ? await Promise.all(paths.map((path) => form.validateField(path, 'submit')))
        : await form.validateAllFields('submit');
      return results.flat().length === 0;
    },
    validatesSchema: false,
    values: state.values,
  };

  return (
    <TanStackEngineContext.Provider value={contextValue}>
      <AutoFormEngineProvider engine={engine}>{children(engine)}</AutoFormEngineProvider>
    </TanStackEngineContext.Provider>
  );
}
