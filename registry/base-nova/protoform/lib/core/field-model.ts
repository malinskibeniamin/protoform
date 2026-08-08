/**
 * Schema-agnostic field model: the IR every schema provider produces and
 * the AutoForm engine consumes.
 *
 * Providers (protobuf today; Zod/Valibot/ArkType later) parse their native
 * schema into `ParsedSchema` and populate `FieldRenderHints` from whatever
 * metadata their ecosystem carries (proto annotations, schema descriptions,
 * library-specific registries). The rendering engine reads ONLY this model,
 * never provider-native handles. Provider-native data (for example proto
 * descriptors and validation rules) stays in `FieldConfig.customData`,
 * which only provider-specific code may interpret.
 */

/** A conditional UI rule evaluated against current form values (CEL today). */
export interface UiRule {
  expression?: string;
  id?: string;
  message?: string;
}

export interface OptionGroup {
  label?: string;
  options: [value: string, label: string][];
}

/** Values a field label or description may hold in the schema layer. The React layer widens this with ReactNode. */
export type Renderable = string | number | boolean | null | undefined;

/** HTML input attributes forwarded to the rendered control. */
export interface InputProps {
  [attribute: string]: string | number | boolean | undefined;
}

/**
 * Provider-private data attached to a field. Only code from the provider
 * that produced the schema may interpret the remaining properties; the
 * rendering engine must not reach into this.
 */
export interface ProviderCustomData {
  /** Discriminator naming the provider that produced this field (for example "proto"). */
  source?: string;
  [key: string]: unknown;
}

/** The value bag a form works over: field names to arbitrary user input. */
export interface FormValues {
  [field: string]: unknown;
}

/** How protobuf conversion treats empty entries in a repeated string field. */
export type EmptyRepeatedStringPolicy = "discard" | "preserve";

/**
 * Render-driving metadata, independent of any schema system.
 * Everything here answers "how should this field look and behave",
 * never "how is this field validated" (validation flows through
 * Standard Schema).
 */
export interface FieldRenderHints {
  /** Explicit simple/advanced classification override. */
  advanced?: boolean;
  /** Restrict JSON/field-mask style inputs to these paths. */
  allowedPaths?: string[];
  /** Control-type override; a key into the consumer's control registry. */
  control?: string;
  /** Named data source id for dropdown-style controls. */
  dataProvider?: string;
  /** The schema marks this field as deprecated. */
  deprecated?: boolean;
  /** Concise one-liner shown below the input. */
  description?: string;
  disabledWhen?: UiRule[];
  docsUrl?: string;
  /** Enable file drag-and-drop into the field value. */
  dropzone?: boolean;
  /** Keep blank repeated-string rows instead of discarding them during conversion. */
  emptyRepeatedStringPolicy?: EmptyRepeatedStringPolicy;
  example?: string;
  /** Detailed help text (tooltip). */
  help?: string;
  /** HTML input `type` hint (for example `email`, `url`, `number`). */
  inputType?: string;
  /** JSON-ish payload rendering mode for structured values. */
  jsonKind?: "struct" | "value" | "listValue" | "any";
  maxItems?: number;
  maxPairs?: number;
  minItems?: number;
  minPairs?: number;
  optionGroups?: OptionGroup[];
  optionLabels?: Record<string, string>;
  placeholder?: string;
  secretScope?: string;
  sensitive?: boolean;
  /** Stepper step id this field belongs to. */
  step?: string;
  /** Label used in review/summary contexts instead of the field label. */
  summaryLabel?: string;
  /** Tri-state controls: the unset state is meaningful and selectable. */
  supportsUnset?: boolean;
  visibleWhen?: UiRule[];
}

export interface FieldConfig<
  FieldTypes = string,
  CustomData extends ProviderCustomData = ProviderCustomData,
> {
  customData?: CustomData;
  description?: Renderable;
  /** Keep blank repeated-string rows instead of discarding them during conversion. */
  emptyRepeatedStringPolicy?: EmptyRepeatedStringPolicy;
  fieldType?: FieldTypes;
  inputProps?: InputProps;
  label?: Renderable;
  order?: number;
}

export interface ParsedField<FieldTypes = string> {
  default?: unknown;
  description?: Renderable;
  fieldConfig?: FieldConfig<FieldTypes>;
  hints?: FieldRenderHints;
  key: string;
  options?: [value: string, label: string][];
  required: boolean;
  schema?: ParsedField<FieldTypes>[];
  type: string;
}

export interface ParsedSchema<FieldTypes = string> {
  fields: ParsedField<FieldTypes>[];
}

export interface SchemaValidationError {
  message: string;
  path: (string | number)[];
}

export type SchemaValidation =
  | { success: true; data: unknown }
  | { success: false; errors: SchemaValidationError[] };

export interface SchemaValidationContext {
  /** Aborted when a newer validation supersedes this run or its form unmounts. */
  signal: AbortSignal;
}

export interface SchemaProvider<Values extends FormValues = FormValues> {
  getDefaultValues: () => FormValues;
  parseSchema: () => ParsedSchema;
  validateSchema: (
    values: Values,
    context?: SchemaValidationContext
  ) => SchemaValidation | Promise<SchemaValidation>;
}

/** Read a field's render hints; single accessor so call sites never reach into provider customData. */
export function getFieldHints<FieldTypes>(
  field: ParsedField<FieldTypes>
): FieldRenderHints | undefined {
  return field.hints;
}
