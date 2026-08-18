import {
  type Operation,
  OperationSchema,
} from "@buf/googleapis_googleapis.bufbuild_es/google/longrunning/operations_pb.js";
import { RetryInfoSchema } from "@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb.js";
import { StatusSchema } from "@buf/googleapis_googleapis.bufbuild_es/google/rpc/status_pb.js";
import { create, type DescMethod } from "@bufbuild/protobuf";
import { AnySchema, MethodOptions_IdempotencyLevel } from "@bufbuild/protobuf/wkt";
import { Code, ConnectError } from "@connectrpc/connect";
import { describe, expect, it, vi } from "vitest";

import { FormExamplesService } from "../../../../../examples/gen/protoform/examples/v1/forms_pb.js";
import {
  getProtoPartialResult,
  getProtoPolicyPreviewPlan,
  getProtoPurgePlan,
  getProtoRetryDecision,
  getProtoStability,
  ProtoOperationError,
  runProtoOperation,
} from "./aip-client-workflow.js";

function operation(name: string, done = false, result: Operation["result"] = { case: undefined }): Operation {
  return create(OperationSchema, { done, name, result });
}

function method(idempotency: MethodOptions_IdempotencyLevel): DescMethod {
  return {
    ...FormExamplesService.method.submitBasicForm,
    idempotency,
  };
}

describe("runProtoOperation", () => {
  it("polls named AIP-151 operations and exposes progress until success", async () => {
    const updates: boolean[] = [];
    const poll = vi.fn(async () =>
      operation("operations/123", true, {
        case: "response",
        value: create(AnySchema),
      })
    );

    const result = await runProtoOperation({
      onProgress: (current) => updates.push(current.done),
      poll,
      sleep: async () => undefined,
      start: async () => operation("operations/123"),
    });

    expect(poll).toHaveBeenCalledWith("operations/123", expect.any(AbortSignal));
    expect(updates).toEqual([false, true]);
    expect(result.done).toBe(true);
  });

  it("cancels the remote operation when the caller aborts", async () => {
    const controller = new AbortController();
    const cancel = vi.fn(async () => undefined);

    await expect(
      runProtoOperation({
        cancel,
        poll: async () => operation("operations/123"),
        signal: controller.signal,
        sleep: async () => controller.abort(),
        start: async () => operation("operations/123"),
      })
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(cancel).toHaveBeenCalledWith("operations/123");
  });

  it("surfaces terminal google.rpc.Status failures", async () => {
    const status = create(StatusSchema, {
      code: Code.FailedPrecondition,
      message: "The import source is no longer available.",
    });

    await expect(
      runProtoOperation({
        poll: async () => operation("operations/unused"),
        start: async () => operation("operations/123", true, { case: "error", value: status }),
      })
    ).rejects.toEqual(expect.any(ProtoOperationError));
  });
});

describe("getProtoRetryDecision", () => {
  it("retries only idempotent unary UNAVAILABLE calls and respects RetryInfo", () => {
    const error = new ConnectError("try later", Code.Unavailable, {}, [
      {
        desc: RetryInfoSchema,
        value: { retryDelay: { nanos: 500_000_000, seconds: 2n } },
      },
    ]);

    expect(getProtoRetryDecision(method(MethodOptions_IdempotencyLevel.IDEMPOTENT), error)).toEqual({
      delayMs: 2500,
      reason: "transient",
      retry: true,
    });
    expect(getProtoRetryDecision(method(MethodOptions_IdempotencyLevel.IDEMPOTENCY_UNKNOWN), error)).toEqual({
      reason: "unsafe",
      retry: false,
    });
    expect(
      getProtoRetryDecision(
        method(MethodOptions_IdempotencyLevel.IDEMPOTENT),
        new ConnectError("invalid", Code.InvalidArgument)
      )
    ).toEqual({ reason: "non-retryable-code", retry: false });
  });
});

describe("getProtoPartialResult", () => {
  it("turns AIP-217 unreachable resources into a warning and targeted recovery actions", () => {
    expect(
      getProtoPartialResult({
        unreachable: ["projects/example/locations/europe-west2", "projects/example/locations/us-east1"],
      })
    ).toEqual({
      complete: false,
      recovery: [
        {
          label: "Retry europe-west2",
          resourceName: "projects/example/locations/europe-west2",
        },
        {
          label: "Retry us-east1",
          resourceName: "projects/example/locations/us-east1",
        },
      ],
      unreachable: ["projects/example/locations/europe-west2", "projects/example/locations/us-east1"],
      warning: "Some results are unavailable from 2 resources.",
    });
    expect(getProtoPartialResult({ unreachable: [] })).toEqual({
      complete: true,
      recovery: [],
      unreachable: [],
    });
  });
});

describe("destructive and preview workflow plans", () => {
  it("requires an AIP-165 purge preview before the destructive confirmation", () => {
    expect(
      getProtoPurgePlan(
        { filter: "state=DELETED", force: false },
        {
          purgeCount: 2,
          purgeSample: ["publishers/acme/books/old-1", "publishers/acme/books/old-2"],
        }
      )
    ).toEqual({
      confirmationRequired: false,
      count: 2,
      mode: "preview",
      sample: ["publishers/acme/books/old-1", "publishers/acme/books/old-2"],
      warning: "Preview only. No resources will be deleted.",
    });
    expect(
      getProtoPurgePlan({ filter: "state=DELETED", force: true }, { purgeCount: 2, purgeSample: [] })
    ).toMatchObject({
      confirmationRequired: true,
      mode: "execute",
      warning: "This permanently deletes every resource matching the filter.",
    });
  });

  it("distinguishes AIP-236 non-enforcing preview from live commit", () => {
    expect(getProtoPolicyPreviewPlan("start-preview")).toEqual({
      action: "start-preview",
      confirmationRequired: false,
      enforcesPolicy: false,
      notice: "Preview compares the experiment with live traffic without enforcing it.",
    });
    expect(getProtoPolicyPreviewPlan("commit")).toEqual({
      action: "commit",
      confirmationRequired: true,
      enforcesPolicy: true,
      notice: "Commit replaces the live policy and deletes the experiment.",
    });
  });
});

describe("getProtoStability", () => {
  it("presents AIP-181 alpha, beta, stable, and deprecated guidance from generated descriptors", () => {
    expect(
      getProtoStability({
        deprecated: false,
        typeName: "library.v1alpha1.Book",
      })
    ).toMatchObject({ level: "alpha", preview: true });
    expect(getProtoStability({ deprecated: false, typeName: "library.v1beta1.Book" })).toMatchObject({
      level: "beta",
      preview: true,
    });
    expect(getProtoStability({ deprecated: false, typeName: "library.v1.Book" })).toEqual({
      level: "stable",
      preview: false,
    });
    expect(getProtoStability({ deprecated: true, typeName: "library.v1.Book" })).toMatchObject({
      level: "deprecated",
      preview: false,
    });
  });
});
