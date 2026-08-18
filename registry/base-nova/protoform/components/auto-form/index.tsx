"use client";

import type { Resolver, UseFormProps, UseFormReturn } from "react-hook-form";
import { createProtoResolver } from "../../hooks/use-proto-form";
import { ReactHookFormEngine } from "./adapters/react-hook-form";
import { AutoFormCore } from "./auto-form-core";
import { isProtoMessageDescriptor, isProtoProvider } from "./proto";
import { protoConversionOptionsFromFieldConfig } from "./schema";
import type { AutoFormValidationMode, AutoFormProps as BaseAutoFormProps } from "./types";

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
>;

export { ShadcnAutoFormFieldComponents } from "./auto-form-core";
export {
  type CelEvaluation,
  type CompileCelExpressionOptions,
  type CompiledCelExpression,
  compileCelExpression,
  DEFAULT_CEL_MAX_COST,
} from "./cel-runtime";
export {
  type AutoFormConfigurationDiagnostic,
  type AutoFormConfigurationDiagnosticCode,
  type InspectAutoFormConfigurationInput,
  inspectAutoFormConfiguration,
} from "./configuration";
export { useAutoForm } from "./context";
export type { AutoFormFieldComponents, AutoFormFieldProps } from "./core-types";
export type { AutoFormEngineHandle } from "./engine";
export { defaultRegistry } from "./fields";
export { defaultClassifyField } from "./helpers";
export { type FieldMatchContext, type FieldTypeDefinition, FieldTypeRegistry } from "./registry";
export { AutoFormSlot } from "./slot";
export type {
  AutoFormMode,
  AutoFormRevalidationMode,
  AutoFormRootHeaderMetadata,
  AutoFormRootHeaderMode,
  AutoFormStep,
  AutoFormStepperConfig,
  AutoFormStepperOrientation,
  AutoFormSubmitContext,
  AutoFormValidationMode,
  BuiltInFieldType,
  DeprecatedFieldPolicy,
  FieldTypes,
} from "./types";

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

export function AutoForm<T extends FormValues = FormValues, TCustomFieldType extends string = never>({
  formOptions,
  resolver,
  ...props
}: AutoFormProps<T, TCustomFieldType>) {
  let protoDescriptor = isProtoMessageDescriptor(props.schema) ? props.schema : undefined;
  if (!protoDescriptor && isProtoProvider(props.schema)) {
    protoDescriptor = props.schema.getMessageDescriptor();
  }
  const conversionOptions = protoConversionOptionsFromFieldConfig(props.fieldConfig);
  const resolvedResolver =
    resolver ??
    (protoDescriptor
      ? (createProtoResolver(protoDescriptor, conversionOptions) as unknown as Resolver<FormValues, unknown, T>)
      : undefined);
  const engineOptions: UseFormProps<FormValues, unknown, T> = {
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
    <AutoFormCore<T, UseFormReturn<FormValues, unknown, T>, TCustomFieldType>
      {...props}
      renderEngine={({ children, defaultValues, values }) => (
        <ReactHookFormEngine<T>
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
