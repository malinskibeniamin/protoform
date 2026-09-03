import type { DescMessage, Message } from "@bufbuild/protobuf";
import type { FieldMask } from "@bufbuild/protobuf/wkt";
import type { ReactNode } from "react";
import type { ProtoformMessageFormatter } from "../../lib/core/messages";
import type { AutoFormDiagnostic } from "./configuration";
import type {
  AutoFormFieldComponents,
  AutoFormUIComponents,
  FieldConfig,
  ParsedField,
  ParsedSchema,
  SchemaProvider,
} from "./core-types";
import type { AutoFormEngineHandle } from "./engine";
import type { ProtoFieldRenderType, ProtoUiRule } from "./proto";
import type { FieldTypeRegistry } from "./registry";
import type { ProtoformUIComponentMap } from "./ui-component-map";

export type AutoFormMode = "simple" | "advanced" | "json";
export type AutoFormValidationMode = "submit" | "blur" | "change";
export type AutoFormRevalidationMode = Exclude<AutoFormValidationMode, "submit">;
export type AutoFormStepperOrientation = "horizontal" | "vertical";
export type AutoFormRootHeaderMode = "auto" | "hidden";
export type DeprecatedFieldPolicy = "show" | "disable" | "hide";

export interface AutoFormRootHeaderMetadata {
  description?: string | undefined;
  title?: string | undefined;
}

export interface AutoFormStep {
  description?: ReactNode;
  id: string;
  title: string;
}

export interface AutoFormStepperConfig {
  defaultStep?: string;
  orientation?: AutoFormStepperOrientation;
  steps: AutoFormStep[];
}

export interface AutoFormOptionItem {
  icon?: ReactNode;
  label?: ReactNode;
  value: string;
}

export interface AutoFormOptionGroup {
  label?: ReactNode;
  options: AutoFormOptionItem[];
}

export type BuiltInFieldType = ProtoFieldRenderType | "dataProviderMultiSelect" | "date" | "slider";
export type FieldTypes<TCustom extends string = never> = BuiltInFieldType | TCustom;

export type RenderFieldConfig<TCustom extends string = never> = FieldConfig<
  FieldTypes<TCustom>,
  Record<string, unknown>
>;
export type FieldConfigMap<TCustom extends string = never> = Record<string, RenderFieldConfig<TCustom>>;
export type AutoFormSchemaInput<T extends Record<string, unknown>> = SchemaProvider<T> | DescMessage;

export type AutoFormUiRule = ProtoUiRule;

export interface ResolvedSchema {
  isProto: boolean;
  parsedSchema: ParsedSchema;
  protoDesc?: DescMessage;
  protoSource?: Message | undefined;
  provider: SchemaProvider<Record<string, unknown>>;
}

export interface AutoFormPayloadBuilderContext<TNativeForm = unknown> {
  advancedFields: ParsedField[];
  autoForm: AutoFormEngineHandle;
  form: TNativeForm;
  isProto: boolean;
  mode: AutoFormMode;
  protoDesc?: DescMessage;
  schema: ParsedSchema;
  simpleFields: ParsedField[];
}

export type AutoFormSummaryContext<TNativeForm = unknown> = AutoFormPayloadBuilderContext<TNativeForm> & {
  payload: unknown;
  bestEffort: boolean;
};

export interface AutoFormSubmitContext {
  /** Engine-neutral operations for callbacks shared across form engines. */
  form: AutoFormEngineHandle;
  /** Aborted when a newer submit supersedes this attempt or the form unmounts. */
  signal: AbortSignal;
  /** Dirty, writable protobuf paths since the form was initialized or reset. */
  updateMask?: FieldMask | undefined;
}

export interface AutoFormProps<
  T extends Record<string, unknown> = Record<string, unknown>,
  TNativeForm = unknown,
  TFormOptions = unknown,
  TResolver = unknown,
  TCustomFieldType extends string = never,
> {
  children?: React.ReactNode;
  classifyField?: (field: ParsedField<FieldTypes<TCustomFieldType>>) => "simple" | "advanced";
  /** Host-owned shadcn-compatible primitives used by the registry-installed renderer. */
  components?: ProtoformUIComponentMap;
  /**
   * Named data-source implementations consumed by dropdown-style controls
   * annotated with `field_ui.data_provider`. The keys mirror the proto
   * `DataProviderId` enum (snake-cased or exact string). Values are React
   * hooks returning `{ options, isLoading?, error? }` — AutoForm never
   * inspects internals, so providers can be static arrays or RPC-backed.
   *
   * A CI test (see `__tests__/data-providers.test.ts`) enumerates proto
   * descriptors and asserts every referenced id is registered here.
   */
  dataProviders?: import("./data-providers").DataProviderRegistry;
  defaultMode?: AutoFormMode;
  defaultValues?: Partial<T> | Partial<Record<string, unknown>>;
  /** Presentation policy for fields marked deprecated by the schema. */
  deprecatedFields?: DeprecatedFieldPolicy;
  fieldConfig?: FieldConfigMap<TCustomFieldType>;
  fieldRegistry?: FieldTypeRegistry<FieldTypes<TCustomFieldType>>;
  /** Translates Protoform-owned runtime copy without changing schema- or server-authored text. */
  formatMessage?: ProtoformMessageFormatter;
  formComponents?: Partial<AutoFormFieldComponents<FieldTypes<TCustomFieldType>>>;
  formOptions?: TFormOptions;
  formProps?: React.ComponentProps<"form"> | Record<string, unknown>;
  modes?: AutoFormMode[];
  /** Receives structured configuration diagnostics without coupling Protoform to a logging vendor. */
  onDiagnostic?: (diagnostic: AutoFormDiagnostic) => void;
  /** Reports distinct engine-neutral dirty-state transitions, including the initial clean state. */
  onDirtyChange?: (isDirty: boolean) => void;
  /**
   * Called when a root-level field value changes. Note: nested changes (e.g.
   * address.city) fire as onFieldChange('address', {...}) when the parent
   * object reference changes — the callback receives the root-level key, not
   * the dotted sub-path.
   */
  onFieldChange?: (fieldPath: string, value: unknown, form: TNativeForm) => void | Promise<void>;
  onFormInit?: (form: TNativeForm) => void;
  onSubmit?: (values: T, form: TNativeForm, context: AutoFormSubmitContext) => void | Promise<void>;
  payloadBuilder?: (values: Record<string, unknown>, context: AutoFormPayloadBuilderContext<TNativeForm>) => unknown;
  payloadParser?: (
    payload: unknown,
    context: AutoFormPayloadBuilderContext<TNativeForm>
  ) => Record<string, unknown> | undefined | Promise<Record<string, unknown> | undefined>;
  payloadSchema?: {
    safeParse: (data: unknown) => { success: boolean; error?: { issues: Array<{ path: unknown[]; message: string }> } };
  };
  /** Replaces the default root header while preserving resolved schema metadata. */
  renderRootHeader?: (metadata: AutoFormRootHeaderMetadata) => ReactNode;
  renderSummary?: (payload: unknown, context: AutoFormSummaryContext<TNativeForm>) => React.ReactNode;
  resolver?: TResolver;
  /** Lifecycle used after the first submit attempt. */
  revalidationMode?: AutoFormRevalidationMode;
  /** Controls whether schema-provided root metadata is shown. */
  rootHeader?: AutoFormRootHeaderMode;
  schema: AutoFormSchemaInput<T>;
  showSummary?: boolean;
  /** Opt-in linear flow. Field membership comes from schema-agnostic `hints.step` metadata. */
  stepper?: AutoFormStepperConfig;
  testId?: string;
  uiComponents?: Partial<AutoFormUIComponents>;
  /** Shared validation lifecycle across supported AutoForm engines. */
  validationMode?: AutoFormValidationMode;
  values?: Partial<T> | Partial<Record<string, unknown>>;
  withSubmit?: boolean;
}
