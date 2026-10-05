import type { DescMessage, Message } from '@bufbuild/protobuf';
import type { FieldMask } from '@bufbuild/protobuf/wkt';
import type { ReactNode } from 'react';
import type { ProtoformMessageFormatter } from '@/registry/base-nova/protoform/lib/core/messages';
import type { AutoFormDiagnostic } from './configuration';
import type {
  AutoFormFieldComponents,
  AutoFormUIComponents,
  FieldConfig,
  ParsedField,
  ParsedSchema,
  SchemaProvider,
} from './core-types';
import type { AutoFormEngineHandle } from './engine';
import type { ProtoFieldRenderType, ProtoUiRule } from './proto';
import type { FieldTypeRegistry } from './registry';
import type { ProtoformUIComponentMap } from './ui-component-map';

export type AutoFormMode = 'simple' | 'advanced' | 'json';
export type AutoFormValidationMode = 'submit' | 'blur' | 'change';
export type AutoFormRevalidationMode = Exclude<AutoFormValidationMode, 'submit'>;
export type AutoFormStepperOrientation = 'horizontal' | 'vertical';
export type AutoFormRootHeaderMode = 'auto' | 'hidden';
export type DeprecatedFieldPolicy = 'show' | 'disable' | 'hide';

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

export type BuiltInFieldType = ProtoFieldRenderType | 'dataProviderMultiSelect' | 'date' | 'slider';
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
  form: AutoFormEngineHandle;
  signal: AbortSignal;
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
  classifyField?: (field: ParsedField<FieldTypes<TCustomFieldType>>) => 'simple' | 'advanced';
  components?: ProtoformUIComponentMap;
  dataProviders?: import('./data-providers').DataProviderRegistry;
  defaultMode?: AutoFormMode;
  defaultValues?: Partial<T> | Partial<Record<string, unknown>>;
  deprecatedFields?: DeprecatedFieldPolicy;
  fieldConfig?: FieldConfigMap<TCustomFieldType>;
  fieldRegistry?: FieldTypeRegistry<FieldTypes<TCustomFieldType>>;
  formatMessage?: ProtoformMessageFormatter;
  formComponents?: Partial<AutoFormFieldComponents<FieldTypes<TCustomFieldType>>> | Partial<AutoFormFieldComponents>;
  formOptions?: TFormOptions;
  formProps?: React.ComponentProps<'form'> | Record<string, unknown>;
  modes?: AutoFormMode[];
  onDiagnostic?: (diagnostic: AutoFormDiagnostic) => void;
  onDirtyChange?: (isDirty: boolean) => void;
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
  renderRootHeader?: (metadata: AutoFormRootHeaderMetadata) => ReactNode;
  renderSummary?: (payload: unknown, context: AutoFormSummaryContext<TNativeForm>) => React.ReactNode;
  resolver?: TResolver;
  revalidationMode?: AutoFormRevalidationMode;
  rootHeader?: AutoFormRootHeaderMode;
  schema: AutoFormSchemaInput<T>;
  showSummary?: boolean;
  stepper?: AutoFormStepperConfig;
  testId?: string;
  uiComponents?: Partial<AutoFormUIComponents>;
  validationMode?: AutoFormValidationMode;
  values?: Partial<T> | Partial<Record<string, unknown>>;
  withSubmit?: boolean;
}
