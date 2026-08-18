import { BadRequestSchema } from "@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb.js";
import { create, isMessage } from "@bufbuild/protobuf";
import { Code, ConnectError } from "@connectrpc/connect";
import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it } from "vitest";

import "../../lib/protobuf-provider/auto-form-example-annotations.js";
import { AutoFormExampleSchema } from "../../lib/protobuf-provider/gen/auto-form-example_pb.js";
import { useProtoForm } from "./index.js";

const emptyDefaults = create(AutoFormExampleSchema) as Record<string, unknown>;

function defaults(overrides: Record<string, unknown> = {}) {
  return { ...emptyDefaults, ...overrides };
}

describe("experimental React Hook Form v8 useProtoForm conformance", () => {
  it("exposes the v8-native form API and creates protobuf messages", () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults({ age: 25, username: "test_user" }),
      })
    );

    expect(result.current.register).toBeTypeOf("function");
    expect(result.current.control).toBeDefined();
    const message = result.current.createMessage();
    expect(isMessage(message, AutoFormExampleSchema)).toBe(true);
    expect(message.age).toBe(25);
    expect(message.username).toBe("test_user");
  });

  it("validates protobuf fields without the v7-only resolver package", async () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults({ username: "ab" }),
        mode: "all",
      })
    );

    await act(async () => {
      await result.current.trigger();
    });

    await waitFor(() => {
      expect(result.current.formState.errors.username?.message).toMatch(/3/);
    });
  });

  it("builds update masks from fields changed through v8", async () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults({ primaryEmail: "old@example.com" }),
      })
    );

    act(() => {
      result.current.setValue("primaryEmail", "new@example.com", {
        shouldDirty: true,
      });
    });

    await waitFor(() => {
      expect(result.current.createUpdateMask().paths).toEqual(["primary_email"]);
    });
  });

  it("maps Connect field violations onto v8 field errors", () => {
    const { result } = renderHook(() => useProtoForm(AutoFormExampleSchema));
    const error = new ConnectError("Review the highlighted fields.", Code.InvalidArgument, {}, [
      {
        desc: BadRequestSchema,
        value: {
          fieldViolations: [{ description: "value is required", field: "primary_email" }],
        },
      },
    ]);

    act(() => {
      result.current.setServerErrors(error);
    });

    expect(result.current.getFieldState("primaryEmail").error?.message).toBe("Enter a value.");
  });
});
