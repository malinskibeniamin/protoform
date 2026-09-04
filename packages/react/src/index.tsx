"use client";

import {
  AutoFormCore,
  type AutoFormProps as BaseAutoFormProps,
  isProtoMessageDescriptor,
  isProtoProvider,
  type ProtoformUIComponentMap,
  protoConversionOptionsFromFieldConfig,
} from "@protoform/auto-form";
import { createProtoResolver } from "@protoform/core";
import type React from "react";
import type { Resolver, UseFormProps, UseFormReturn } from "react-hook-form";
import { ReactHookFormEngine } from "../../../registry/base-nova/protoform/components/auto-form/adapters/react-hook-form.js";

export {
  type AutoFormArrayController,
  type AutoFormAuditDiagnostic,
  type AutoFormAuditFormat,
  type AutoFormAuditReport,
  type AutoFormAuditTarget,
  type AutoFormConfigurationDiagnostic,
  type AutoFormConfigurationDiagnosticCode,
  AutoFormCore,
  type AutoFormCoreProps,
  type AutoFormDiagnostic,
  type AutoFormEngine,
  type AutoFormEngineHandle,
  AutoFormEngineProvider,
  type AutoFormEngineRender,
  type AutoFormFieldComponents,
  type AutoFormFieldController,
  type AutoFormFieldProps,
  type AutoFormMode,
  type AutoFormRevalidationMode,
  type AutoFormRootHeaderMetadata,
  type AutoFormRootHeaderMode,
  AutoFormSlot,
  type AutoFormStep,
  type AutoFormStepperConfig,
  type AutoFormStepperOrientation,
  type AutoFormSubmitContext,
  type AutoFormValidationMode,
  auditAutoFormConfigurations,
  type BuiltInFieldType,
  type CelEvaluation,
  type CompileCelExpressionOptions,
  type CompiledCelExpression,
  compileCelExpression,
  type DataProvider,
  type DataProviderDefinition,
  type DataProviderDependencyValues,
  type DataProviderOption,
  type DataProviderRegistration,
  type DataProviderRegistry,
  type DataProviderRequest,
  type DataProviderResult,
  type DataProviderStaleSelectionPolicy,
  DEFAULT_CEL_MAX_COST,
  type DeprecatedFieldPolicy,
  defaultClassifyField,
  defaultRegistry,
  type FieldMatchContext,
  type FieldTypeDefinition,
  FieldTypeRegistry,
  type FieldTypes,
  formatAutoFormAuditReport,
  getPathInObject,
  getRootErrorMessage,
  type InspectAutoFormConfigurationInput,
  inspectAutoFormConfiguration,
  type ProtoformUIComponentMap,
  protoConversionOptionsFromFieldConfig,
  ShadcnAutoFormFieldComponents,
  useAutoForm,
  useDirtyStateNotification,
} from "@protoform/auto-form";
export {
  type ComposeCreateRequestOptions,
  type ComposeDeleteRequestOptions,
  type ComposeUpdateRequestOptions,
  type ConnectErrorContext,
  composeCreateRequest,
  composeDeleteRequest,
  composeUpdateRequest,
  createFieldMask,
  createFinalFormValidator,
  createFormikValidator,
  createProtoFormSchema,
  createProtoResolver,
  createUpdateMask,
  dirtyFieldsFromValues,
  type EmptyRepeatedStringPolicy,
  extractConnectErrorContext,
  extractFieldViolations,
  type FieldConfig,
  type FieldRenderHints,
  type FieldViolation,
  type FlattenProtoOneofs,
  type FormValidationErrors,
  type FormValidator,
  type FormValidatorOptions,
  type FormValues,
  formatConnectError,
  formatProtoformMessage,
  formatSubmittedValue,
  formatToastErrorMessage,
  formValuesToProto,
  formValuesToProtoInit,
  getFieldHints,
  getProtoFieldBehaviors,
  getProtoFieldCustomData,
  getProtoFieldUi,
  getProtoMessageUi,
  getProtoMessageUiConfig,
  getProtoOneofUi,
  getProtoResourceMetadata,
  getProtoResourceReference,
  getRegisteredProtoAnnotations,
  grpcCodeLabel,
  type HelpLink,
  humanizeServerFieldError,
  humanizeValidationError,
  type InputProps,
  isGenericValidationMessage,
  isProtoMessageDescriptor,
  isProtoProvider,
  isSingletonProtoResource,
  isStandardSchema,
  type NormalizedProtoIssue,
  type NormalizedProtoValidationResult,
  type OptionGroup,
  type ParsedField,
  type ParsedSchema,
  PROTO_FORM_ROOT_ERROR_KEY,
  type PreconditionViolation,
  type ProtoAnnotations,
  type ProtoAnyFormValue,
  type ProtoConversionOptions,
  type ProtoFieldCustomData,
  type ProtoFieldRenderType,
  type ProtoFieldType,
  type ProtoFieldUiConfig,
  type ProtoFormOptions,
  type ProtoformMessageCode,
  type ProtoformMessageFormatter,
  type ProtoformMessageParams,
  type ProtoMapFormEntry,
  type ProtoMessageUiConfig,
  ProtoProvider,
  type ProtoResolverOptions,
  type ProtoResourceMetadata,
  type ProtoResourceReference,
  type ProtoUiRule,
  type ProtoValidationContext,
  type ProtoValidationScope,
  type ProviderCustomData,
  parseProtoSchema,
  preserveProtoMessageSource,
  protoFormValuesToPayload,
  protoPathToFormPath,
  protoPayloadToFormValues,
  protoToFormValues,
  type QuotaViolation,
  type Renderable,
  registerProtoAnnotations,
  type SchemaProvider,
  type SchemaValidation,
  type SchemaValidationContext,
  type SchemaValidationError,
  SERVER_FIELD_ERROR_FALLBACK,
  type StandardSchemaV1,
  standardSchemaIssuesToFormErrors,
  type UiRule,
  type UseProtoFormOptions,
  type UseProtoFormReturn,
  useProtoForm,
  useProtoFormDefaults,
  validateFormValuesAgainstProtoSchema,
} from "@protoform/core";

interface ReactHookFormValues {
  [key: string]: unknown;
}

export type AutoFormProps<
  T extends ReactHookFormValues = ReactHookFormValues,
  TCustomFieldType extends string = never,
> = Omit<
  BaseAutoFormProps<
    T,
    UseFormReturn<ReactHookFormValues, unknown, T>,
    UseFormProps<ReactHookFormValues, unknown, T>,
    Resolver<ReactHookFormValues, unknown, T>,
    TCustomFieldType
  >,
  "components"
> & {
  components: ProtoformUIComponentMap;
};

function toHookFormMode(mode: NonNullable<BaseAutoFormProps["validationMode"]>): "onBlur" | "onChange" | "onSubmit" {
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

export function AutoForm<T extends ReactHookFormValues = ReactHookFormValues, TCustomFieldType extends string = never>(
  props: AutoFormProps<T, TCustomFieldType>
): React.ReactNode;
export function AutoForm({
  children,
  classifyField,
  components,
  dataProviders,
  defaultMode,
  defaultValues,
  deprecatedFields,
  fieldConfig,
  fieldRegistry,
  formatMessage,
  formComponents,
  formOptions,
  formProps,
  modes,
  onDiagnostic,
  onDirtyChange,
  onFieldChange,
  onFormInit,
  onSubmit,
  payloadBuilder,
  payloadParser,
  payloadSchema,
  renderRootHeader,
  renderSummary,
  resolver,
  revalidationMode,
  rootHeader,
  schema,
  showSummary,
  stepper,
  testId,
  uiComponents,
  validationMode,
  values,
  withSubmit,
}: AutoFormProps<ReactHookFormValues, string>) {
  let protoDescriptor = isProtoMessageDescriptor(schema) ? schema : undefined;
  if (!protoDescriptor && isProtoProvider(schema)) {
    protoDescriptor = schema.getMessageDescriptor();
  }
  const conversionOptions = {
    ...protoConversionOptionsFromFieldConfig(fieldConfig),
    formatMessage,
  };
  const resolvedResolver =
    resolver ?? (protoDescriptor ? createProtoResolver(protoDescriptor, conversionOptions) : undefined);
  const engineOptions: UseFormProps<ReactHookFormValues, unknown, ReactHookFormValues> = {
    ...(formOptions ?? {}),
    ...(validationMode
      ? {
          mode: toHookFormMode(validationMode),
        }
      : {}),
    ...(revalidationMode
      ? {
          reValidateMode: revalidationMode === "change" ? "onChange" : "onBlur",
        }
      : {}),
  };

  return (
    <AutoFormCore<ReactHookFormValues, UseFormReturn<ReactHookFormValues, unknown, ReactHookFormValues>, string>
      classifyField={classifyField}
      components={components}
      dataProviders={dataProviders}
      defaultMode={defaultMode}
      defaultValues={defaultValues}
      deprecatedFields={deprecatedFields}
      fieldConfig={fieldConfig}
      fieldRegistry={fieldRegistry}
      formatMessage={formatMessage}
      formComponents={formComponents}
      formProps={formProps}
      modes={modes}
      onDiagnostic={onDiagnostic}
      onDirtyChange={onDirtyChange}
      onFieldChange={onFieldChange}
      onFormInit={onFormInit}
      onSubmit={onSubmit}
      payloadBuilder={payloadBuilder}
      payloadParser={payloadParser}
      payloadSchema={payloadSchema}
      renderEngine={({ children: engineChildren, defaultValues: engineDefaultValues, values: engineValues }) => (
        <ReactHookFormEngine<ReactHookFormValues>
          defaultValues={engineDefaultValues}
          formOptions={engineOptions}
          onDirtyChange={onDirtyChange}
          resolver={resolvedResolver}
          values={engineValues}
        >
          {engineChildren}
        </ReactHookFormEngine>
      )}
      renderRootHeader={renderRootHeader}
      renderSummary={renderSummary}
      revalidationMode={revalidationMode}
      rootHeader={rootHeader}
      schema={schema}
      showSummary={showSummary}
      stepper={stepper}
      testId={testId}
      uiComponents={uiComponents}
      validationMode={validationMode}
      values={values}
      withSubmit={withSubmit}
    >
      {children}
    </AutoFormCore>
  );
}
