"use client";

import type React from "react";
import type { Resolver, UseFormProps, UseFormReturn } from "react-hook-form";
import { createProtoResolver } from "@/registry/base-nova/protoform/hooks/use-proto-form";
import { ReactHookFormEngine } from "./adapters/react-hook-form";
import { AutoFormCore } from "./auto-form-core";
import { isProtoMessageDescriptor, isProtoProvider } from "./proto";
import { protoConversionOptionsFromFieldConfig } from "./schema";
import type { AutoFormValidationMode, AutoFormProps as BaseAutoFormProps } from "./types";
import type { ProtoformUIComponentMap } from "./ui-component-map";

type FormValues = Record<string, unknown>;

export type AutoFormProps<
  T extends FormValues = FormValues,
  TCustomFieldType extends string = never,
> = BaseAutoFormProps<
  T,
  UseFormReturn<FormValues, unknown, T>,
  UseFormProps<FormValues, unknown, T>,
  Resolver<FormValues, unknown, T>,
  TCustomFieldType
> & { components: ProtoformUIComponentMap };

function toHookFormMode(mode: AutoFormValidationMode): "onBlur" | "onChange" | "onSubmit" {
  switch (mode) {
    case "blur":
      return "onBlur";
    case "change":
      return "onChange";
    case "submit":
      return "onSubmit";
    default:
      throw new TypeError(`Unsupported validation mode: ${mode satisfies never}`);
  }
}

export function AutoForm<T extends FormValues = FormValues, TCustomFieldType extends string = never>(
  props: AutoFormProps<T, TCustomFieldType>
): React.ReactNode;
export function AutoForm({ components, formOptions, resolver, ...props }: AutoFormProps<FormValues, string>) {
  let protoDescriptor = isProtoMessageDescriptor(props.schema) ? props.schema : undefined;
  if (!protoDescriptor && isProtoProvider(props.schema)) {
    protoDescriptor = props.schema.getMessageDescriptor();
  }
  const conversionOptions = {
    ...protoConversionOptionsFromFieldConfig(props.fieldConfig),
    formatMessage: props.formatMessage,
  };
  const resolvedResolver =
    resolver ?? (protoDescriptor ? createProtoResolver(protoDescriptor, conversionOptions) : undefined);
  const engineOptions: UseFormProps<FormValues, unknown, FormValues> = {
    ...(formOptions ?? {}),
    ...(props.validationMode
      ? {
          mode: toHookFormMode(props.validationMode),
        }
      : {}),
    ...(props.revalidationMode
      ? {
          reValidateMode: props.revalidationMode === "change" ? "onChange" : "onBlur",
        }
      : {}),
  };

  return (
    <AutoFormCore<FormValues, UseFormReturn<FormValues, unknown, FormValues>, string>
      {...props}
      components={components}
      renderEngine={({ children, defaultValues, values }) => (
        <ReactHookFormEngine<FormValues>
          defaultValues={defaultValues}
          formOptions={engineOptions}
          onDirtyChange={props.onDirtyChange}
          resolver={resolvedResolver}
          values={values}
        >
          {children}
        </ReactHookFormEngine>
      )}
    />
  );
}
