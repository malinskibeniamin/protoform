import { create } from "@bufbuild/protobuf";
import { render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { describe, expect, it } from "vitest";

import "../../lib/protobuf-provider/auto-form-example-annotations.js";

import { AutoFormExampleSchema } from "../../lib/protobuf-provider/gen/auto-form-example_pb.js";

import { useProtoForm } from "./index.js";

const defaults = create(AutoFormExampleSchema, {
  age: 34,
  maximumThreshold: 10,
  minimumThreshold: 5,
  primaryEmail: "person@example.com",
  username: "",
}) as Record<string, unknown>;

function PartialEditHarness() {
  const form = useProtoForm(AutoFormExampleSchema, {
    defaultValues: defaults,
    validationScope: "modified-fields",
  });
  const usernameError = form.formState.errors.username;

  return (
    <>
      <label htmlFor="partial-edit-username">Username</label>
      <input
        id="partial-edit-username"
        {...form.register("username")}
        aria-invalid={Boolean(usernameError)}
      />
      <output aria-label="Update mask">
        {form.createUpdateMask().paths.join(",")}
      </output>
      {usernameError ? <p role="alert">{usernameError.message}</p> : null}
    </>
  );
}

describe("useProtoForm partial-edit validation", () => {
  it("validates and masks a field modified then restored to its blank baseline", async () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults,
        mode: "all",
        validationScope: "modified-fields",
      })
    );

    await act(async () => {
      await result.current.trigger();
    });

    expect(result.current.formState.errors.username).toBeUndefined();
    expect(result.current.createUpdateMask().paths).toEqual([]);

    await act(async () => {
      result.current.setValue("username", "temporary_name", {
        shouldDirty: true,
        shouldValidate: true,
      });
      result.current.setValue("username", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      await result.current.trigger();
    });

    await waitFor(() => {
      expect(result.current.formState.errors.username).toBeDefined();
      expect(result.current.createUpdateMask().paths).toEqual(["username"]);
    });
  });

  it("starts a new modification and validation baseline after reset", async () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: defaults,
        validationScope: "modified-fields",
      })
    );

    await act(async () => {
      result.current.setValue("username", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      await result.current.trigger();
    });
    expect(result.current.formState.errors.username).toBeDefined();
    expect(result.current.createUpdateMask().paths).toEqual(["username"]);

    await act(async () => {
      result.current.reset(result.current.getValues());
      await result.current.trigger();
    });

    await waitFor(() => {
      expect(result.current.formState.errors.username).toBeUndefined();
      expect(result.current.createUpdateMask().paths).toEqual([]);
    });
  });

  it("keeps message-level issues when no field has been modified", async () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: {
          ...defaults,
          maximumThreshold: 4,
          minimumThreshold: 12,
        },
        validationScope: "modified-fields",
      })
    );

    await act(async () => {
      await result.current.trigger();
    });

    expect(result.current.formState.errors.root?.message).toMatch(
      /minimum threshold/i
    );
    expect(result.current.formState.errors.username).toBeUndefined();
  });

  it("matches nested modified fields to protobuf mask paths", async () => {
    const { result } = renderHook(() =>
      useProtoForm(AutoFormExampleSchema, {
        defaultValues: {
          ...defaults,
          shippingAddress: {
            city: "",
            lineOne: "100 Example Street",
          },
        },
        validationScope: "modified-fields",
      })
    );

    await act(async () => {
      result.current.setValue("shippingAddress.city", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      await result.current.trigger();
    });

    await waitFor(() => {
      expect(
        result.current.formState.errors.shippingAddress?.city
      ).toBeDefined();
      expect(result.current.formState.errors.username).toBeUndefined();
      expect(result.current.createUpdateMask().paths).toEqual([
        "shipping_address.city",
      ]);
    });
  });

  it("tracks modification intent from registered input events", async () => {
    const user = userEvent.setup();
    render(<PartialEditHarness />);

    const username = screen.getByRole("textbox", { name: "Username" });
    await user.click(username);
    await user.paste("temporary_name");
    await user.clear(username);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeVisible();
      expect(screen.getByLabelText("Update mask")).toHaveTextContent(
        "username"
      );
    });
  });
});
