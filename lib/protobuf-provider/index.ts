// Repository adapter for generated bindings. Registry consumers receive the
// canonical implementation at this path directly.
export {
  getProtoFieldBehaviors,
  getProtoResourceMetadata,
  getProtoResourceReference,
  isSingletonProtoResource,
  type ProtoResourceMetadata,
  type ProtoResourceReference,
} from "@/registry/base-nova/protoform/lib/protobuf-provider/aip";
export {
  getRegisteredProtoAnnotations,
  type ProtoAnnotations,
  registerProtoAnnotations,
} from "@/registry/base-nova/protoform/lib/protobuf-provider/annotations";
export {
  createFieldMask,
  createUpdateMask,
  dirtyFieldsFromValues,
} from "@/registry/base-nova/protoform/lib/protobuf-provider/field-mask";
export { createProtoFormSchema } from "@/registry/base-nova/protoform/lib/protobuf-provider/form-schema";
export {
  type ConnectErrorContext,
  extractConnectErrorContext,
  extractFieldViolations,
  type FieldViolation,
  formatConnectError,
  formatToastErrorMessage,
  grpcCodeLabel,
  type HelpLink,
  type PreconditionViolation,
  type QuotaViolation,
} from "@/registry/base-nova/protoform/lib/protobuf-provider/format-error";
export { formatSubmittedValue } from "@/registry/base-nova/protoform/lib/protobuf-provider/format-submitted-value";
export {
  humanizeServerFieldError,
  humanizeValidationError,
  isGenericValidationMessage,
  SERVER_FIELD_ERROR_FALLBACK,
} from "@/registry/base-nova/protoform/lib/protobuf-provider/humanize-validation-error";
export { protoPathToFormPath } from "@/registry/base-nova/protoform/lib/protobuf-provider/proto-error-path";
export {
  formValuesToProto,
  formValuesToProtoInit,
  getProtoFieldCustomData,
  getProtoMessageUiConfig,
  isProtoMessageDescriptor,
  isProtoProvider,
  type NormalizedProtoIssue,
  type NormalizedProtoValidationResult,
  PROTO_FORM_ROOT_ERROR_KEY,
  type ProtoAnyFormValue,
  type ProtoConversionOptions,
  type ProtoFieldCustomData,
  type ProtoFieldRenderType,
  type ProtoFieldType,
  type ProtoFormOptions,
  type ProtoMapFormEntry,
  ProtoProvider,
  type ProtoValidationContext,
  parseProtoSchema,
  preserveProtoMessageSource,
  protoFormValuesToPayload,
  protoPayloadToFormValues,
  protoToFormValues,
  validateFormValuesAgainstProtoSchema,
} from "@/registry/base-nova/protoform/lib/protobuf-provider/provider";
export {
  getProtoFieldUi,
  getProtoMessageUi,
  getProtoOneofUi,
  type ProtoFieldUiConfig,
  type ProtoMessageUiConfig,
  type ProtoUiRule,
} from "@/registry/base-nova/protoform/lib/protobuf-provider/ui-options";
