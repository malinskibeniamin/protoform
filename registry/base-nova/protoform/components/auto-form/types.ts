import type { DescMessage } from '@bufbuild/protobuf';
import type { FieldMask } from '@bufbuild/protobuf/wkt';
import type { ReactNode } from 'react';

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

export type AutoFormMode = 'simple' | 'advanced' | 'json';
export type AutoFormValidationMode = 'submit' | 'blur' | 'change';
export type AutoFormRevalidationMode = Exclude<AutoFormValidationMode, 'submit'>;
export type AutoFormStepperOrientation = 'horizontal' | 'vertical';

export type AutoFormStep = {
  description?: ReactNode;
  id: string;
  title: string;
};

export type AutoFormStepperConfig = {
  defaultStep?: string;
  orientation?: AutoFormStepperOrientation;
  steps: AutoFormStep[];
};

export type AutoFormOptionItem = {
  value: string;
  label?: ReactNode;
  icon?: ReactNode;
};

export type AutoFormOptionGroup = {
  label?: ReactNode;
  options: AutoFormOptionItem[];
};

export type FieldTypes = ProtoFieldRenderType | 'date' | 'slider';

export type RenderFieldConfig = FieldConfig<FieldTypes, Record<string, unknown>>;
export type FieldConfigMap = Record<string, RenderFieldConfig>;
export type AutoFormSchemaInput<T extends Record<string, unknown>> = SchemaProvider<T> | DescMessage;

export type AutoFormUiRule = ProtoUiRule;

export type ResolvedSchema = {
  provider: SchemaProvider<Record<string, unknown>>;
  parsedSchema: ParsedSchema;
  isProto: boolean;
  protoDesc?: DescMessage;
};

export type AutoFormPayloadBuilderContext<TNativeForm = unknown> = {
  form: TNativeForm;
  autoForm: AutoFormEngineHandle;
  schema: ParsedSchema;
  isProto: boolean;
  protoDesc?: DescMessage;
  mode: AutoFormMode;
  simpleFields: ParsedField[];
  advancedFields: ParsedField[];
};

export type AutoFormSummaryContext<TNativeForm = unknown> =
  AutoFormPayloadBuilderContext<TNativeForm> & {
    payload: unknown;
    bestEffort: boolean;
  };

export type AutoFormSubmitContext = {
  /** Aborted when a newer submit supersedes this attempt or the form unmounts. */
  signal: AbortSignal;
  /** Engine-neutral operations for callbacks shared across form engines. */
  form: AutoFormEngineHandle;
  /** Dirty, writable protobuf paths since the form was initialized or reset. */
  updateMask?: FieldMask;
};

export type AutoFormProps<
  T extends Record<string, unknown> = Record<string, unknown>,
  TNativeForm = unknown,
  TFormOptions = unknown,
  TResolver = unknown,
> = {
  schema: AutoFormSchemaInput<T>;
  /**
   * Called when a root-level field value changes. Note: nested changes (e.g.
   * address.city) fire as onFieldChange('address', {...}) when the parent
   * object reference changes — the callback receives the root-level key, not
   * the dotted sub-path.
   */
  onFieldChange?: (
    fieldPath: string,
    value: unknown,
    form: TNativeForm
  ) => void | Promise<void>;
  testId?: string;
  onSubmit?: (
    values: T,
    form: TNativeForm,
    context: AutoFormSubmitContext
  ) => void | Promise<void>;
  defaultValues?: Partial<T> | Partial<Record<string, unknown>>;
  values?: Partial<T> | Partial<Record<string, unknown>>;
  children?: React.ReactNode;
  uiComponents?: Partial<AutoFormUIComponents>;
  formComponents?: Partial<AutoFormFieldComponents>;
  withSubmit?: boolean;
  onFormInit?: (form: TNativeForm) => void;
  formProps?: React.ComponentProps<'form'> | Record<string, unknown>;
  fieldConfig?: FieldConfigMap;
  formOptions?: TFormOptions;
  resolver?: TResolver;
  modes?: AutoFormMode[];
  defaultMode?: AutoFormMode;
  /** Shared validation lifecycle across supported AutoForm engines. */
  validationMode?: AutoFormValidationMode;
  /** Lifecycle used after the first submit attempt. */
  revalidationMode?: AutoFormRevalidationMode;
  /** Opt-in linear flow. Field membership comes from schema-agnostic `hints.step` metadata. */
  stepper?: AutoFormStepperConfig;
  showSummary?: boolean;
  renderSummary?: (payload: unknown, context: AutoFormSummaryContext<TNativeForm>) => React.ReactNode;
  fieldRegistry?: FieldTypeRegistry;
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
  dataProviders?: import('./data-providers').DataProviderRegistry;
  classifyField?: (field: ParsedField) => 'simple' | 'advanced';
  payloadSchema?: {
    safeParse: (data: unknown) => { success: boolean; error?: { issues: Array<{ path: unknown[]; message: string }> } };
  };
  payloadBuilder?: (
    values: Record<string, unknown>,
    context: AutoFormPayloadBuilderContext<TNativeForm>
  ) => unknown;
  payloadParser?: (
    payload: unknown,
    context: AutoFormPayloadBuilderContext<TNativeForm>
  ) => Record<string, unknown> | undefined | Promise<Record<string, unknown> | undefined>;
};
