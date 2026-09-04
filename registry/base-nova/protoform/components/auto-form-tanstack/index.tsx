"use client";

import { type TanStackAutoFormApi, TanStackEngine, type TanStackFormOptions } from "../auto-form/adapters/tanstack";
import { AutoFormCore } from "../auto-form/auto-form-core";
import { shadcnUIComponents } from "../auto-form/shadcn-ui-components";
import type { AutoFormProps as BaseAutoFormProps } from "../auto-form/types";

export type { ProtoformMessageCode, ProtoformMessageFormatter, ProtoformMessageParams } from "../../lib/core/messages";

type FormValues = Record<string, unknown>;

export type AutoFormProps<T extends FormValues = FormValues, TCustomFieldType extends string = never> = Omit<
  BaseAutoFormProps<T, TanStackAutoFormApi, TanStackFormOptions, never, TCustomFieldType>,
  "resolver"
>;

export type { TanStackAutoFormApi, TanStackFormOptions } from "../auto-form/adapters/tanstack";
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
export {
  type FieldMatchContext,
  type FieldTypeDefinition,
  FieldTypeRegistry,
} from "../auto-form/registry";
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

export function AutoForm<T extends FormValues = FormValues, TCustomFieldType extends string = never>({
  components = shadcnUIComponents,
  formOptions,
  ...props
}: AutoFormProps<T, TCustomFieldType>) {
  return (
    <AutoFormCore<T, TanStackAutoFormApi, TCustomFieldType>
      {...props}
      components={components}
      renderEngine={({ children, defaultValues, values }) => (
        <TanStackEngine
          defaultValues={defaultValues}
          formOptions={formOptions}
          onDirtyChange={props.onDirtyChange}
          values={values}
        >
          {children}
        </TanStackEngine>
      )}
    />
  );
}
