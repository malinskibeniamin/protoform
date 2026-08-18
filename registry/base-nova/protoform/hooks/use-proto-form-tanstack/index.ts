"use client";

import { type DescMessage, isMessage, type MessageShape } from "@bufbuild/protobuf";
import type { FieldMask } from "@bufbuild/protobuf/wkt";
import { ConnectError } from "@connectrpc/connect";
import {
  type FormAsyncValidateOrFn,
  type FormOptions,
  type FormValidateOrFn,
  type ReactFormExtendedApi,
  type UpdateMetaOptions,
  useForm,
} from "@tanstack/react-form";
import { useState } from "react";
import {
  type ConnectErrorContext,
  createUpdateMask as createDirtyUpdateMask,
  createProtoFormSchema,
  extractConnectErrorContext,
  extractFieldViolations,
  formValuesToProto,
  humanizeServerFieldError,
  type ProtoConversionOptions,
  protoPathToFormPath,
} from "../../lib/protobuf-provider";

type FormValues = Record<string, unknown>;

function getErrorMessage(error: unknown): string | undefined {
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object") {
    const message = Reflect.get(error, "message");
    return typeof message === "string" ? message : undefined;
  }
  return undefined;
}

export type UseProtoFormReturn<
  Values extends FormValues,
  Desc extends DescMessage,
  TOnMount extends undefined | FormValidateOrFn<Values>,
  TOnChange extends undefined | FormValidateOrFn<Values>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<Values>,
  TOnBlur extends undefined | FormValidateOrFn<Values>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<Values>,
  TOnSubmit extends undefined | FormValidateOrFn<Values>,
  TOnDynamic extends undefined | FormValidateOrFn<Values>,
  TOnDynamicAsync extends undefined | FormAsyncValidateOrFn<Values>,
  TOnServer extends undefined | FormAsyncValidateOrFn<Values>,
  TSubmitMeta,
> = ReactFormExtendedApi<
  Values,
  TOnMount,
  TOnChange,
  TOnChangeAsync,
  TOnBlur,
  TOnBlurAsync,
  TOnSubmit,
  FormAsyncValidateOrFn<Values>,
  TOnDynamic,
  TOnDynamicAsync,
  TOnServer,
  TSubmitMeta
> & {
  createMessage: (values?: Values) => MessageShape<Desc>;
  createUpdateMask: () => FieldMask;
  clearServerErrorContext: () => void;
  getNestedErrors: <T = Record<string, { message?: string }>>(path: string) => T | undefined;
  serverErrorContext: ConnectErrorContext | undefined;
  setServerErrors: (error: unknown) => {
    context: ConnectErrorContext;
    handled: boolean;
    unmapped: { field: string; description: string }[];
  };
  setOneofValue: (path: string, oneofCase: string, value: unknown, options?: UpdateMetaOptions) => void;
};

function composeSubmitAsyncValidator<Values extends FormValues>(
  nativeValidator: FormAsyncValidateOrFn<Values> | undefined,
  protoValidator: FormValidateOrFn<Values>
): FormAsyncValidateOrFn<Values> {
  return async ({ value, formApi }) => {
    if (nativeValidator) {
      const nativeError = await formApi.runValidator({
        type: "validateAsync",
        validate: nativeValidator,
        value: {
          formApi,
          validationSource: "form",
          value,
        },
      });
      if (nativeError) {
        return nativeError;
      }
    }

    return await formApi.runValidator({
      type: "validateAsync",
      validate: protoValidator,
      value: {
        formApi,
        validationSource: "form",
        value,
      },
    });
  };
}

function setDirtyPath(target: Record<string, unknown>, path: string) {
  const segments = path.replaceAll("[", ".").replaceAll("]", "").split(".").filter(Boolean);
  let current = target;
  for (const [index, segment] of segments.entries()) {
    if (index === segments.length - 1) {
      current[segment] = true;
      return;
    }
    const existing = current[segment];
    if (typeof existing === "object" && existing !== null && !Array.isArray(existing)) {
      current = existing as Record<string, unknown>;
    } else {
      const next: Record<string, unknown> = {};
      current[segment] = next;
      current = next;
    }
  }
}

function dirtyFieldsFromMeta(fieldMeta: Record<string, unknown>): Record<string, unknown> {
  const dirtyFields: Record<string, unknown> = {};
  for (const [path, meta] of Object.entries(fieldMeta)) {
    if (
      typeof meta === "object" &&
      meta !== null &&
      Reflect.get(meta, "isDirty") === true &&
      Reflect.get(meta, "isDefaultValue") !== true
    ) {
      setDirtyPath(dirtyFields, path);
    }
  }
  return dirtyFields;
}

export function useProtoForm<
  Desc extends DescMessage,
  Values extends FormValues,
  TOnMount extends undefined | FormValidateOrFn<Values>,
  TOnChange extends undefined | FormValidateOrFn<Values>,
  TOnChangeAsync extends undefined | FormAsyncValidateOrFn<Values>,
  TOnBlur extends undefined | FormValidateOrFn<Values>,
  TOnBlurAsync extends undefined | FormAsyncValidateOrFn<Values>,
  TOnSubmit extends undefined | FormValidateOrFn<Values>,
  TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<Values>,
  TOnDynamic extends undefined | FormValidateOrFn<Values>,
  TOnDynamicAsync extends undefined | FormAsyncValidateOrFn<Values>,
  TOnServer extends undefined | FormAsyncValidateOrFn<Values>,
  TSubmitMeta,
>(
  schema: Desc,
  options: FormOptions<
    Values,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnDynamic,
    TOnDynamicAsync,
    TOnServer,
    TSubmitMeta
  > & {
    emptyRepeatedStringPolicies?: ProtoConversionOptions["emptyRepeatedStringPolicies"];
    serverPathPrefix?: string;
  }
): UseProtoFormReturn<
  Values,
  Desc,
  TOnMount,
  TOnChange,
  TOnChangeAsync,
  TOnBlur,
  TOnBlurAsync,
  TOnSubmit,
  TOnDynamic,
  TOnDynamicAsync,
  TOnServer,
  TSubmitMeta
> {
  const { emptyRepeatedStringPolicies, serverPathPrefix, ...nativeOptions } = options;
  const conversionOptions: ProtoConversionOptions = {
    emptyRepeatedStringPolicies,
  };
  const protoSchema = createProtoFormSchema<Values, Desc>(schema, conversionOptions);
  const onSubmitAsyncValidator = composeSubmitAsyncValidator(nativeOptions.validators?.onSubmitAsync, protoSchema);
  const composedOptions = {
    ...nativeOptions,
    validators: {
      ...nativeOptions.validators,
      onSubmitAsync: onSubmitAsyncValidator,
    },
  } as unknown as FormOptions<
    Values,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    FormAsyncValidateOrFn<Values>,
    TOnDynamic,
    TOnDynamicAsync,
    TOnServer,
    TSubmitMeta
  >;
  const form = useForm(composedOptions);
  const setDynamicFieldValue = form.setFieldValue as unknown as (
    path: string,
    value: unknown,
    options?: UpdateMetaOptions
  ) => void;
  const sourceMessage = isMessage(nativeOptions.defaultValues, schema) ? nativeOptions.defaultValues : undefined;
  const [serverErrorContext, setServerErrorContext] = useState<ConnectErrorContext>();

  const setServerErrors = (error: unknown) => {
    const context = extractConnectErrorContext(error);
    setServerErrorContext(context);
    if (!(error instanceof ConnectError)) {
      return {
        context,
        handled: false,
        unmapped: [] as { field: string; description: string }[],
      };
    }

    let handled = false;
    const unmapped: { field: string; description: string }[] = [];
    for (const violation of extractFieldViolations(error)) {
      const serverPath = stripPrefix(violation.field, serverPathPrefix);
      const formPath = protoPathToFormPath(schema, serverPath);
      if (!formPath) {
        unmapped.push(violation);
        continue;
      }
      form.setFieldMeta(formPath, (currentMeta) => {
        const meta = currentMeta ?? {
          _arrayVersion: 0,
          _pendingValidationsCount: 0,
          errorMap: {},
          errorSourceMap: {},
          isBlurred: false,
          isDirty: false,
          isTouched: false,
          isValidating: false,
        };
        return {
          ...meta,
          errorMap: {
            ...meta.errorMap,
            onServer: humanizeServerFieldError(violation.description),
          },
          errorSourceMap: {
            ...meta.errorSourceMap,
            onServer: "form",
          },
          isTouched: true,
        };
      });
      handled = true;
    }
    return { context, handled, unmapped };
  };
  const setOneofValue = (path: string, oneofCase: string, value: unknown, updateOptions?: UpdateMetaOptions) => {
    const current = form.getFieldValue(path);
    const isOneof = current === undefined || current === null || (typeof current === "object" && "case" in current);
    if (!isOneof) {
      throw new Error(
        `setOneofValue("${path}"): target is not a oneof field. Expected { case, value } shape. Use setFieldValue() for regular fields.`
      );
    }
    const previous = current as { case?: string } | undefined;
    if (previous?.case && previous.case !== oneofCase) {
      setDynamicFieldValue(path, { case: undefined, value: undefined });
    }
    setDynamicFieldValue(path, { case: oneofCase, value }, { dontUpdateMeta: false, ...updateOptions });
  };
  const getNestedErrors = <T = Record<string, { message?: string }>>(path: string): T | undefined => {
    const nested: Record<string, unknown> = {};
    let found = false;
    const fieldErrors = form.getAllErrors().fields as Record<string, { errors: unknown[] }>;
    for (const [fieldPath, fieldError] of Object.entries(fieldErrors)) {
      if (!(fieldPath === path || fieldPath.startsWith(`${path}.`))) {
        continue;
      }
      const messages = fieldError.errors.flatMap((error) => {
        const message = getErrorMessage(error);
        return message ? [message] : [];
      });
      if (messages.length === 0) {
        continue;
      }
      found = true;
      const relativePath = fieldPath === path ? [] : fieldPath.slice(path.length + 1).split(".");
      if (relativePath.length === 0) {
        return { message: messages.join("\n") } as T;
      }
      setNestedMessage(nested, relativePath, messages.join("\n"));
    }
    return found ? (nested as T) : undefined;
  };

  return Object.assign(form, {
    clearServerErrorContext: () => setServerErrorContext(undefined),
    createMessage: (values?: Values) =>
      formValuesToProto(schema, values ?? form.state.values, sourceMessage, conversionOptions),
    createUpdateMask: () =>
      createDirtyUpdateMask(
        schema,
        dirtyFieldsFromMeta(form.state.fieldMeta as Record<string, unknown>),
        form.state.values,
        nativeOptions.defaultValues
      ),
    getNestedErrors,
    serverErrorContext,
    setOneofValue,
    setServerErrors,
  });
}

function setNestedMessage(target: Record<string, unknown>, path: string[], message: string) {
  let current = target;
  for (const [index, segment] of path.entries()) {
    if (index === path.length - 1) {
      current[segment] = { message };
      return;
    }
    const existing = current[segment];
    if (existing && typeof existing === "object" && !Array.isArray(existing)) {
      current = existing as Record<string, unknown>;
    } else {
      const nested: Record<string, unknown> = {};
      current[segment] = nested;
      current = nested;
    }
  }
}

function stripPrefix(field: string, prefix?: string): string {
  if (!prefix) {
    return field;
  }
  const withDot = `${prefix}.`;
  return field.startsWith(withDot) ? field.slice(withDot.length) : field;
}
