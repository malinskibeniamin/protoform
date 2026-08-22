import { describe, expect } from "@rstest/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutoForm } from "..";
import { createMockProvider } from "./test-utils";

if (!HTMLElement.prototype.hasPointerCapture) {
  Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", {
    value: () => false,
  });
}

if (!HTMLElement.prototype.setPointerCapture) {
  Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
    value: () => undefined,
  });
}

if (!HTMLElement.prototype.releasePointerCapture) {
  Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
    value: () => undefined,
  });
}

describe("AutoForm – compact array row rendering", () => {
  test("array items in compact mode do not render visible label elements", () => {
    const schema = createMockProvider([
      {
        key: "tags",
        required: false,
        schema: [{ key: "0", required: true, type: "string" }],
        type: "array",
      },
    ]);

    render(<AutoForm defaultValues={{ tags: ["alpha", "beta"] }} schema={schema} testId="compact" withSubmit />);

    // The top-level "tags" field has a visible label, but individual array item
    // fields (tags.0, tags.1) use compact mode and suppress the label entirely.
    const itemFields = screen.getAllByTestId(/compact-field-tags-\d+-control/u);
    expect(itemFields).toHaveLength(2);

    // Each item's FieldWrapper should not contain a label element for the item
    for (const input of itemFields) {
      const fieldWrapper = input.closest('[data-slot="field"]');
      expect(fieldWrapper).toBeTruthy();
      const labels = fieldWrapper?.querySelectorAll('[data-slot="field-label"]');
      expect(labels?.length ?? 0).toBe(0);
    }
  });

  test("array items in compact mode do not show help icons", () => {
    const schema = createMockProvider([
      {
        key: "tags",
        required: false,
        schema: [{ key: "0", required: true, type: "string" }],
        type: "array",
      },
    ]);

    render(<AutoForm defaultValues={{ tags: ["alpha", "beta"] }} schema={schema} testId="compact" withSubmit />);

    const helpButtons = screen.queryAllByTestId(/help$/u);
    const tagRowHelps = helpButtons.filter((el) => el.getAttribute("data-testid")?.includes("tags"));
    // Top-level "tags" field may have help, but individual rows should not
    const rowHelps = tagRowHelps.filter((el) => {
      const testId = el.getAttribute("data-testid") ?? "";
      return /\.\d+/u.test(testId);
    });
    expect(rowHelps).toHaveLength(0);
  });

  test("array items in compact mode still show validation errors on submit", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider(
      [
        {
          key: "tags",
          required: false,
          schema: [{ key: "0", required: true, type: "string" }],
          type: "array",
        },
      ],
      {},
      (values) => {
        const tags = (values as Record<string, unknown>)["tags"] as string[] | undefined;
        const errors: { path: (string | number)[]; message: string }[] = [];
        if (tags) {
          for (let i = 0; i < tags.length; i += 1) {
            if ((tags[i] ?? "").length < 2) {
              errors.push({ message: "Too short", path: ["tags", i] });
            }
          }
        }
        if (errors.length > 0) {
          return { errors, success: false };
        }
        return { data: values, success: true };
      }
    );

    render(
      <AutoForm
        defaultValues={{ tags: ["ok", "x"] }}
        formOptions={{ mode: "all" }}
        schema={schema}
        testId="compact"
        withSubmit
      />
    );

    // Clear the second item to trigger a min-length error
    const secondInput = screen.getByTestId("compact-field-tags-1-control");
    await user.clear(secondInput);
    await user.type(secondInput, "a");

    await user.click(screen.getByRole("button", { name: /submit/iu }));

    await waitFor(() => {
      expect(screen.getByText(/too short/iu)).toBeInTheDocument();
    });
  });

  test("delete button is present and removes an item", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([
      {
        key: "tags",
        required: false,
        schema: [{ key: "0", required: true, type: "string" }],
        type: "array",
      },
    ]);

    render(
      <AutoForm defaultValues={{ tags: ["alpha", "beta", "gamma"] }} schema={schema} testId="compact" withSubmit />
    );

    const removeButtons = screen.getAllByRole("button", { name: /remove item/iu });
    expect(removeButtons.length).toBe(3);
    const [firstRemoveButton] = removeButtons;
    if (!firstRemoveButton) {
      throw new Error("Expected the first compact-row remove button.");
    }

    await user.click(firstRemoveButton);

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /remove item/iu })).toHaveLength(2);
    });
  });

  test("fields with customData.hidden are not rendered", () => {
    const schema = createMockProvider([
      { key: "visible", required: true, type: "string" },
      { key: "secret", required: true, type: "string" },
    ]);

    render(
      <AutoForm
        defaultValues={{ secret: "world", visible: "hello" }}
        fieldConfig={{ secret: { customData: { hidden: true } } }}
        schema={schema}
        testId="hidden"
        withSubmit
      />
    );

    expect(screen.getByDisplayValue("hello")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("world")).not.toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="auto-form-field-row"]')).toHaveLength(1);
  });

  test("fields with customData.immutable are rendered as disabled", () => {
    const schema = createMockProvider([
      { key: "editable", required: true, type: "string" },
      { key: "locked", required: true, type: "string" },
    ]);

    render(
      <AutoForm
        defaultValues={{ editable: "can edit", locked: "read only" }}
        fieldConfig={{ locked: { customData: { immutable: true } } }}
        schema={schema}
        testId="immutable"
        withSubmit
      />
    );

    const editableInput = screen.getByDisplayValue("can edit");
    const lockedInput = screen.getByDisplayValue("read only");

    expect(editableInput).not.toBeDisabled();
    expect(lockedInput).toBeDisabled();
  });

  test("objects with customData.collapsible render collapsed by default", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([
      {
        key: "advancedSettings",
        required: true,
        schema: [{ key: "retries", required: true, type: "number" }],
        type: "object",
      },
    ]);

    render(
      <AutoForm
        defaultValues={{ advancedSettings: { retries: 3 } }}
        fieldConfig={{ advancedSettings: { customData: { collapsible: true } } }}
        schema={schema}
        testId="collapsible"
        withSubmit
      />
    );

    // The retries field should not be visible when collapsed
    expect(screen.queryByDisplayValue("3")).not.toBeInTheDocument();

    // Click the collapsible trigger to expand
    const trigger = screen.getByRole("button", { name: /advanced settings/iu });
    await user.click(trigger);

    // After expanding, the retries field should be visible
    await waitFor(() => {
      expect(screen.getByDisplayValue("3")).toBeInTheDocument();
    });
  });
});
