import { BadRequestSchema } from "@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb.js";
import { Code, ConnectError } from "@connectrpc/connect";
import { describe, expect, it } from "@rstest/core";
import { renderHook } from "@testing-library/react";
import { act } from "react";

import { AutoFormExampleSchema } from "../../lib/protobuf-provider/gen/auto-form-example_pb";
import { useProtoForm } from ".";

describe("useProtoForm server errors", () => {
  it("humanizes mapped violations and keeps unmapped violations unchanged", () => {
    const { result } = renderHook(() => useProtoForm(AutoFormExampleSchema));
    const error = new ConnectError("Review the highlighted fields.", Code.InvalidArgument, {}, [
      {
        desc: BadRequestSchema,
        value: {
          fieldViolations: [
            { description: "value is required", field: "primary_email" },
            { description: "must contain at least 1 item(s)", field: "tags" },
            { description: "   ", field: "homepage_url" },
            { description: "value is required", field: "unknown_field" },
          ],
        },
      },
    ]);

    let mapped: ReturnType<typeof result.current.setServerErrors> | undefined;
    act(() => {
      mapped = result.current.setServerErrors(error);
    });

    expect(result.current.getFieldState("primaryEmail").error?.message).toBe("Enter a value.");
    expect(result.current.getFieldState("tags").error?.message).toBe("Add at least one item.");
    expect(result.current.getFieldState("homepageUrl").error?.message).toBe("Review this value and try again.");
    expect(mapped?.unmapped).toEqual([{ description: "value is required", field: "unknown_field" }]);
  });

  it("maps violations through singular and plural server path prefixes", () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        serverPathPrefix: "request",
        serverPathPrefixes: ["spec", "instance"],
      })
    );
    const error = new ConnectError("Review the highlighted fields.", Code.InvalidArgument, {}, [
      {
        desc: BadRequestSchema,
        value: {
          fieldViolations: [
            { description: "value is required", field: "spec.primary_email" },
            { description: "must contain at least 1 item(s)", field: "instance.tags" },
            { description: "   ", field: "request.homepage_url" },
            { description: "value is required", field: "other.unknown_field" },
          ],
        },
      },
    ]);

    let mapped: ReturnType<typeof result.current.setServerErrors> | undefined;
    act(() => {
      mapped = result.current.setServerErrors(error);
    });

    expect(result.current.getFieldState("primaryEmail").error?.message).toBe("Enter a value.");
    expect(result.current.getFieldState("tags").error?.message).toBe("Add at least one item.");
    expect(result.current.getFieldState("homepageUrl").error?.message).toBe("Review this value and try again.");
    expect(mapped?.handled).toBe(true);
    expect(mapped?.unmapped).toEqual([{ description: "value is required", field: "other.unknown_field" }]);
  });
});
