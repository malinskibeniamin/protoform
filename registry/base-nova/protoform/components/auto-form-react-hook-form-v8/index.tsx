"use client";

import type React from "react";
import type { Resolver, UseFormProps, UseFormReturn } from "react-hook-form-v8";
import { createProtoResolver } from "../../hooks/use-proto-form-v8";
import { ReactHookFormEngine } from "../auto-form/adapters/react-hook-form-v8";
import { AutoFormCore } from "../auto-form/auto-form-core";
import { isProtoMessageDescriptor, isProtoProvider } from "../auto-form/proto";
import { protoConversionOptionsFromFieldConfig } from "../auto-form/schema";
import { shadcnUIComponents } from "../auto-form/shadcn-ui-components";
import type { AutoFormValidationMode, AutoFormProps as BaseAutoFormProps } from "../auto-form/types";

export type { ProtoformMessageCode, ProtoformMessageFormatter, ProtoformMessageParams } from "../../lib/core/messages";

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

export {
  type AutoFormAuditDiagnostic,
  type AutoFormAuditFormat,
  type AutoFormAuditReport,
  type AutoFormAuditTarget,
  auditAutoFormConfigurations,
  formatAutoFormAuditReport,
} from "../auto-form/audit";
export { ShadcnAutoFormFieldComponents } from "../auto-form/auto-form-core";
export {
  type CelEvaluation,
  type CompileCelExpressionOptions,
  type CompiledCelExpression,
  compileCelExpression,
  DEFAULT_CEL_MAX_COST,
} from "../auto-form/cel-runtime";
export {
  type AutoFormConfigurationDiagnostic,
  type AutoFormConfigurationDiagnosticCode,
  type AutoFormDiagnostic,
  type InspectAutoFormConfigurationInput,
  inspectAutoFormConfiguration,
} from "../auto-form/configuration";
export { useAutoForm } from "../auto-form/context";
export type { AutoFormFieldComponents, AutoFormFieldProps } from "../auto-form/core-types";
export type {
  DataProvider,
  DataProviderDefinition,
  DataProviderDependencyValues,
  DataProviderOption,
  DataProviderRegistration,
  DataProviderRegistry,
  DataProviderRequest,
  DataProviderResult,
  DataProviderStaleSelectionPolicy,
} from "../auto-form/data-providers";
export type { AutoFormEngineHandle } from "../auto-form/engine";
export { defaultRegistry } from "../auto-form/fields";
export { defaultClassifyField } from "../auto-form/helpers";
export { type FieldMatchContext, type FieldTypeDefinition, FieldTypeRegistry } from "../auto-form/registry";
export { AutoFormSlot } from "../auto-form/slot";
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
} from "../auto-form/types";

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
export function AutoForm({
  components = shadcnUIComponents,
  formOptions,
  resolver,
  ...props
}: AutoFormProps<FormValues, string>) {
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
