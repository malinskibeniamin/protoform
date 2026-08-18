"use client";

import type React from "react";
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
} from "react-hook-form";
import {
  type AutoFormArrayController,
  type AutoFormEngine,
  AutoFormEngineProvider,
  type AutoFormFieldController,
  useDirtyStateNotification,
} from "../engine";
import { getPathInObject } from "../field-utils";
import { getRootErrorMessage } from "../helpers";
import { PROTO_FORM_ROOT_ERROR_KEY } from "../proto";

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
  const messages = [fieldState.error?.message, ...Object.values(fieldState.error?.types ?? {})].filter(
    (message): message is string => typeof message === "string"
  );

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
  const values = getPathInObject(form.getValues(), name.split("."));
  const items = fields.map((field, index) => ({
    key: field.id,
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
  let shouldFocus = true;

  for (const error of errors) {
    if (error.path.length === 0) {
      rootMessages.push(error.message);
      continue;
    }

    form.setError(error.path.join("."), { message: error.message, type: "validation" }, { shouldFocus });
    shouldFocus = false;
  }

  if (rootMessages.length > 0) {
    form.setError("root", {
      message: rootMessages.join("\n"),
      type: "validation",
    });
  }
}

export interface ReactHookFormEngineProps<T extends FormValues> {
  children: (engine: AutoFormEngine) => React.ReactNode;
  defaultValues: FormValues;
  formOptions?: UseFormProps<FormValues, unknown, T> | undefined;
  onDirtyChange?: ((isDirty: boolean) => void) | undefined;
  resolver?: Resolver<FormValues, unknown, T> | undefined;
  values?: FormValues | undefined;
}

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
    ...(resolver ? { resolver } : {}),
    ...(values ? { values } : {}),
  });
  const watchedValues = (useWatch({ control: form.control }) as FormValues | undefined) ?? {};
  const errors = form.formState.errors as Record<string, unknown>;
  const rootError =
    getRootErrorMessage(form.formState.errors.root) || getRootErrorMessage(errors[PROTO_FORM_ROOT_ERROR_KEY]);
  const notifyDirtyChange = useDirtyStateNotification(form.formState.isDirty, onDirtyChange);

  const engine: AutoFormEngine = {
    ArrayController: ReactHookFormArrayController,
    clearErrors: (paths) => form.clearErrors(paths),
    defaultValues: form.formState.defaultValues,
    dirtyFields: form.formState.dirtyFields,
    errors,
    FieldController: ReactHookFormFieldController,
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
    setRootError: (message) => form.setError("root", { message, type: "submit" }),
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
