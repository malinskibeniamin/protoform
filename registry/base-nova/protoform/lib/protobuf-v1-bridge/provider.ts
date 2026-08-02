import {
  type EnumType,
  type FieldInfo,
  LongType,
  type Message,
  type MessageType,
  type OneofInfo,
  type PartialMessage,
  protoBase64,
  ScalarType,
} from "@bufbuild/protobuf";
import type {
  FormValues,
  ParsedField,
  ParsedSchema,
  ProviderCustomData,
  SchemaProvider,
  SchemaValidationContext,
  SchemaValidationError,
} from "../core/index.js";

interface ProtobufV1CustomData extends ProviderCustomData {
  source: "proto-v1";
  supportsUnset?: boolean;
  syntax: "proto2" | "proto3";
}

export type ProtobufV1SchemaValidation<T extends Message<T>> =
  | { data: T; success: true }
  | { errors: SchemaValidationError[]; success: false };

export interface ProtobufV1Provider<T extends Message<T>>
  extends SchemaProvider<Record<string, unknown>> {
  createMessage: (values: Record<string, unknown>) => T;
  getMessageType: () => MessageType<T>;
  validateSchema: (
    values: Record<string, unknown>,
    context?: SchemaValidationContext
  ) => ProtobufV1SchemaValidation<T>;
}

type MapField = Extract<FieldInfo, { kind: "map" }>;
type MapValue = MapField["V"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getSyntax(messageType: MessageType): "proto2" | "proto3" {
  const { syntax } = messageType.runtime;
  if (syntax !== "proto2" && syntax !== "proto3") {
    throw new Error(`Unsupported Protobuf-ES v1 syntax: ${syntax}`);
  }
  return syntax;
}

function is64BitScalar(scalar: ScalarType): boolean {
  return (
    scalar === ScalarType.INT64 ||
    scalar === ScalarType.UINT64 ||
    scalar === ScalarType.SINT64 ||
    scalar === ScalarType.FIXED64 ||
    scalar === ScalarType.SFIXED64
  );
}

function scalarFieldType(scalar: ScalarType): string {
  if (scalar === ScalarType.STRING) {
    return "string";
  }
  if (scalar === ScalarType.BOOL) {
    return "boolean";
  }
  if (scalar === ScalarType.BYTES) {
    return "bytes";
  }
  return is64BitScalar(scalar) ? "int64" : "number";
}

const CAMEL_BOUNDARY_PATTERN = /([a-z0-9])([A-Z])/g;
const WORD_SEPARATOR_PATTERN = /[_.-]+/g;
const WHITESPACE_PATTERN = /\s+/g;

function toScreamingSnakeCase(value: string): string {
  return value
    .replace(CAMEL_BOUNDARY_PATTERN, "$1_$2")
    .replace(WORD_SEPARATOR_PATTERN, "_")
    .toUpperCase();
}

function humanize(value: string): string {
  return value
    .replace(WORD_SEPARATOR_PATTERN, " ")
    .replace(WHITESPACE_PATTERN, " ")
    .trim()
    .toLowerCase()
    .replace(
      /(^|\s)([a-z])/g,
      (_match, whitespace: string, character: string) =>
        `${whitespace}${character.toUpperCase()}`
    );
}

function enumOptions(enumType: EnumType): [string, string][] {
  const typeName = enumType.typeName.split(".").at(-1) ?? "";
  const prefix = `${toScreamingSnakeCase(typeName)}_`;
  return enumType.values.map((value) => [
    String(value.no),
    humanize(
      value.name.startsWith(prefix)
        ? value.name.slice(prefix.length)
        : value.name
    ),
  ]);
}

function scalarDefault(scalar: ScalarType): unknown {
  if (scalar === ScalarType.STRING || scalar === ScalarType.BYTES) {
    return "";
  }
  if (scalar === ScalarType.BOOL) {
    return false;
  }
  if (is64BitScalar(scalar)) {
    return "0";
  }
  return 0;
}

function fieldDeclaredDefault(field: FieldInfo): unknown {
  if (field.repeated || field.kind === "map") {
    return [];
  }
  if (field.default !== undefined) {
    if (field.default instanceof Uint8Array) {
      return protoBase64.enc(field.default);
    }
    return typeof field.default === "bigint"
      ? field.default.toString()
      : field.default;
  }
  if (field.kind === "scalar") {
    return scalarDefault(field.T);
  }
  if (field.kind === "enum") {
    return field.T.values[0]?.no ?? 0;
  }
  return;
}

function customData(
  messageType: MessageType,
  supportsUnset: boolean
): ProtobufV1CustomData {
  return {
    source: "proto-v1",
    supportsUnset,
    syntax: getSyntax(messageType),
  };
}

function parsedScalar(
  messageType: MessageType,
  key: string,
  scalar: ScalarType,
  required: boolean,
  defaultValue: unknown,
  supportsUnset: boolean
): ParsedField {
  return {
    default: defaultValue,
    fieldConfig: { customData: customData(messageType, supportsUnset) },
    hints: supportsUnset ? { supportsUnset: true } : undefined,
    key,
    required,
    type: scalarFieldType(scalar),
  };
}

function parsedEnum(
  messageType: MessageType,
  key: string,
  enumType: EnumType,
  required: boolean,
  defaultValue: unknown,
  supportsUnset: boolean
): ParsedField {
  return {
    default: defaultValue,
    fieldConfig: { customData: customData(messageType, supportsUnset) },
    hints: supportsUnset ? { supportsUnset: true } : undefined,
    key,
    options: enumOptions(enumType),
    required,
    type: "select",
  };
}

function parseSingularField(
  messageType: MessageType,
  field: FieldInfo,
  key: string,
  ancestors: ReadonlySet<string>,
  required = field.req
): ParsedField {
  const supportsUnset = field.opt || field.req || field.oneof !== undefined;
  if (field.kind === "scalar") {
    return parsedScalar(
      messageType,
      key,
      field.T,
      required,
      fieldDeclaredDefault(field),
      supportsUnset
    );
  }
  if (field.kind === "enum") {
    return parsedEnum(
      messageType,
      key,
      field.T,
      required,
      fieldDeclaredDefault(field),
      supportsUnset
    );
  }
  if (field.kind === "message") {
    if (ancestors.has(field.T.typeName)) {
      return {
        fieldConfig: { customData: customData(messageType, supportsUnset) },
        key,
        required,
        type: "json",
      };
    }
    return {
      fieldConfig: { customData: customData(messageType, supportsUnset) },
      hints: supportsUnset ? { supportsUnset: true } : undefined,
      key,
      required,
      schema: parseMessageTypeInternal(field.T, ancestors).fields,
      type: "object",
    };
  }
  throw new Error(
    `Cannot parse map field ${field.localName} as a singular value`
  );
}

function parsedMapValue(
  messageType: MessageType,
  value: MapValue,
  ancestors: ReadonlySet<string>
): ParsedField {
  if (value.kind === "scalar") {
    return parsedScalar(
      messageType,
      "value",
      value.T,
      false,
      scalarDefault(value.T),
      false
    );
  }
  if (value.kind === "enum") {
    return parsedEnum(
      messageType,
      "value",
      value.T,
      false,
      value.T.values[0]?.no ?? 0,
      false
    );
  }
  if (ancestors.has(value.T.typeName)) {
    return {
      fieldConfig: { customData: customData(messageType, false) },
      key: "value",
      required: false,
      type: "json",
    };
  }
  return {
    fieldConfig: { customData: customData(messageType, false) },
    key: "value",
    required: false,
    schema: parseMessageTypeInternal(value.T, ancestors).fields,
    type: "object",
  };
}

function parseField(
  messageType: MessageType,
  field: FieldInfo,
  ancestors: ReadonlySet<string>
): ParsedField {
  if (field.kind === "map") {
    return {
      default: [],
      fieldConfig: { customData: customData(messageType, false) },
      key: field.localName,
      required: false,
      schema: [
        parsedScalar(
          messageType,
          "key",
          field.K,
          true,
          scalarDefault(field.K),
          false
        ),
        parsedMapValue(messageType, field.V, ancestors),
      ],
      type: "map",
    };
  }
  if (field.repeated) {
    return {
      default: [],
      fieldConfig: { customData: customData(messageType, false) },
      key: field.localName,
      required: false,
      schema: [
        parseSingularField(messageType, field, "value", ancestors, false),
      ],
      type: "array",
    };
  }
  return parseSingularField(messageType, field, field.localName, ancestors);
}

function parseOneof(
  messageType: MessageType,
  oneof: OneofInfo,
  ancestors: ReadonlySet<string>
): ParsedField {
  return {
    default: { case: undefined, value: undefined },
    fieldConfig: { customData: customData(messageType, true) },
    hints: { supportsUnset: true },
    key: oneof.localName,
    required: false,
    schema: oneof.fields.map((field) =>
      parseSingularField(messageType, field, field.localName, ancestors, false)
    ),
    type: "oneof",
  };
}

function parseMessageTypeInternal(
  messageType: MessageType,
  ancestors: ReadonlySet<string>
): ParsedSchema {
  getSyntax(messageType);
  const nextAncestors = new Set([...ancestors, messageType.typeName]);
  return {
    fields: messageType.fields
      .byMember()
      .map((member) =>
        member.kind === "oneof"
          ? parseOneof(messageType, member, nextAncestors)
          : parseField(messageType, member, nextAncestors)
      ),
  };
}

function parseMessageType<T extends Message<T>>(
  messageType: MessageType<T>
): ParsedSchema {
  return parseMessageTypeInternal(messageType, new Set());
}

function normalizeScalarValue(
  scalar: ScalarType,
  longType: LongType,
  value: unknown
): unknown {
  if (value === undefined || value === null) {
    return;
  }
  if (scalar === ScalarType.STRING) {
    return typeof value === "string" ? value : String(value);
  }
  if (scalar === ScalarType.BOOL) {
    return normalizeBooleanValue(value);
  }
  if (scalar === ScalarType.BYTES) {
    return normalizeBytesValue(value);
  }
  if (is64BitScalar(scalar)) {
    return normalizeLongValue(value, longType);
  }
  return normalizeNumberValue(value);
}

function normalizeBooleanValue(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return value === "" ? undefined : Boolean(value);
}

function normalizeBytesValue(value: unknown): Uint8Array | undefined {
  if (value instanceof Uint8Array) {
    return value;
  }
  return typeof value === "string" && value !== ""
    ? protoBase64.dec(value)
    : undefined;
}

function normalizeLongValue(
  value: unknown,
  longType: LongType
): bigint | string | undefined {
  if (value === "") {
    return;
  }
  if (longType === LongType.STRING) {
    return String(value);
  }
  return typeof value === "bigint" ? value : BigInt(String(value));
}

function normalizeNumberValue(value: unknown): number | undefined {
  if (value === "") {
    return;
  }
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? undefined : numberValue;
}

function normalizeMapValue(valueType: MapValue, value: unknown): unknown {
  if (valueType.kind === "scalar") {
    return normalizeScalarValue(valueType.T, LongType.BIGINT, value);
  }
  if (valueType.kind === "enum") {
    return value === undefined || value === "" ? undefined : Number(value);
  }
  return isRecord(value)
    ? new valueType.T(messageInit(valueType.T, value))
    : undefined;
}

function normalizeSingularField(field: FieldInfo, value: unknown): unknown {
  if (field.kind === "scalar") {
    return normalizeScalarValue(field.T, field.L, value);
  }
  if (field.kind === "enum") {
    return value === undefined || value === "" ? undefined : Number(value);
  }
  if (field.kind === "message") {
    return isRecord(value)
      ? new field.T(messageInit(field.T, value))
      : undefined;
  }
  if (!Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    value.flatMap((entry) => {
      if (!isRecord(entry)) {
        return [];
      }
      const { key } = entry;
      if (key === undefined || key === null || key === "") {
        return [];
      }
      return [[String(key), normalizeMapValue(field.V, entry.value)] as const];
    })
  );
}

function normalizeField(field: FieldInfo, value: unknown): unknown {
  if (field.kind === "map") {
    return normalizeSingularField(field, value);
  }
  if (field.repeated) {
    return Array.isArray(value)
      ? value.map((entry) => normalizeSingularField(field, entry))
      : [];
  }
  return normalizeSingularField(field, value);
}

function messageInit<T extends Message<T>>(
  messageType: MessageType<T>,
  values: Record<string, unknown>
): PartialMessage<T>;
function messageInit(
  messageType: MessageType,
  values: Record<string, unknown>
): PartialMessage<Message>;
function messageInit(
  messageType: MessageType,
  values: Record<string, unknown>
): PartialMessage<Message> {
  const init: Record<string, unknown> = {};
  for (const member of messageType.fields.byMember()) {
    if (member.kind === "oneof") {
      const oneofValue = values[member.localName];
      if (!(isRecord(oneofValue) && typeof oneofValue.case === "string")) {
        continue;
      }
      const activeField = member.findField(oneofValue.case);
      if (!activeField) {
        continue;
      }
      init[member.localName] = {
        case: activeField.localName,
        value: normalizeSingularField(activeField, oneofValue.value),
      };
      continue;
    }
    const value = normalizeField(member, values[member.localName]);
    if (value !== undefined) {
      init[member.localName] = value;
    }
  }
  return init as PartialMessage<Message>;
}

function scalarToFormValue(scalar: ScalarType, value: unknown): unknown {
  if (scalar === ScalarType.BYTES) {
    return value instanceof Uint8Array ? protoBase64.enc(value) : undefined;
  }
  if (is64BitScalar(scalar)) {
    return typeof value === "bigint" ? value.toString() : value;
  }
  return value;
}

function mapValueToFormValue(valueType: MapValue, value: unknown): unknown {
  if (valueType.kind === "scalar") {
    return scalarToFormValue(valueType.T, value);
  }
  if (valueType.kind === "message" && isRecord(value)) {
    return messageToFormValues(valueType.T, value);
  }
  return value;
}

function singularFieldToFormValue(field: FieldInfo, value: unknown): unknown {
  if (field.kind === "scalar") {
    return scalarToFormValue(field.T, value);
  }
  if (field.kind === "enum") {
    return value;
  }
  if (field.kind === "message") {
    return isRecord(value) ? messageToFormValues(field.T, value) : undefined;
  }
  if (!isRecord(value)) {
    return [];
  }
  return Object.entries(value).map(([key, entryValue]) => ({
    key,
    value: mapValueToFormValue(field.V, entryValue),
  }));
}

function fieldToFormValue(field: FieldInfo, value: unknown): unknown {
  if (field.kind === "map") {
    return singularFieldToFormValue(field, value);
  }
  if (field.repeated) {
    return Array.isArray(value)
      ? value.map((entry) => singularFieldToFormValue(field, entry))
      : [];
  }
  return singularFieldToFormValue(field, value);
}

function oneofToFormValue(
  oneof: OneofInfo,
  value: unknown
): { case: string | undefined; value?: unknown } {
  if (!(isRecord(value) && typeof value.case === "string")) {
    return { case: undefined };
  }
  const activeField = oneof.findField(value.case);
  if (!activeField) {
    return { case: undefined };
  }
  return {
    case: activeField.localName,
    value: singularFieldToFormValue(activeField, value.value),
  };
}

function messageToFormValues(
  messageType: MessageType,
  message: Record<string, unknown>
): FormValues {
  const syntax = getSyntax(messageType);
  return Object.fromEntries(
    messageType.fields.byMember().map((member) => {
      if (member.kind === "oneof") {
        return [
          member.localName,
          oneofToFormValue(member, message[member.localName]),
        ];
      }
      const value = message[member.localName];
      return [
        member.localName,
        syntax === "proto2" && member.req && value === undefined
          ? fieldDeclaredDefault(member)
          : fieldToFormValue(member, value),
      ];
    })
  );
}

const SIGNED_32_SCALARS = new Set([
  ScalarType.INT32,
  ScalarType.SINT32,
  ScalarType.SFIXED32,
]);
const UNSIGNED_32_SCALARS = new Set([ScalarType.UINT32, ScalarType.FIXED32]);
const SIGNED_64_SCALARS = new Set([
  ScalarType.INT64,
  ScalarType.SINT64,
  ScalarType.SFIXED64,
]);
const UNSIGNED_64_SCALARS = new Set([ScalarType.UINT64, ScalarType.FIXED64]);
const SIGNED_32_MIN = -2_147_483_648;
const SIGNED_32_MAX = 2_147_483_647;
const UNSIGNED_32_MAX = 4_294_967_295;
const SIGNED_64_MIN = -9_223_372_036_854_775_808n;
const SIGNED_64_MAX = 9_223_372_036_854_775_807n;
const UNSIGNED_64_MAX = 18_446_744_073_709_551_615n;

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

function scalarConversionIssue(
  scalar: ScalarType,
  value: unknown
): string | undefined {
  if (isEmpty(value) || scalar === ScalarType.STRING) {
    return;
  }
  if (scalar === ScalarType.BOOL) {
    return booleanConversionIssue(value);
  }
  if (scalar === ScalarType.BYTES) {
    return bytesConversionIssue(value);
  }
  if (is64BitScalar(scalar)) {
    return longConversionIssue(scalar, value);
  }
  return numberConversionIssue(scalar, value);
}

function booleanConversionIssue(value: unknown): string | undefined {
  return typeof value === "boolean" || value === "true" || value === "false"
    ? undefined
    : "Choose true or false.";
}

function bytesConversionIssue(value: unknown): string | undefined {
  if (value instanceof Uint8Array) {
    return;
  }
  if (typeof value !== "string") {
    return "Enter valid base64 data.";
  }
  try {
    protoBase64.dec(value);
    return;
  } catch {
    return "Enter valid base64 data.";
  }
}

function longConversionIssue(
  scalar: ScalarType,
  value: unknown
): string | undefined {
  let integer: bigint;
  try {
    integer = typeof value === "bigint" ? value : BigInt(String(value));
  } catch {
    return "Enter a valid 64-bit integer.";
  }
  const outsideSignedRange =
    SIGNED_64_SCALARS.has(scalar) &&
    (integer < SIGNED_64_MIN || integer > SIGNED_64_MAX);
  const outsideUnsignedRange =
    UNSIGNED_64_SCALARS.has(scalar) &&
    (integer < 0n || integer > UNSIGNED_64_MAX);
  return outsideSignedRange || outsideUnsignedRange
    ? "Enter a 64-bit integer within the protobuf range."
    : undefined;
}

function numberConversionIssue(
  scalar: ScalarType,
  value: unknown
): string | undefined {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return "Enter a valid number.";
  }
  if (
    (SIGNED_32_SCALARS.has(scalar) || UNSIGNED_32_SCALARS.has(scalar)) &&
    !Number.isInteger(numberValue)
  ) {
    return "Enter a whole number.";
  }
  if (
    (SIGNED_32_SCALARS.has(scalar) &&
      (numberValue < SIGNED_32_MIN || numberValue > SIGNED_32_MAX)) ||
    (UNSIGNED_32_SCALARS.has(scalar) &&
      (numberValue < 0 || numberValue > UNSIGNED_32_MAX))
  ) {
    return "Enter a number within the protobuf range.";
  }
  return;
}

function singularConversionErrors(
  messageType: MessageType,
  field: FieldInfo,
  value: unknown,
  path: (string | number)[]
): SchemaValidationError[] {
  if (field.kind === "scalar") {
    const message = scalarConversionIssue(field.T, value);
    return message ? [{ message, path }] : [];
  }
  if (field.kind === "enum") {
    if (isEmpty(value)) {
      return [];
    }
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue)) {
      return [{ message: "Choose a valid enum value.", path }];
    }
    if (
      getSyntax(messageType) === "proto2" &&
      !field.T.values.some((candidate) => candidate.no === numberValue)
    ) {
      return [{ message: "Choose a known enum value.", path }];
    }
    return [];
  }
  if (field.kind === "message") {
    if (isEmpty(value)) {
      return [];
    }
    return isRecord(value)
      ? messageConversionErrors(field.T, value, path)
      : [{ message: "Enter an object value.", path }];
  }
  return mapConversionErrors(messageType, field, value, path);
}

function mapValueConversionErrors(
  messageType: MessageType,
  valueType: MapValue,
  value: unknown,
  path: (string | number)[]
): SchemaValidationError[] {
  if (valueType.kind === "scalar") {
    const message = scalarConversionIssue(valueType.T, value);
    return message ? [{ message, path }] : [];
  }
  if (valueType.kind === "enum") {
    if (isEmpty(value)) {
      return [];
    }
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue)) {
      return [{ message: "Choose a valid enum value.", path }];
    }
    if (
      getSyntax(messageType) === "proto2" &&
      !valueType.T.values.some((candidate) => candidate.no === numberValue)
    ) {
      return [{ message: "Choose a known enum value.", path }];
    }
    return [];
  }
  if (isEmpty(value)) {
    return [];
  }
  return isRecord(value)
    ? messageConversionErrors(valueType.T, value, path)
    : [{ message: "Enter an object value.", path }];
}

function mapConversionErrors(
  messageType: MessageType,
  field: MapField,
  value: unknown,
  path: (string | number)[]
): SchemaValidationError[] {
  if (isEmpty(value)) {
    return [];
  }
  if (!Array.isArray(value)) {
    return [{ message: "Enter map entries as key-value pairs.", path }];
  }
  const errors: SchemaValidationError[] = [];
  const seenKeys = new Set<string>();
  value.forEach((entry, index) => {
    if (!isRecord(entry)) {
      errors.push({
        message: "Enter a key-value pair.",
        path: [...path, index],
      });
      return;
    }
    const { key } = entry;
    if (isEmpty(key)) {
      return;
    }
    const keyString = String(key);
    if (seenKeys.has(keyString)) {
      errors.push({ message: "Map keys must be unique.", path });
    } else {
      seenKeys.add(keyString);
    }
    errors.push(
      ...mapValueConversionErrors(messageType, field.V, entry.value, [
        ...path,
        index,
        "value",
      ])
    );
  });
  return errors;
}

function fieldConversionErrors(
  messageType: MessageType,
  field: FieldInfo,
  value: unknown,
  path: (string | number)[]
): SchemaValidationError[] {
  if (field.kind === "map") {
    return mapConversionErrors(messageType, field, value, path);
  }
  if (field.repeated) {
    if (isEmpty(value)) {
      return [];
    }
    if (!Array.isArray(value)) {
      return [{ message: "Enter a list of values.", path }];
    }
    return value.flatMap((entry, index) =>
      singularConversionErrors(messageType, field, entry, [...path, index])
    );
  }
  return singularConversionErrors(messageType, field, value, path);
}

function messageConversionErrors(
  messageType: MessageType,
  values: Record<string, unknown>,
  path: (string | number)[] = []
): SchemaValidationError[] {
  return messageType.fields.byMember().flatMap((member) => {
    if (member.kind === "oneof") {
      const oneofValue = values[member.localName];
      if (isEmpty(oneofValue)) {
        return [];
      }
      if (!isRecord(oneofValue)) {
        return [
          {
            message: "Choose a valid oneof field.",
            path: [...path, member.localName],
          },
        ];
      }
      if (oneofValue.case === undefined) {
        return [];
      }
      if (typeof oneofValue.case !== "string") {
        return [
          {
            message: "Choose a valid oneof field.",
            path: [...path, member.localName],
          },
        ];
      }
      const activeField = member.findField(oneofValue.case);
      return activeField
        ? singularConversionErrors(messageType, activeField, oneofValue.value, [
            ...path,
            member.localName,
            "value",
          ])
        : [
            {
              message: "Choose a known oneof field.",
              path: [...path, member.localName],
            },
          ];
    }
    const value = values[member.localName];
    const requiredError =
      member.req && isEmpty(value)
        ? [
            {
              message: "This field is required.",
              path: [...path, member.localName],
            },
          ]
        : [];
    return [
      ...requiredError,
      ...fieldConversionErrors(messageType, member, value, [
        ...path,
        member.localName,
      ]),
    ];
  });
}

class ProtobufV1ProviderImpl<T extends Message<T>>
  implements ProtobufV1Provider<T>
{
  readonly #messageType: MessageType<T>;
  readonly #parsedSchema: ParsedSchema;

  constructor(messageType: MessageType<T>) {
    this.#messageType = messageType;
    this.#parsedSchema = parseMessageType(messageType);
  }

  createMessage(values: Record<string, unknown>): T {
    return new this.#messageType(messageInit(this.#messageType, values));
  }

  getDefaultValues(): FormValues {
    const message = new this.#messageType() as unknown as Record<
      string,
      unknown
    >;
    return messageToFormValues(this.#messageType, message);
  }

  getMessageType(): MessageType<T> {
    return this.#messageType;
  }

  parseSchema(): ParsedSchema {
    return this.#parsedSchema;
  }

  validateSchema(
    values: Record<string, unknown>,
    context?: SchemaValidationContext
  ): ProtobufV1SchemaValidation<T> {
    if (context?.signal.aborted) {
      return {
        errors: [{ message: "Validation was cancelled.", path: [] }],
        success: false,
      };
    }
    const errors = messageConversionErrors(this.#messageType, values);
    if (errors.length > 0) {
      return { errors, success: false };
    }
    try {
      return { data: this.createMessage(values), success: true };
    } catch (error) {
      return {
        errors: [
          {
            message:
              error instanceof Error
                ? error.message
                : "Failed to create a Protobuf-ES v1 message.",
            path: [],
          },
        ],
        success: false,
      };
    }
  }
}

export function createProtobufV1Provider<T extends Message<T>>(
  messageType: MessageType<T>
): ProtobufV1Provider<T> {
  return new ProtobufV1ProviderImpl(messageType);
}
