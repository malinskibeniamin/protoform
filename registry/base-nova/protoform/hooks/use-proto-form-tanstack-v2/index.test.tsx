import { describe, expect, it, rs } from "@rstest/core";
import { renderHook } from "@testing-library/react";
import { act } from "react";

import "../../lib/protobuf-provider/auto-form-example-annotations";
import { AutoFormExampleSchema } from "../../lib/protobuf-provider/gen/auto-form-example_pb";
import { useProtoForm } from ".";

describe("experimental TanStack Form v2 useProtoForm", () => {
  it("keeps the v2-native form surface and adds protobuf helpers", () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: {
          age: 0,
          username: "",
        },
      })
    );

    expect(result.current.Field).toBeTypeOf("function");
    expect(result.current.Subscribe).toBeTypeOf("function");
    expect(result.current.atom).toBeDefined();
    expect("store" in result.current).toBe(false);
    expect(result.current.createMessage).toBeTypeOf("function");
    expect(result.current.createUpdateMask).toBeTypeOf("function");
    expect(result.current.setOneofValue).toBeTypeOf("function");

    act(() => {
      result.current.setFieldValue("username", "ada_user");
    });

    expect(result.current.createMessage().username).toBe("ada_user");
    expect(result.current.createUpdateMask().paths).toEqual(["username"]);
  });

  it("runs protobuf validation through the v2 validator pipeline", async () => {
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

    let errors: Awaited<ReturnType<typeof result.current.handleSubmit>> = [];
    await act(async () => {
      errors = await result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(errors).not.toHaveLength(0);
    expect(result.current.state.isInvalid).toBe(true);
  });

  it("appends the protobuf validator without replacing native v2 validators", async () => {
    const onSubmit = rs.fn();
    const nativeValidator = rs.fn(() => ({
      fields: { username: "Native validation failed." },
    }));
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: {
          age: 25,
          username: "valid_user",
        },
        onSubmit,
        validators: [{ run: nativeValidator, triggers: [] }],
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(nativeValidator).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("exposes the validated protobuf message in native schema outputs", async () => {
    const onSubmit = rs.fn(({ schemaOutputs }) => {
      expect(schemaOutputs[0].$typeName).toBe("protoform.v1.AutoFormExample");
      expect(schemaOutputs[0].username).toBe("protoform_admin");
    });
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: buildValidProtoFormValues(),
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("switches oneof branches without retaining the previous value", () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: {
          preferredContact: {
            case: "preferredEmail",
            value: "ada@example.com",
          },
          username: "valid_user",
        },
      })
    );

    act(() => {
      result.current.setOneofValue("preferredContact", "preferredPhone", "+48123456789");
    });

    expect(result.current.createMessage().preferredContact).toEqual({
      case: "preferredPhone",
      value: "+48123456789",
    });
  });
});

function buildValidProtoFormValues(): Record<string, unknown> {
  return {
    accessTier: 3,
    age: 34,
    avatarBytes: "AQIDBA==",
    bio: "A protobuf-backed form with Buf reflection and Protovalidate.",
    createdAt: "2026-03-17T09:00",
    employeeNumber: "4001",
    homepageUrl: "https://protoform.com",
    labels: [{ key: "team", value: "frontend" }],
    maximumThreshold: 10,
    minimumThreshold: 5,
    officeLocations: [
      {
        key: "hq",
        value: {
          city: "San Francisco",
          country: 1,
          lineOne: "500 Harbor Way",
          postalCode: "94107",
          state: "CA",
        },
      },
    ],
    preferredContact: {
      case: "preferredEmail",
      value: "forms@protoform.com",
    },
    primaryEmail: "forms@protoform.com",
    reminderInterval: "300s",
    resourceId: "123e4567-e89b-12d3-a456-426614174000",
    shippingAddress: {
      city: "San Francisco",
      country: 1,
      lineOne: "500 Harbor Way",
      postalCode: "94107",
      state: "CA",
    },
    storageQuotaBytes: "4096",
    tags: ["forms"],
    username: "protoform_admin",
    writablePaths: ["profile"],
  };
}
