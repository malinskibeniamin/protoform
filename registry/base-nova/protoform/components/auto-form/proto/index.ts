// Proto bridge — re-exports from protobuf-provider and local conversion utilities.
// All proto-related imports within auto-form go through this single entry point.

export type { ProtoFieldRenderType, ProtoUiRule } from '../../../lib/protobuf-provider';
export {
  getProtoFieldCustomData,
  getProtoMessageUiConfig,
  isProtoMessageDescriptor,
  isProtoProvider,
  PROTO_FORM_ROOT_ERROR_KEY,
  ProtoProvider,
} from '../../../lib/protobuf-provider';
export {
  getProtoJsonSchema,
  isProtoMapEntries,
  normalizeProtoInitialValues,
  protoFormValuesToPayload,
  protoPayloadToFormValues,
  protoToFormValues,
} from './conversion';
