/**
 * Stable registry path for Connect error helpers.
 * Connect error formatting and google.rpc detail extraction live in the
 * copied protobuf-provider registry source.
 */
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
} from '../protobuf-provider';
