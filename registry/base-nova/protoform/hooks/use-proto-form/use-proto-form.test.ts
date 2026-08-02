import { create, fromBinary, toBinary, toJson } from "@bufbuild/protobuf";
import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it } from "vitest";

import "../../lib/protobuf-provider/auto-form-example-annotations.js";

import { AutoFormExampleSchema } from "../../lib/protobuf-provider/gen/auto-form-example_pb.js";

import { useProtoForm, useProtoFormDefaults } from "./index.js";

// Pre-compute defaults outside renderHook to avoid TS2589 "excessively deep"
// type instantiation when the full generic chain is inferred in one expression.
const emptyDefaults = create(AutoFormExampleSchema) as Record<string, unknown>;

function defaults(overrides: Record<string, unknown> = {}) {
  return { ...emptyDefaults, ...overrides };
}

// ---------------------------------------------------------------------------
// useProtoFormDefaults — cast-free default values
// ---------------------------------------------------------------------------

describe("useProtoFormDefaults", () => {
  it("creates typed defaults from a proto schema", () => {
    const result = useProtoFormDefaults(AutoFormExampleSchema, {
      age: 25,
      username: "default_user",
    });

    expect(result.username).toBe("default_user");
    expect(result.age).toBe(25);
    expect((result as Record<string, unknown>).$typeName).toBe(
      "protoform.v1.AutoFormExample"
    );
  });

  it("works with no init (empty message)", () => {
    const result = useProtoFormDefaults(AutoFormExampleSchema);
    expect(result.username).toBe("");
    expect(result.age).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Basic hook contract
// ---------------------------------------------------------------------------

describe("useProtoForm", () => {
  it("returns form instance with all proto helpers", () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, { defaultValues: defaults() })
    );

    expect(result.current.register).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.formState).toBeDefined();
    expect(result.current.createMessage).toBeDefined();
    expect(result.current.createUpdateMask).toBeDefined();
    expect(result.current.setOneofValue).toBeDefined();
    expect(result.current.getNestedErrors).toBeDefined();
  });

  it("reflects invalid state when mode enables continuous validation", async () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults(),
        mode: "all",
      })
    );

    await waitFor(() => {
      expect(result.current.formState.isValid).toBe(false);
    });
  });

  it("produces field-level errors for invalid values", async () => {
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
      expect(result.current.formState.errors.username).toBeDefined();
      expect(result.current.formState.errors.username?.message).toMatch(/3/);
    });
  });

  it("clears errors when values become valid", async () => {
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
      expect(result.current.formState.errors.username).toBeDefined();
    });

    await act(async () => {
      result.current.setValue("username" as never, "valid_user" as never);
      await result.current.trigger();
    });

    await waitFor(() => {
      expect(result.current.formState.errors.username).toBeUndefined();
    });
  });
});

describe("useProtoForm — update mask", () => {
  it("derives the mask from fields changed through react-hook-form", async () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults({
          primaryEmail: "old@example.com",
          shippingAddress: { city: "Warsaw", lineOne: "1 Main Street" },
        }),
      })
    );

    await act(async () => {
      result.current.setValue("primaryEmail", "new@example.com", {
        shouldDirty: true,
      });
      result.current.setValue("shippingAddress.city", "Krakow", {
        shouldDirty: true,
      });
    });

    await waitFor(() => {
      expect(result.current.createUpdateMask().paths).toEqual([
        "primary_email",
        "shipping_address.city",
      ]);
    });
  });

  it("starts a new mask baseline after reset", async () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults({
          primaryEmail: "old@example.com",
          shippingAddress: { city: "Warsaw", lineOne: "1 Main Street" },
        }),
      })
    );

    await act(async () => {
      result.current.setValue("primaryEmail", "saved@example.com", {
        shouldDirty: true,
      });
    });
    await act(async () => {
      result.current.reset(result.current.getValues());
      result.current.setValue("shippingAddress.city", "Gdansk", {
        shouldDirty: true,
      });
    });

    await waitFor(() => {
      expect(result.current.createUpdateMask().paths).toEqual([
        "shipping_address.city",
      ]);
    });
  });
});

// ---------------------------------------------------------------------------
// createMessage — proto v2 create() bridge
// ---------------------------------------------------------------------------

describe("useProtoForm — createMessage", () => {
  it("preserves unknown fields from parsed default values", async () => {
    const originalBytes = toBinary(
      AutoFormExampleSchema,
      create(AutoFormExampleSchema, { age: 25, username: "unknown_fields" })
    );
    const unknownFieldBytes = [0xb8, 0x3e, 0x07];
    const parsedDefaultValues = fromBinary(
      AutoFormExampleSchema,
      Uint8Array.from([...originalBytes, ...unknownFieldBytes])
    );
    const defaultValues = defaults({
      $typeName: parsedDefaultValues.$typeName,
      $unknown: parsedDefaultValues.$unknown,
      age: parsedDefaultValues.age,
      username: parsedDefaultValues.username,
    });
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, { defaultValues })
    );

    await act(async () => {
      result.current.setValue("age", 26, { shouldDirty: true });
    });

    const message = result.current.createMessage();
    const editedBytes = toBinary(AutoFormExampleSchema, message);
    expect(message.age).toBe(26);
    expect(message.$unknown).toEqual(parsedDefaultValues.$unknown);
    expect(Array.from(editedBytes.slice(-unknownFieldBytes.length))).toEqual(
      unknownFieldBytes
    );
  });

  it("builds a protobuf message from current form values", () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults({ age: 25, username: "test_user" }),
      })
    );

    const message = result.current.createMessage();
    expect(message.$typeName).toBe("protoform.v1.AutoFormExample");
    expect(message.username).toBe("test_user");
    expect(message.age).toBe(25);
  });

  it("strips stale protobuf metadata from RHF internal state", async () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults({
          preferredContact: { case: "preferredEmail", value: "a@b.com" },
          username: "stale_test",
        }),
      })
    );

    // Simulate what RHF does: switch oneof then read back — internal state
    // may carry $typeName from the original message through getValues().
    await act(async () => {
      result.current.setOneofValue(
        "preferredContact",
        "preferredPhone",
        "+1555"
      );
    });

    // createMessage must produce a clean message even when RHF state has
    // stale metadata — formValuesToProtoInit strips it before create().
    const message = result.current.createMessage();
    const json = toJson(AutoFormExampleSchema, message);
    expect(json).toEqual(expect.objectContaining({ preferredPhone: "+1555" }));
    expect(message.preferredContact.case).toBe("preferredPhone");
    expect(message.preferredContact.value).toBe("+1555");
  });

  it("produces a message that survives JSON round-trip", () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults({
          accessTier: 2,
          age: 30,
          primaryEmail: "rt@example.com",
          username: "roundtrip_user",
        }),
      })
    );

    const message = result.current.createMessage();
    const json = toJson(AutoFormExampleSchema, message);

    expect(json).toEqual(
      expect.objectContaining({
        accessTier: "ACCESS_TIER_EDITOR",
        age: 30,
        primaryEmail: "rt@example.com",
        username: "roundtrip_user",
      })
    );
  });
});

// ---------------------------------------------------------------------------
// Nested messages (Address inside AutoFormExample)
// ---------------------------------------------------------------------------

describe("useProtoForm — nested messages", () => {
  it("handles nested object values and creates message", () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults({
          shippingAddress: {
            city: "Portland",
            lineOne: "100 Main St",
            state: "OR",
          },
        }),
      })
    );

    const message = result.current.createMessage();
    expect(message.shippingAddress?.lineOne).toBe("100 Main St");
    expect(message.shippingAddress?.city).toBe("Portland");
  });

  it("validates nested field constraints", async () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults({
          shippingAddress: { city: "x", lineOne: "ab" },
          username: "valid_user",
        }),
        mode: "all",
      })
    );

    await act(async () => {
      await result.current.trigger();
    });

    await waitFor(() => {
      const errors = result.current.formState.errors;
      const hasNestedErrors =
        errors.shippingAddress !== undefined ||
        Object.keys(errors).some((k) => k.startsWith("shippingAddress"));
      expect(hasNestedErrors).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// Oneof fields — setOneofValue + createMessage
// ---------------------------------------------------------------------------

describe("useProtoForm — oneof fields", () => {
  it("creates message with oneof values from defaults", () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults({
          preferredContact: { case: "preferredEmail", value: "oneof@test.com" },
          username: "oneof_user",
        }),
      })
    );

    const message = result.current.createMessage();
    expect(message.preferredContact.case).toBe("preferredEmail");
    expect(message.preferredContact.value).toBe("oneof@test.com");
  });

  it("handles unset oneof gracefully", () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults({ username: "no_contact" }),
      })
    );

    const message = result.current.createMessage();
    expect(message.preferredContact.case).toBeUndefined();
  });

  it("setOneofValue switches oneof branch without casts", async () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults({
          preferredContact: { case: "preferredEmail", value: "first@test.com" },
        }),
      })
    );

    await act(async () => {
      result.current.setOneofValue(
        "preferredContact",
        "preferredPhone",
        "+1234567890"
      );
    });

    const message = result.current.createMessage();
    expect(message.preferredContact.case).toBe("preferredPhone");
    expect(message.preferredContact.value).toBe("+1234567890");
  });

  it("throws when setOneofValue targets a non-oneof field", () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults({ username: "guard_test" }),
      })
    );

    expect(() => {
      result.current.setOneofValue("username", "someCase", "someValue");
    }).toThrow("target is not a oneof field");
  });
});

// ---------------------------------------------------------------------------
// getNestedErrors — drill into oneof/nested error objects
// ---------------------------------------------------------------------------

describe("useProtoForm — getNestedErrors", () => {
  it("returns undefined when no errors exist", async () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults({ username: "valid_user" }),
      })
    );

    await waitFor(() => {
      expect(
        result.current.getNestedErrors("shippingAddress.lineOne")
      ).toBeUndefined();
    });
  });

  it("drills into nested error objects", async () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults({
          shippingAddress: { city: "x", lineOne: "ab" },
          username: "valid_user",
        }),
        mode: "all",
      })
    );

    await act(async () => {
      await result.current.trigger();
    });

    await waitFor(() => {
      const errors = result.current.getNestedErrors("shippingAddress");
      expect(errors).toBeDefined();
    });
  });
});
