'use client';

import React from 'react';
import {
  FormProvider,
  type Resolver,
  type UseFormProps,
  type UseFormReturn,
  useController,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form-v8';

import { getPathInObject } from '../field-utils';
import {
  type AutoFormArrayController,
  type AutoFormEngine,
  AutoFormEngineProvider,
  type AutoFormFieldController,
  useDirtyStateNotification,
} from '../engine';
import { getRootErrorMessage } from '../helpers';
import { PROTO_FORM_ROOT_ERROR_KEY } from '../proto';

type FormValues = Record<string, unknown>;

function ReactHookFormFieldController({
  children,
  name,
}: {
  children: (controller: AutoFormFieldController) => React.ReactNode;
  name: string;
}) {
  const form = useFormContext<FormValues>();
  const { field, fieldState } = useController<FormValues>({ name });
  const messages = [
    fieldState.error?.message,
    ...Object.values(fieldState.error?.types ?? {}),
  ].filter((message): message is string => typeof message === 'string');

  return children({
    errors: [...new Set(messages)],
    name: field.name,
    onBlur: field.onBlur,
    onChange: (value, options) => {
      if (options) {
        form.setValue(name, value, options);
        return;
      }
      field.onChange(value);
    },
    ref: (element) => field.ref(element),
    value: field.value,
  });
}

function ReactHookFormArrayController({
  children,
  name,
}: {
  children: (controller: AutoFormArrayController) => React.ReactNode;
  name: string;
}) {
  const form = useFormContext<FormValues>();
  const { append, fields, remove } = useFieldArray({
    control: form.control,
    name: name as never,
  });
  const values = getPathInObject(form.getValues(), name.split('.'));
  const items = fields.map((field, index) => ({
    key: field.key,
    value: Array.isArray(values) ? values[index] : undefined,
  }));

  return children({
    append: (value) => append(value as never),
    items,
    remove,
  });
}

function applyValidationErrors<T extends FormValues>(
  form: UseFormReturn<FormValues, unknown, T>,
  errors: Array<{ message: string; path: Array<string | number> }>
) {
  form.clearErrors();
  const rootMessages: string[] = [];
  const messagesByPath = new Map<string, string[]>();

  for (const error of errors) {
    if (error.path.length === 0) {
      rootMessages.push(error.message);
      continue;
    }
    const path = error.path.join('.');
    messagesByPath.set(path, [
      ...(messagesByPath.get(path) ?? []),
      error.message,
    ]);
  }

  let shouldFocus = true;
  for (const [path, messages] of messagesByPath) {
    form.setError(
      path,
      {
        message: messages[0],
        type: 'validation',
        types: Object.fromEntries(
          messages.slice(1).map((message, index) => [
            `validation-${index + 1}`,
            message,
          ])
        ),
      },
      { shouldFocus }
    );
    shouldFocus = false;
  }

  if (rootMessages.length > 0) {
    form.setError('root', {
      message: rootMessages.join('\n'),
      type: 'validation',
    });
  }
}

export type ReactHookFormEngineProps<T extends FormValues> = {
  children: (engine: AutoFormEngine) => React.ReactNode;
  defaultValues: FormValues;
  formOptions?: UseFormProps<FormValues, unknown, T>;
  resolver?: Resolver<FormValues, unknown, T>;
  values?: FormValues;
  onDirtyChange?: (isDirty: boolean) => void;
};

export function ReactHookFormEngine<T extends FormValues>({
  children,
  defaultValues,
  formOptions,
  resolver,
  values,
  onDirtyChange,
}: ReactHookFormEngineProps<T>) {
  const form = useForm<FormValues, unknown, T>({
    ...(formOptions ?? {}),
    defaultValues,
    resolver,
    values,
  });
  const watchedValues = (useWatch({ control: form.control }) as FormValues | undefined) ?? {};
  const errors = form.formState.errors as Record<string, unknown>;
  const rootError =
    getRootErrorMessage(form.formState.errors.root) ||
    getRootErrorMessage(errors[PROTO_FORM_ROOT_ERROR_KEY]);
  const notifyDirtyChange = useDirtyStateNotification(form.formState.isDirty, onDirtyChange);

  const engine: AutoFormEngine = {
    ArrayController: ReactHookFormArrayController,
    FieldController: ReactHookFormFieldController,
    clearErrors: (paths) => form.clearErrors(paths),
    defaultValues: form.formState.defaultValues,
    dirtyFields: form.formState.dirtyFields,
    errors,
    focus: (path) => form.setFocus(path),
    getFieldInvalid: (path) => form.getFieldState(path).invalid,
    getValues: form.getValues,
    handleSubmit: (onValid) => form.handleSubmit(onValid),
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
    markClean: () => {
      form.reset(form.getValues());
      notifyDirtyChange(false);
    },
    nativeForm: form,
    reset: (nextValues, options) => form.reset(nextValues, options),
    rootError,
    setRootError: (message) => form.setError('root', { message, type: 'submit' }),
    setValidationErrors: (validationErrors) => applyValidationErrors(form, validationErrors),
    setValue: (path, value, options) => form.setValue(path, value, options),
    trigger: async (paths) => form.trigger(paths),
    validatesSchema: Boolean(resolver),
    values: watchedValues,
  };

  return (
    <FormProvider {...form}>
      <AutoFormEngineProvider engine={engine}>{children(engine)}</AutoFormEngineProvider>
    </FormProvider>
  );
}
