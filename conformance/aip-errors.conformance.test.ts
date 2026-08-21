// @rstest-environment node

import {
  BadRequestSchema,
  ErrorInfoSchema,
  LocalizedMessageSchema,
  PreconditionFailureSchema,
  QuotaFailureSchema,
  RequestInfoSchema,
  RetryInfoSchema,
} from "@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb.js";
import { create } from "@bufbuild/protobuf";
import { StructSchema } from "@bufbuild/protobuf/wkt";
import { Code, ConnectError } from "@connectrpc/connect";
import { describe, expect, it } from "@rstest/core";

import {
  extractConnectErrorContext,
  extractFieldViolations,
  grpcCodeLabel,
} from "../registry/base-nova/protoform/lib/protobuf-provider/index.js";

describe("AIP-193 error lifecycle conformance", () => {
  it("labels every canonical non-OK gRPC status code", () => {
    expect(
      [
        Code.Canceled,
        Code.Unknown,
        Code.InvalidArgument,
        Code.DeadlineExceeded,
        Code.NotFound,
        Code.AlreadyExists,
        Code.PermissionDenied,
        Code.ResourceExhausted,
        Code.FailedPrecondition,
        Code.Aborted,
        Code.OutOfRange,
        Code.Unimplemented,
        Code.Internal,
        Code.Unavailable,
        Code.DataLoss,
        Code.Unauthenticated,
      ].map(grpcCodeLabel)
    ).toEqual([
      "canceled",
      "unknown",
      "invalid_argument",
      "deadline_exceeded",
      "not_found",
      "already_exists",
      "permission_denied",
      "resource_exhausted",
      "failed_precondition",
      "aborted",
      "out_of_range",
      "unimplemented",
      "internal",
      "unavailable",
      "data_loss",
      "unauthenticated",
    ]);
  });

  it("extracts field violations plus localized, retry, request, precondition, quota, and machine details", () => {
    const error = new ConnectError("raw message", Code.ResourceExhausted, {}, [
      {
        desc: BadRequestSchema,
        value: {
          fieldViolations: [
            {
              description: "Choose another title.",
              field: "book.display_name",
            },
          ],
        },
      },
      {
        desc: ErrorInfoSchema,
        value: {
          domain: "library.protoform.dev",
          metadata: { request_id: "metadata-request" },
          reason: "BOOK_QUOTA_REACHED",
        },
      },
      {
        desc: LocalizedMessageSchema,
        value: { locale: "en-GB", message: "Book quota reached." },
      },
      {
        desc: RetryInfoSchema,
        value: { retryDelay: { nanos: 500_000_000, seconds: 2n } },
      },
      {
        desc: RequestInfoSchema,
        value: { requestId: "request-detail", servingData: "shard-1" },
      },
      {
        desc: PreconditionFailureSchema,
        value: {
          violations: [{ description: "Accept the terms.", subject: "terms", type: "TOS" }],
        },
      },
      {
        desc: QuotaFailureSchema,
        value: {
          violations: [{ description: "Ten books per project.", subject: "projects/123" }],
        },
      },
      {
        desc: StructSchema,
        value: create(StructSchema, { fields: {} }),
      },
    ]);

    expect(extractFieldViolations(error)).toEqual([
      { description: "Choose another title.", field: "book.display_name" },
    ]);
    expect(extractConnectErrorContext(error)).toMatchObject({
      code: "resource_exhausted",
      domain: "library.protoform.dev",
      message: "Book quota reached.",
      messageLocale: "en-GB",
      preconditionViolations: [{ description: "Accept the terms.", subject: "terms", type: "TOS" }],
      quotaViolations: [{ description: "Ten books per project.", subject: "projects/123" }],
      reason: "BOOK_QUOTA_REACHED",
      requestId: "request-detail",
      retryAfterSeconds: 2.5,
      unmappedDetails: ["google.protobuf.Struct"],
    });
  });
});
