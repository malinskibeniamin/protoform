import { BadRequestSchema } from "@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb.js";
import { Code, ConnectError } from "@connectrpc/connect";
import { describe, expect, rs } from "@rstest/core";
import { renderHook } from "@testing-library/react";
import { act } from "react";

import "../../lib/protobuf-provider/auto-form-example-annotations";
import { AutoFormExampleSchema } from "../../lib/protobuf-provider/gen/auto-form-example_pb";
import { useProtoForm } from ".";

function hasErrors(value: unknown): value is { errors: unknown[] } {
  return typeof value === "object" && value !== null && "errors" in value && Array.isArray(value.errors);
}

function hasKey<Key extends PropertyKey>(value: object, key: Key): value is Record<Key, unknown> {
  return key in value;
}

function errorsForField(fields: object, fieldName: string): unknown[] {
  if (!hasKey(fields, fieldName)) {
    return [];
  }
  const field = fields[fieldName];
  return hasErrors(field) ? field.errors : [];
}

describe("TanStack useProtoForm", () => {
  test("preserves the native form API and adds protobuf message, mask, and oneof helpers", () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: {
          age: 0,
          preferredContact: {
            case: "preferredEmail",
            value: "ada@example.com",
          },
          username: "",
        },
      })
    );

    expect(result.current.Field).toBeTypeOf("function");
    expect(result.current.Subscribe).toBeTypeOf("function");
    expect(result.current.store).toBeDefined();
    expect(result.current.createMessage).toBeTypeOf("function");
    expect(result.current.createUpdateMask).toBeTypeOf("function");

    act(() => {
      result.current.setFieldValue("username", "ada_user");
    });

    expect(result.current.createMessage().username).toBe("ada_user");
    expect(result.current.createUpdateMask().paths).toEqual(["username"]);

    // Switching oneof branches does not retain the previous branch value.
    act(() => {
      result.current.setOneofValue("preferredContact", "preferredPhone", "+48123456789");
    });

    expect(result.current.createMessage().preferredContact).toEqual({
      case: "preferredPhone",
      value: "+48123456789",
    });
  });

  test("validates the generated protobuf contract and composes caller validators before submission", async () => {
    const onSubmit = rs.fn();
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: {
          age: 0,
          username: "ab",
        },
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.getAllErrors().fields.username?.errors).not.toHaveLength(0);

    // A caller onSubmit validator is composed instead of replaced.
    const nativeValidator = rs.fn(() => "Native validation failed.");
    const { result: composed } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: {
          age: 25,
          username: "valid_user",
        },
        onSubmit,
        validators: {
          onSubmit: nativeValidator,
        },
      })
    );

    await act(async () => {
      await composed.current.handleSubmit();
    });

    expect(nativeValidator).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("maps Connect field violations, including prefixed and nested paths, onto native TanStack field errors", () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: {
          age: 25,
          homepageUrl: "",
          primaryEmail: "",
          tags: [],
          username: "valid_user",
        },
      })
    );
    const error = new ConnectError("Review the highlighted fields.", Code.InvalidArgument, {}, [
      {
        desc: BadRequestSchema,
        value: {
          fieldViolations: [
            {
              description: "value is required",
              field: "primary_email",
            },
            {
              description: "must contain at least 1 item(s)",
              field: "tags",
            },
            {
              description: "   ",
              field: "homepage_url",
            },
          ],
        },
      },
    ]);

    let mapped: ReturnType<typeof result.current.setServerErrors> | undefined;
    act(() => {
      mapped = result.current.setServerErrors(error);
    });

    expect(mapped?.handled).toBe(true);
    expect(mapped?.unmapped).toEqual([]);
    const fieldErrors = result.current.getAllErrors().fields;
    expect(errorsForField(fieldErrors, "primaryEmail")).toContain("Enter a value.");
    expect(errorsForField(fieldErrors, "tags")).toContain("Add at least one item.");
    expect(errorsForField(fieldErrors, "homepageUrl")).toContain("Review this value and try again.");

    // Violations also map through any configured server path prefix.
    const { result: prefixed } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: {
          age: 25,
          primaryEmail: "",
          tags: [],
          username: "valid_user",
        },
        serverPathPrefixes: ["spec", "instance"],
      })
    );
    const prefixedError = new ConnectError("Review the highlighted fields.", Code.InvalidArgument, {}, [
      {
        desc: BadRequestSchema,
        value: {
          fieldViolations: [
            { description: "value is required", field: "spec.primary_email" },
            { description: "must contain at least 1 item(s)", field: "instance.tags" },
          ],
        },
      },
    ]);

    let prefixedMapped: ReturnType<typeof prefixed.current.setServerErrors> | undefined;
    act(() => {
      prefixedMapped = prefixed.current.setServerErrors(prefixedError);
    });

    expect(prefixedMapped?.handled).toBe(true);
    expect(prefixedMapped?.unmapped).toEqual([]);
    const prefixedErrors = prefixed.current.getAllErrors().fields;
    expect(errorsForField(prefixedErrors, "primaryEmail")).toContain("Enter a value.");
    expect(errorsForField(prefixedErrors, "tags")).toContain("Add at least one item.");

    const { result: resultNested } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: {
          age: 25,
          shippingAddress: { city: "", lineOne: "" },
          username: "valid_user",
        },
      })
    );
    const errorNested = new ConnectError("Review the highlighted fields.", Code.InvalidArgument, {}, [
      {
        desc: BadRequestSchema,
        value: {
          fieldViolations: [
            {
              description: "Choose a supported city.",
              field: "shipping_address.city",
            },
          ],
        },
      },
    ]);

    act(() => {
      resultNested.current.setServerErrors(errorNested);
    });

    expect(resultNested.current.getNestedErrors("shippingAddress")).toEqual({
      city: { message: "Choose a supported city." },
    });
  });
});
