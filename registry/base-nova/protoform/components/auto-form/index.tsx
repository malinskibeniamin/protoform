"use client";

import { AutoForm as HostAutoForm, type AutoFormProps as HostAutoFormProps } from "./host";
import { shadcnUIComponents } from "./shadcn-ui-components";

export type {
  ProtoformMessageCode,
  ProtoformMessageFormatter,
  ProtoformMessageParams,
} from "@/registry/base-nova/protoform/lib/core/messages";
export {
  type AutoFormAuditDiagnostic,
  type AutoFormAuditFormat,
  type AutoFormAuditReport,
  type AutoFormAuditTarget,
  auditAutoFormConfigurations,
  formatAutoFormAuditReport,
} from "./audit";
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
  type AutoFormDiagnostic,
  type InspectAutoFormConfigurationInput,
  inspectAutoFormConfiguration,
} from "./configuration";
export { useAutoForm } from "./context";
export type { AutoFormFieldComponents, AutoFormFieldProps } from "./core-types";
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
} from "./data-providers";
export type { AutoFormEngineHandle } from "./engine";
export { defaultRegistry } from "./fields";
export { defaultClassifyField } from "./helpers";
export { type FieldMatchContext, type FieldTypeDefinition, FieldTypeRegistry } from "./registry";
export { shadcnUIComponents } from "./shadcn-ui-components";
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
export type { ProtoformUIComponentMap } from "./ui-component-map";

export type AutoFormProps<
  T extends Record<string, unknown> = Record<string, unknown>,
  TCustomFieldType extends string = never,
> = Omit<HostAutoFormProps<T, TCustomFieldType>, "components"> & {
  components?: HostAutoFormProps<T, TCustomFieldType>["components"];
};

/** Legacy/demo entrypoint. Consumers bringing their own UI import ./host instead. */
export function AutoForm<
  T extends Record<string, unknown> = Record<string, unknown>,
  TCustomFieldType extends string = never,
>({ components = shadcnUIComponents, ...props }: AutoFormProps<T, TCustomFieldType>) {
  return <HostAutoForm<T, TCustomFieldType> {...props} components={components} />;
}
