import { FieldBehavior } from "@buf/googleapis_googleapis.bufbuild_es/google/api/field_behavior_pb.js";
import {
  create,
  type DescField,
  type DescMessage,
  type DescOneof,
  getExtension,
  type MessageShape,
  type MessageValidType,
  ScalarType,
} from "@bufbuild/protobuf";
import { FieldOptionsSchema, isWrapperDesc, MessageOptionsSchema, OneofOptionsSchema } from "@bufbuild/protobuf/wkt";
import type {
  FieldRenderHints,
  ParsedField,
  ParsedSchema,
  ProviderCustomData,
  SchemaProvider,
  SchemaValidation,
  StandardSchemaV1,
} from "../core/index.js";
import {
  getProtoFieldBehaviors,
  getProtoResourceMetadata,
  getProtoResourceReference,
  type ProtoResourceMetadata,
  type ProtoResourceReference,
} from "./aip.js";
import type { ProtoAnnotations } from "./annotations.js";
import { getRegisteredProtoAnnotations } from "./annotations.js";
import {
  ANY_TYPE,
  cloneField,
  DURATION_TYPE,
  type EnumField,
  FIELD_MASK_TYPE,
  is64BitScalar,
  LIST_VALUE_TYPE,
  type ListField,
  type MapField,
  type MessageField,
  STRUCT_TYPE,
  TIMESTAMP_TYPE,
  tracksPresence,
  VALUE_TYPE,
} from "./descriptor-utils.js";
import type { FieldRules, MessageRules, OneofRules, StringRules } from "./gen/buf/validate/validate_pb.js";
import {
  field as fieldExtension,
  message as messageExtension,
  oneof as oneofExtension,
} from "./gen/buf/validate/validate_pb.js";
import {
  PROTO_FORM_ROOT_ERROR_KEY as RUNTIME_PROTO_FORM_ROOT_ERROR_KEY,
  type NormalizedProtoIssue as RuntimeNormalizedProtoIssue,
  type NormalizedProtoValidationResult as RuntimeNormalizedProtoValidationResult,
  type ProtoAnyFormValue as RuntimeProtoAnyFormValue,
  type ProtoConversionOptions as RuntimeProtoConversionOptions,
  type ProtoFormOptions as RuntimeProtoFormOptions,
  type ProtoMapFormEntry as RuntimeProtoMapFormEntry,
  type ProtoValidationContext as RuntimeProtoValidationContext,
  formValuesToProto as runtimeFormValuesToProto,
  formValuesToProtoInit as runtimeFormValuesToProtoInit,
  preserveProtoMessageSource as runtimePreserveProtoMessageSource,
  protoFormValuesToPayload as runtimeProtoFormValuesToPayload,
  protoPayloadToFormValues as runtimeProtoPayloadToFormValues,
  protoToFormValues as runtimeProtoToFormValues,
  validateFormValuesAgainstProtoSchema as runtimeValidateFormValuesAgainstProtoSchema,
} from "./hook-runtime.js";
import type { ProtoFieldUiConfig, ProtoMessageUiConfig } from "./ui-options.js";
import { getProtoFieldUi, getProtoMessageUi, getProtoOneofUi } from "./ui-options.js";
import { createDescriptorAwareStandardSchema } from "./validation-schema.js";

export const PROTO_FORM_ROOT_ERROR_KEY = RUNTIME_PROTO_FORM_ROOT_ERROR_KEY;
export const formValuesToProto = runtimeFormValuesToProto;
export const formValuesToProtoInit = runtimeFormValuesToProtoInit;
export const preserveProtoMessageSource = runtimePreserveProtoMessageSource;
export const protoFormValuesToPayload = runtimeProtoFormValuesToPayload;
export const protoPayloadToFormValues = runtimeProtoPayloadToFormValues;
export const protoToFormValues = runtimeProtoToFormValues;
export const validateFormValuesAgainstProtoSchema = runtimeValidateFormValuesAgainstProtoSchema;

export interface NormalizedProtoIssue extends RuntimeNormalizedProtoIssue {}
export type NormalizedProtoValidationResult<Output> = RuntimeNormalizedProtoValidationResult<Output>;
export interface ProtoAnyFormValue extends RuntimeProtoAnyFormValue {}
export interface ProtoConversionOptions extends RuntimeProtoConversionOptions {}
export interface ProtoFormOptions extends RuntimeProtoFormOptions {}
export interface ProtoMapFormEntry extends RuntimeProtoMapFormEntry {}
export interface ProtoValidationContext extends RuntimeProtoValidationContext {}

export type ProtoFieldType =
  | "string"
  | "number"
  | "boolean"
  | "select"
  | "object"
  | "array"
  | "oneof"
  | "map"
  | "bytes"
  | "int64"
  | "timestamp"
  | "duration"
  | "fieldMask"
  | "json";

export type ProtoFieldRenderType =
  | ProtoFieldType
  | "textarea"
  | "password"
  | "email"
  | "url"
  | "currency"
  | "checkbox"
  | "switch"
  | "toggle"
  | "radio"
  | "combobox"
  | "multiselect"
  | "choicebox"
  | "toggleGroup"
  | "keyValue"
  // Widget routing derived from field_ui annotations — `data_provider`
  // promotes a string/number field to `dataProviderSelect`, and a JSON
  // field with `dropzone: true` promotes to `dropzone-json`.
  | "dataProviderSelect"
  | "dropzone-json";

type ProtoJsonKind = "struct" | "value" | "listValue" | "any";

type ParsedProtoField = ParsedField<ProtoFieldRenderType>;
type ParsedProtoSchema = ParsedSchema<ProtoFieldRenderType>;

export interface ProtoFieldCustomData extends ProviderCustomData {
  allowedPaths?: string[] | undefined;
  deprecated?: boolean | undefined;
  desc?: DescField | undefined;
  fieldBehaviors?: readonly FieldBehavior[] | undefined;
  fieldRules?: FieldRules | undefined;
  hidden?: boolean | undefined;
  identifier?: boolean | undefined;
  immutable?: boolean | undefined;
  inputOnly?: boolean | undefined;
  inputType?: string | undefined;
  jsonKind?: ProtoJsonKind | undefined;
  keyField?: ParsedProtoField | undefined;
  maxItems?: number | undefined;
  maxPairs?: number | undefined;
  messageRules?: MessageRules | undefined;
  minItems?: number | undefined;
  minPairs?: number | undefined;
  oneof?: DescOneof | undefined;
  oneofRules?: OneofRules | undefined;
  recursive?: boolean | undefined;
  resource?: ProtoResourceMetadata | undefined;
  resourceReference?: ProtoResourceReference | undefined;
  ruleExample?: string | undefined;
  secretScope?: string | undefined;
  source: "proto";
  supportsUnset?: boolean | undefined;
  ui?: ProtoFieldUiConfig | undefined;
  valueField?: ParsedProtoField | undefined;
}

type ProtoFieldConfig = ParsedProtoField["fieldConfig"] & {
  customData?: ProtoFieldCustomData;
};

interface ProtoParserContext {
  ancestors: ReadonlySet<string>;
  annotations?: ProtoAnnotations | undefined;
  messageUi?: ProtoMessageUiConfig | undefined;
  operation?: "create" | "update" | undefined;
  secretScope?: string | undefined;
}

export function isProtoMessageDescriptor(value: unknown): value is DescMessage {
  return Boolean(
    value &&
      typeof value === "object" &&
      "kind" in value &&
      (value as { kind?: unknown }).kind === "message" &&
      "typeName" in value &&
      typeof (value as { typeName?: unknown }).typeName === "string" &&
      "members" in value &&
      Array.isArray((value as { members?: unknown }).members)
  );
}

export function getProtoFieldCustomData<FieldType extends string>(
  field: ParsedField<FieldType>
): ProtoFieldCustomData | undefined {
  return (field.fieldConfig as ProtoFieldConfig | undefined)?.customData;
}

function getFieldRules(field: DescField): FieldRules {
  return getExtension(field.proto.options ?? create(FieldOptionsSchema), fieldExtension);
}

function getMessageRules(desc: DescMessage): MessageRules {
  return getExtension(desc.proto.options ?? create(MessageOptionsSchema), messageExtension);
}

function getOneofRules(oneof: DescOneof): OneofRules {
  return getExtension(oneof.proto.options ?? create(OneofOptionsSchema), oneofExtension);
}

const UNSPECIFIED_PATTERN = /(unspecified|unknown)$/iu;
const CAMEL_BOUNDARY_PATTERN = /([a-z0-9])([A-Z])/gu;
const WORD_SEPARATOR_PATTERN = /[_.-]+/gu;
const WHITESPACE_PATTERN = /\s+/gu;

function isUnspecifiedEnumValue(enumValue: { number: number; localName: string; name?: string }): boolean {
  if (enumValue.number !== 0) {
    return false;
  }
  // Check both localName (camelCase) and name (SCREAMING_SNAKE_CASE) for unspecified/unknown suffix
  return (
    UNSPECIFIED_PATTERN.test(enumValue.localName) ||
    (typeof enumValue.name === "string" && UNSPECIFIED_PATTERN.test(enumValue.name))
  );
}

function humanize(input: string): string {
  return input
    .replace(CAMEL_BOUNDARY_PATTERN, "$1 $2")
    .replace(WORD_SEPARATOR_PATTERN, " ")
    .replace(WHITESPACE_PATTERN, " ")
    .trim()
    .split(" ")
    .map((word) => {
      const lower = word.toLowerCase();
      if (word === word.toUpperCase() && word.length > 1) {
        return word.charAt(0) + lower.slice(1);
      }
      return word.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

const NORMALIZE_SEPARATOR_PATTERN = /[\s_-]+/gu;

// Returns the raw localName for enum values.
// Consumers can override labels via optionLabels in fieldConfig.
// We intentionally do NOT humanize enum values because the transformed
// names are often confusing (e.g., "Api Key Location Header" vs "HEADER").
function formatEnumLabel(enumLocalName: string, enumTypeName: string): string {
  // Proto-gen-es v2 pre-strips the type prefix from localName in most cases.
  // If the localName still starts with the type name (camelCase), strip it.
  const typePrefixNormalized = enumTypeName.toLowerCase().replace(NORMALIZE_SEPARATOR_PATTERN, "");
  const valueNormalized = enumLocalName.toLowerCase().replace(NORMALIZE_SEPARATOR_PATTERN, "");
  if (valueNormalized.startsWith(typePrefixNormalized) && valueNormalized.length > typePrefixNormalized.length) {
    const stripped = enumLocalName.slice(typePrefixNormalized.length);
    if (stripped.length > 0) {
      return humanize(stripped);
    }
  }
  return humanize(enumLocalName);
}

function buildEnumOptions(
  values: readonly {
    number: number;
    localName: string;
    name?: string;
  }[],
  enumTypeName: string
): [string, string][] {
  const seenNumbers = new Set<number>();

  const options: [string, string][] = [];
  for (const value of values) {
    if (isUnspecifiedEnumValue(value) || seenNumbers.has(value.number)) {
      continue;
    }
    seenNumbers.add(value.number);
    options.push([String(value.number), formatEnumLabel(value.localName, enumTypeName)]);
  }
  return options;
}

function bigIntToNumber(value: bigint | undefined): number | undefined {
  if (value === undefined) {
    return;
  }
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

function getStringInputType(rules: StringRules | undefined): string | undefined {
  switch (rules?.wellKnown.case) {
    case "email":
      return "email";
    case "uri":
      return "url";
    case "uuid":
      return "text";
    default:
      return;
  }
}

function withFieldUi(customData: ProtoFieldCustomData, field: DescField): ProtoFieldCustomData {
  return {
    ...customData,
    ui: getProtoFieldUi(field),
  };
}

function withOneofUi(customData: ProtoFieldCustomData, oneof: DescOneof): ProtoFieldCustomData {
  return {
    ...customData,
    ui: getProtoOneofUi(oneof),
  };
}

type ProtoInputProps = Record<string, string | number | boolean | undefined>;

/**
 * Derive the schema-agnostic render hints for a field from its
 * proto-private customData. The rendering engine reads hints via
 * `getFieldHints`; customData stays provider-internal.
 */
function hintsFromCustomData(data: ProtoFieldCustomData | undefined): FieldRenderHints | undefined {
  if (!data) {
    return undefined;
  }
  const { ui } = data;
  const hints: FieldRenderHints = {};
  const assign = <Key extends keyof FieldRenderHints>(key: Key, value: FieldRenderHints[Key] | undefined) => {
    if (value !== undefined) {
      hints[key] = value;
    }
  };

  assign("control", ui?.control);
  assign("inputType", data.inputType);
  assign("placeholder", ui?.placeholder);
  assign("example", ui?.example ?? data.ruleExample);
  assign("help", ui?.help);
  assign("description", ui?.description);
  assign("summaryLabel", ui?.summaryLabel);
  assign("sensitive", ui?.sensitive);
  assign("step", ui?.step);
  assign("secretScope", data.secretScope);
  assign("docsUrl", ui?.docsUrl);
  assign("visibleWhen", ui?.visibleWhen);
  assign("disabledWhen", ui?.disabledWhen);
  assign("supportsUnset", data.supportsUnset);
  assign("jsonKind", data.jsonKind);
  assign("minItems", data.minItems);
  assign("maxItems", data.maxItems);
  assign("minPairs", data.minPairs);
  assign("maxPairs", data.maxPairs);
  assign("allowedPaths", data.allowedPaths);
  assign("dataProvider", ui?.dataProvider);
  assign("deprecated", data.deprecated);
  assign("dropzone", ui?.dropzone);

  return Object.keys(hints).length > 0 ? hints : undefined;
}

/** Attach derived render hints to a parsed field, in place. */
function attachRenderHints(field: ParsedProtoField): ParsedProtoField {
  const hints = hintsFromCustomData((field.fieldConfig as ProtoFieldConfig | undefined)?.customData);
  if (hints) {
    field.hints = hints;
  }
  return field;
}

function buildFieldConfig(
  customData: ProtoFieldCustomData,
  inputProps: ProtoInputProps = {},
  description?: string
): ProtoFieldConfig {
  const fieldType = customData.ui?.control as ProtoFieldRenderType | undefined;

  return {
    customData,
    description,
    fieldType,
    inputProps: {
      ...(customData.ui?.placeholder ? { placeholder: customData.ui.placeholder } : {}),
      ...inputProps,
    },
  };
}

function getMessageDescription(desc: DescMessage, context: ProtoParserContext): string | undefined {
  return context.annotations?.messages?.[desc.typeName];
}

function getFieldDescription(field: DescField, context: ProtoParserContext): string | undefined {
  return context.annotations?.fields?.[`${field.parent.typeName}.${field.localName}`];
}

function getOneofDescription(oneof: DescOneof, context: ProtoParserContext): string | undefined {
  return context.annotations?.oneofs?.[`${oneof.parent.typeName}.${oneof.localName}`];
}

function extractNumericBounds(rules: FieldRules | undefined): {
  min?: number | undefined;
  max?: number | undefined;
  step?: string | undefined;
} {
  const typeCase = rules?.type.case;
  if (!typeCase) {
    return {};
  }

  const numericRules = rules.type.value as {
    lessThan?: { case?: string; value?: number | bigint };
    greaterThan?: { case?: string; value?: number | bigint };
  };

  const step = ["float", "double"].includes(typeCase) ? "any" : "1";
  let min: number | undefined;
  let max: number | undefined;

  if (numericRules.greaterThan?.case === "gte") {
    min = Number(numericRules.greaterThan.value);
  } else if (numericRules.greaterThan?.case === "gt") {
    const greaterThan = Number(numericRules.greaterThan.value);
    min = Number.isFinite(greaterThan) ? greaterThan + (step === "1" ? 1 : 0) : undefined;
  }

  if (numericRules.lessThan?.case === "lte") {
    max = Number(numericRules.lessThan.value);
  } else if (numericRules.lessThan?.case === "lt") {
    const lessThan = Number(numericRules.lessThan.value);
    max = Number.isFinite(lessThan) ? lessThan - (step === "1" ? 1 : 0) : undefined;
  }

  if (min !== undefined && max !== undefined && min > max) {
    return { step };
  }

  return { max, min, step };
}

function buildStringField(field: DescField, rules: FieldRules, context: ProtoParserContext): ParsedProtoField {
  const stringRules = rules.type.case === "string" ? rules.type.value : undefined;
  const inputType = getStringInputType(stringRules);

  return {
    fieldConfig: buildFieldConfig(
      withFieldUi(
        {
          desc: field,
          fieldRules: rules,
          inputType,
          ruleExample: stringRules?.example[0],
          source: "proto",
          supportsUnset: tracksPresence(field),
        },
        field
      ),
      {
        maxLength: bigIntToNumber(stringRules?.maxLen),
        minLength: bigIntToNumber(stringRules?.minLen),
        pattern: stringRules?.pattern || undefined,
        type: inputType,
      },
      getFieldDescription(field, context)
    ),
    key: field.localName,
    required: rules.required,
    type: "string",
  };
}

function buildNumberField(field: DescField, rules: FieldRules, context: ProtoParserContext): ParsedProtoField {
  const { min, max, step } = extractNumericBounds(rules);
  const isInt64 = is64BitScalar(field.scalar);

  return {
    fieldConfig: buildFieldConfig(
      withFieldUi(
        {
          desc: field,
          fieldRules: rules,
          source: "proto",
          supportsUnset: tracksPresence(field),
        },
        field
      ),
      {
        ...(max === undefined ? {} : { max }),
        ...(min === undefined ? {} : { min }),
        step,
      },
      getFieldDescription(field, context)
    ),
    key: field.localName,
    required: rules.required,
    type: isInt64 ? "int64" : "number",
  };
}

function buildBooleanField(field: DescField, rules: FieldRules, context: ProtoParserContext): ParsedProtoField {
  return {
    fieldConfig: buildFieldConfig(
      withFieldUi(
        {
          desc: field,
          fieldRules: rules,
          source: "proto",
          supportsUnset: tracksPresence(field),
        },
        field
      ),
      {},
      getFieldDescription(field, context)
    ),
    key: field.localName,
    required: rules.required,
    type: "boolean",
  };
}

function buildBytesField(field: DescField, rules: FieldRules, context: ProtoParserContext): ParsedProtoField {
  return {
    fieldConfig: buildFieldConfig(
      withFieldUi(
        {
          desc: field,
          fieldRules: rules,
          source: "proto",
          supportsUnset: tracksPresence(field),
        },
        field
      ),
      {},
      getFieldDescription(field, context)
    ),
    key: field.localName,
    required: rules.required,
    type: "bytes",
  };
}

function buildEnumField(field: EnumField, rules: FieldRules, context: ProtoParserContext): ParsedProtoField {
  return {
    fieldConfig: buildFieldConfig(
      withFieldUi(
        {
          desc: field,
          fieldRules: rules,
          source: "proto",
          supportsUnset: tracksPresence(field),
        },
        field
      ),
      {},
      getFieldDescription(field, context)
    ),
    key: field.localName,
    options: buildEnumOptions(field.enum.values, field.enum.name),
    required: rules.required,
    type: "select",
  };
}

function buildJsonField(
  field: DescField,
  rules: FieldRules,
  jsonKind: ProtoJsonKind,
  context: ProtoParserContext
): ParsedProtoField {
  return {
    fieldConfig: buildFieldConfig(
      withFieldUi(
        {
          desc: field,
          fieldRules: rules,
          jsonKind,
          source: "proto",
          supportsUnset: tracksPresence(field),
        },
        field
      ),
      {},
      getFieldDescription(field, context)
    ),
    key: field.localName,
    required: rules.required,
    type: "json",
  };
}

function buildRecursiveField(
  field: DescField,
  rules: FieldRules | undefined,
  context: ProtoParserContext,
  key = field.localName
): ParsedProtoField {
  return {
    fieldConfig: buildFieldConfig(
      {
        desc: field,
        fieldRules: rules,
        recursive: true,
        source: "proto",
        supportsUnset: tracksPresence(field),
      },
      {},
      getFieldDescription(field, context)
    ),
    key,
    required: Boolean(rules?.required),
    type: "json",
  };
}

function buildMessageField(field: MessageField, rules: FieldRules, context: ProtoParserContext): ParsedProtoField {
  if (isWrapperDesc(field.message)) {
    const wrappedScalar = field.message.fields[0]?.scalar;
    if (wrappedScalar === ScalarType.BOOL) {
      return buildBooleanField(field as DescField, rules, context);
    }
    if (wrappedScalar === ScalarType.BYTES) {
      return buildBytesField(field, rules, context);
    }
    if (wrappedScalar === ScalarType.STRING) {
      return buildStringField(field, rules, context);
    }
    return buildNumberField(field as DescField, rules, context);
  }

  const description = getFieldDescription(field, context);

  if (context.ancestors.has(field.message.typeName)) {
    return buildRecursiveField(field, rules, context);
  }

  switch (field.message.typeName) {
    case TIMESTAMP_TYPE:
      return {
        fieldConfig: buildFieldConfig(
          withFieldUi(
            {
              desc: field,
              fieldRules: rules,
              source: "proto",
              supportsUnset: tracksPresence(field),
            },
            field
          ),
          {},
          description
        ),
        key: field.localName,
        required: rules.required,
        type: "timestamp",
      };
    case DURATION_TYPE:
      return {
        fieldConfig: buildFieldConfig(
          withFieldUi(
            {
              desc: field,
              fieldRules: rules,
              source: "proto",
              supportsUnset: tracksPresence(field),
            },
            field
          ),
          {},
          description
        ),
        key: field.localName,
        required: rules.required,
        type: "duration",
      };
    case FIELD_MASK_TYPE:
      return {
        fieldConfig: buildFieldConfig(
          withFieldUi(
            {
              allowedPaths: rules.type.case === "fieldMask" ? rules.type.value.in : undefined,
              desc: field,
              fieldRules: rules,
              source: "proto",
              supportsUnset: tracksPresence(field),
            },
            field
          ),
          {},
          description
        ),
        key: field.localName,
        required: rules.required,
        type: "fieldMask",
      };
    case STRUCT_TYPE:
      return buildJsonField(field, rules, "struct", context);
    case VALUE_TYPE:
      return buildJsonField(field, rules, "value", context);
    case LIST_VALUE_TYPE:
      return buildJsonField(field, rules, "listValue", context);
    case ANY_TYPE:
      return buildJsonField(field, rules, "any", context);
    default:
      return {
        fieldConfig: buildFieldConfig(
          withFieldUi(
            {
              desc: field,
              fieldRules: rules,
              messageRules: getMessageRules(field.message),
              source: "proto",
              supportsUnset: tracksPresence(field),
            },
            field
          ),
          {},
          description ?? getMessageDescription(field.message, context)
        ),
        key: field.localName,
        required: rules.required,
        schema: parseProtoSchemaInternal(
          field.message,
          context.annotations,
          context.secretScope,
          context.ancestors,
          context.operation
        ).fields,
        type: "object",
      };
  }
}

function buildListItemField(field: ListField, context: ProtoParserContext, itemRules?: FieldRules): ParsedProtoField {
  const syntheticField = cloneField(field, {
    localName: "value",
  });

  if (field.listKind === "scalar") {
    if (field.scalar === ScalarType.STRING) {
      return buildStringField(syntheticField, itemRules ?? getFieldRules(field), context);
    }
    if (field.scalar === ScalarType.BOOL) {
      return buildBooleanField(syntheticField, itemRules ?? getFieldRules(field), context);
    }
    if (field.scalar === ScalarType.BYTES) {
      return buildBytesField(syntheticField, itemRules ?? getFieldRules(field), context);
    }
    return buildNumberField(syntheticField, itemRules ?? getFieldRules(field), context);
  }

  if (field.listKind === "enum") {
    return {
      fieldConfig: buildFieldConfig({
        desc: field,
        fieldRules: itemRules,
        source: "proto",
      }),
      key: "value",
      options: buildEnumOptions(field.enum.values, field.enum.name),
      required: false,
      type: "select",
    };
  }

  if (context.ancestors.has(field.message.typeName)) {
    return buildRecursiveField(field, itemRules, context, "value");
  }

  return {
    fieldConfig: buildFieldConfig(
      {
        desc: field,
        fieldRules: itemRules,
        source: "proto",
      },
      {},
      getMessageDescription(field.message, context)
    ),
    key: "value",
    required: false,
    schema: parseProtoSchemaInternal(
      field.message,
      context.annotations,
      context.secretScope,
      context.ancestors,
      context.operation
    ).fields,
    type: "object",
  };
}

function buildArrayField(field: ListField, rules: FieldRules, context: ProtoParserContext): ParsedProtoField {
  const repeatedRules = rules.type.case === "repeated" ? rules.type.value : undefined;
  return {
    fieldConfig: buildFieldConfig(
      withFieldUi(
        {
          desc: field,
          fieldRules: rules,
          maxItems: bigIntToNumber(repeatedRules?.maxItems),
          minItems: bigIntToNumber(repeatedRules?.minItems),
          source: "proto",
        },
        field
      ),
      {},
      getFieldDescription(field, context)
    ),
    key: field.localName,
    required: Boolean(rules.required || repeatedRules?.minItems),
    schema: [buildListItemField(field, context, repeatedRules?.items)],
    type: "array",
  };
}

function buildMapKeyField(
  field: MapField,
  rules: FieldRules | undefined,
  context: ProtoParserContext
): ParsedProtoField {
  const syntheticField = cloneField(field, {
    fieldKind: "scalar",
    localName: "key",
    oneof: undefined,
    scalar: field.mapKey,
  });

  if (field.mapKey === ScalarType.BOOL) {
    return buildBooleanField(syntheticField, rules ?? getFieldRules(field), context);
  }
  if (field.mapKey === ScalarType.STRING) {
    return buildStringField(syntheticField, rules ?? getFieldRules(field), context);
  }
  return buildNumberField(syntheticField, rules ?? getFieldRules(field), context);
}

function buildMapValueField(
  field: MapField,
  rules: FieldRules | undefined,
  context: ProtoParserContext
): ParsedProtoField {
  const syntheticField = cloneField(field, {
    localName: "value",
  });

  if (field.mapKind === "scalar") {
    if (field.scalar === ScalarType.STRING) {
      return buildStringField(syntheticField, rules ?? getFieldRules(field), context);
    }
    if (field.scalar === ScalarType.BOOL) {
      return buildBooleanField(syntheticField, rules ?? getFieldRules(field), context);
    }
    if (field.scalar === ScalarType.BYTES) {
      return buildBytesField(syntheticField, rules ?? getFieldRules(field), context);
    }
    return buildNumberField(syntheticField, rules ?? getFieldRules(field), context);
  }

  if (field.mapKind === "enum") {
    return {
      fieldConfig: buildFieldConfig({
        desc: field,
        fieldRules: rules,
        source: "proto",
      }),
      key: "value",
      options: buildEnumOptions(field.enum.values, field.enum.name),
      required: false,
      type: "select",
    };
  }

  return buildMessageField(syntheticField as MessageField, rules ?? getFieldRules(field), context);
}

function buildMapField(field: MapField, rules: FieldRules, context: ProtoParserContext): ParsedProtoField {
  const mapRules = rules.type.case === "map" ? rules.type.value : undefined;
  const keyField = buildMapKeyField(field, mapRules?.keys, context);
  const valueField = buildMapValueField(field, mapRules?.values, context);

  return {
    fieldConfig: buildFieldConfig(
      withFieldUi(
        {
          desc: field,
          fieldRules: rules,
          keyField,
          maxPairs: bigIntToNumber(mapRules?.maxPairs),
          minPairs: bigIntToNumber(mapRules?.minPairs),
          source: "proto",
          valueField,
        },
        field
      ),
      {},
      getFieldDescription(field, context)
    ),
    key: field.localName,
    required: Boolean(rules.required || mapRules?.minPairs),
    schema: [keyField, valueField],
    type: "map",
  };
}

function buildOneofField(oneof: DescOneof, context: ProtoParserContext): ParsedProtoField {
  const oneofRules = getOneofRules(oneof);
  return attachRenderHints({
    fieldConfig: buildFieldConfig(
      withOneofUi(
        {
          oneof,
          oneofRules,
          source: "proto",
        },
        oneof
      ),
      {},
      getOneofDescription(oneof, context)
    ),
    key: oneof.localName,
    required: oneofRules.required,
    schema: oneof.fields.map((field) => buildProtoField(field, context)),
    type: "oneof",
  });
}

function buildProtoField(field: DescField, context: ProtoParserContext): ParsedProtoField {
  const rules = getFieldRules(field);

  let result: ParsedProtoField;
  switch (field.fieldKind) {
    case "scalar": {
      if (field.scalar === ScalarType.STRING) {
        result = buildStringField(field, rules, context);
        break;
      }
      if (field.scalar === ScalarType.BOOL) {
        result = buildBooleanField(field, rules, context);
        break;
      }
      if (field.scalar === ScalarType.BYTES) {
        result = buildBytesField(field, rules, context);
        break;
      }
      result = buildNumberField(field, rules, context);
      break;
    }
    case "enum":
      result = buildEnumField(field, rules, context);
      break;
    case "message":
      result = buildMessageField(field, rules, context);
      break;
    case "list":
      result = buildArrayField(field, rules, context);
      break;
    case "map":
      result = buildMapField(field, rules, context);
      break;
    default:
      throw new Error(`Unsupported protobuf field kind: ${String((field as DescField).fieldKind)}`);
  }

  if (result.fieldConfig) {
    const { customData } = result.fieldConfig as ProtoFieldConfig;
    if (customData) {
      if (context.secretScope) {
        customData.secretScope = context.secretScope;
      }
      const fieldBehaviors = getProtoFieldBehaviors(field);
      const isIdentifier = fieldBehaviors.includes(FieldBehavior.IDENTIFIER);
      const isImmutable = fieldBehaviors.includes(FieldBehavior.IMMUTABLE);
      customData.fieldBehaviors = fieldBehaviors;
      if (field.proto.options?.deprecated === true) {
        customData.deprecated = true;
      }
      customData.hidden =
        fieldBehaviors.includes(FieldBehavior.OUTPUT_ONLY) || (isIdentifier && context.operation === "create");
      customData.identifier = isIdentifier;
      customData.immutable =
        (isImmutable && context.operation !== "create") || (isIdentifier && context.operation === "update");
      customData.inputOnly = fieldBehaviors.includes(FieldBehavior.INPUT_ONLY);
      customData.resourceReference = getProtoResourceReference(field);
      const messageDesc =
        field.fieldKind === "message" ||
        (field.fieldKind === "list" && field.listKind === "message") ||
        (field.fieldKind === "map" && field.mapKind === "message")
          ? field.message
          : undefined;
      customData.resource = messageDesc ? getProtoResourceMetadata(messageDesc) : undefined;
      result.required = Boolean(
        result.required ||
          fieldBehaviors.includes(FieldBehavior.REQUIRED) ||
          (isIdentifier && context.operation === "update")
      );
    }
  }

  return attachRenderHints(result);
}

export function getProtoMessageUiConfig(desc: DescMessage): ProtoMessageUiConfig | undefined {
  return getProtoMessageUi(desc);
}

function parseProtoSchemaInternal(
  desc: DescMessage,
  annotations: ProtoAnnotations | undefined,
  parentSecretScope: string | undefined,
  ancestors: ReadonlySet<string>,
  operation?: "create" | "update"
): ParsedProtoSchema {
  const messageUi = getProtoMessageUi(desc);
  const context: ProtoParserContext = {
    ancestors: new Set([...ancestors, desc.typeName]),
    annotations,
    messageUi,
    operation: operation ?? inferProtoOperation(desc),
    secretScope: messageUi?.secretScope ?? parentSecretScope,
  };
  return {
    fields: desc.members.map((member) =>
      member.kind === "oneof" ? buildOneofField(member, context) : buildProtoField(member, context)
    ),
  };
}

export function parseProtoSchema(
  desc: DescMessage,
  annotations = getRegisteredProtoAnnotations(desc),
  parentSecretScope?: string
): ParsedProtoSchema {
  return parseProtoSchemaInternal(desc, annotations, parentSecretScope, new Set(), undefined);
}

const CREATE_REQUEST_PATTERN = /^Create.+Request$/u;
const UPDATE_REQUEST_PATTERN = /^Update.+Request$/u;

function inferProtoOperation(desc: DescMessage): "create" | "update" | undefined {
  const messageName = desc.typeName.split(".").at(-1) ?? "";
  if (CREATE_REQUEST_PATTERN.test(messageName)) {
    return "create";
  }
  if (UPDATE_REQUEST_PATTERN.test(messageName)) {
    return "update";
  }
  return;
}

function mapResultToSchemaValidation<Desc extends DescMessage>(
  result: NormalizedProtoValidationResult<MessageValidType<Desc>>
): SchemaValidation {
  if (result.issues) {
    return {
      errors: result.issues.map((issue) => ({
        message: issue.message,
        path: issue.path,
      })),
      success: false,
    };
  }

  return {
    data: result.value,
    success: true,
  };
}

function validateProtoValues<Desc extends DescMessage>(
  desc: Desc,
  values: Record<string, unknown>,
  schema: StandardSchemaV1<MessageShape<Desc>, MessageValidType<Desc>>,
  options: ProtoConversionOptions
): SchemaValidation | Promise<SchemaValidation> {
  const result = validateFormValuesAgainstProtoSchema(desc, values, schema, options);
  if (result instanceof Promise) {
    return result.then((resolved) => mapResultToSchemaValidation<Desc>(resolved));
  }
  return mapResultToSchemaValidation<Desc>(result);
}

export class ProtoProvider<Desc extends DescMessage = DescMessage> implements SchemaProvider<Record<string, unknown>> {
  private readonly desc: Desc;
  private readonly options: ProtoFormOptions;
  private readonly parsedSchema: ParsedProtoSchema;
  private readonly standardSchema: StandardSchemaV1<MessageShape<Desc>, MessageValidType<Desc>>;

  constructor(desc: Desc, options: ProtoFormOptions = {}) {
    this.desc = desc;
    this.options = options;
    this.parsedSchema = parseProtoSchema(desc);
    this.standardSchema = createDescriptorAwareStandardSchema(desc, options);
  }

  parseSchema(): ParsedSchema {
    return this.parsedSchema;
  }

  validateSchema(values: Record<string, unknown>): SchemaValidation {
    const validationResult = validateProtoValues(this.desc, values, this.standardSchema, this.options);
    if (validationResult instanceof Promise) {
      return {
        errors: [
          {
            message:
              // Provider-based AutoForm consumers expect a synchronous result. Async protovalidate
              // flows should go through createProtoResolver(), which RHF can await.
              "ProtoProvider does not support async validation rules. Use createProtoResolver() for async protovalidate flows.",
            path: [],
          },
        ],
        success: false,
      };
    }
    return validationResult;
  }

  getDefaultValues(): Record<string, unknown> {
    return protoToFormValues(this.desc);
  }

  getMessageDescriptor(): Desc {
    return this.desc;
  }
}

export function isProtoProvider(value: unknown): value is ProtoProvider {
  return value instanceof ProtoProvider;
}
