import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AutoForm as TanStackAutoForm } from "../../auto-form-tanstack";
import { AutoForm as ReactHookAutoForm } from "..";
import { createMockProvider } from "./test-utils";

if (!HTMLElement.prototype.hasPointerCapture) {
  Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", { value: () => false });
}
if (!HTMLElement.prototype.setPointerCapture) {
  Object.defineProperty(HTMLElement.prototype, "setPointerCapture", { value: () => undefined });
}
if (!HTMLElement.prototype.releasePointerCapture) {
  Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", { value: () => undefined });
}

const schema = createMockProvider([{ key: "name", required: true, type: "string" }], { name: "" });

const structuredSchema = createMockProvider(
  [
    {
      fieldConfig: { label: "Profile" },
      key: "profile",
      required: false,
      schema: [{ key: "city", required: false, type: "string" }],
      type: "object",
    },
    {
      fieldConfig: { label: "Tags" },
      key: "tags",
      required: false,
      schema: [{ key: "item", required: false, type: "string" }],
      type: "array",
    },
    {
      fieldConfig: { label: "Labels" },
      key: "labels",
      required: false,
      schema: [
        { key: "key", required: false, type: "string" },
        { key: "value", required: false, type: "string" },
      ],
      type: "map",
    },
    {
      fieldConfig: { label: "Contact" },
      key: "contact",
      required: false,
      schema: [{ fieldConfig: { label: "Email" }, key: "email", required: false, type: "string" }],
      type: "oneof",
    },
  ],
  { contact: { case: undefined, value: undefined }, labels: [], profile: { city: "" }, tags: [] }
);

describe.each([
  ["React Hook Form", ReactHookAutoForm],
  ["TanStack Form", TanStackAutoForm],
] as const)("%s dirty-state lifecycle", (_name, FormComponent) => {
  it("reports clean initially, emits distinct changes, and marks the saved values clean synchronously", async () => {
    const user = userEvent.setup();
    const onDirtyChange = vi.fn();
    let cleanBeforeNavigation = false;
    const onSubmit = vi.fn((_values, _nativeForm, context) => {
      context.form.markClean();
      cleanBeforeNavigation = onDirtyChange.mock.calls.at(-1)?.[0] === false;
    });

    render(<FormComponent onDirtyChange={onDirtyChange} onSubmit={onSubmit} schema={schema} withSubmit />);

    await waitFor(() => expect(onDirtyChange.mock.calls.map(([dirty]) => dirty)).toEqual([false]));

    await user.type(screen.getByRole("textbox", { name: /name/i }), "Ada");
    await waitFor(() => expect(onDirtyChange.mock.calls.map(([dirty]) => dirty)).toEqual([false, true]));

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(cleanBeforeNavigation).toBe(true);
    expect(onDirtyChange.mock.calls.map(([dirty]) => dirty)).toEqual([false, true, false]);

    await user.clear(screen.getByRole("textbox", { name: /name/i }));
    await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(true));
    await user.type(screen.getByRole("textbox", { name: /name/i }), "Ada");
    await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(false));
  });

  it("establishes reset values as the new clean baseline", async () => {
    const user = userEvent.setup();
    const onDirtyChange = vi.fn();
    const onSubmit = vi.fn((_values, _nativeForm, context) => {
      context.form.reset({ name: "Saved on the server" });
    });

    render(<FormComponent onDirtyChange={onDirtyChange} onSubmit={onSubmit} schema={schema} withSubmit />);

    const input = screen.getByRole("textbox", { name: /name/i });
    await user.type(input, "Draft");
    await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(true));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(input).toHaveValue("Saved on the server"));
    await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(false));

    await user.type(input, "!");
    await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(true));
  });

  it("tracks nested, array, map, and oneof changes", async () => {
    const user = userEvent.setup();
    const onDirtyChange = vi.fn();
    const onSubmit = vi.fn((_values, _nativeForm, context) => context.form.markClean());
    render(<FormComponent onDirtyChange={onDirtyChange} onSubmit={onSubmit} schema={structuredSchema} withSubmit />);

    async function expectEditThenClean(label: string, edit: () => void | Promise<void>) {
      await edit();
      await waitFor(() => expect(onDirtyChange.mock.calls.at(-1)?.[0], `${label} should become dirty`).toBe(true));
      await user.click(screen.getByRole("button", { name: "Submit" }));
      await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(false));
    }

    await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(false));
    await expectEditThenClean("nested field", () => user.type(screen.getByRole("textbox", { name: "City" }), "Warsaw"));
    await expectEditThenClean("array field", () => user.click(screen.getByRole("button", { name: "Add Tags" })));
    await expectEditThenClean("map field", () => user.click(screen.getByRole("button", { name: "Add pair" })));
    await expectEditThenClean("oneof field", async () => {
      fireEvent.click(screen.getByRole("combobox", { name: "Contact" }));
      const option = await screen.findByRole("option", { name: "Email" });
      fireEvent.pointerEnter(option, { pointerType: "touch" });
      fireEvent.pointerDown(option, { pointerType: "touch" });
      fireEvent.click(option);
    });

    expect(onDirtyChange.mock.calls.map(([dirty]) => dirty)).toEqual([
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
    ]);
  });
});
