import { describe, expect } from "@rstest/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
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
  test("compact array rows suppress item labels and remove the selected item", async () => {
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

    // The top-level "tags" field has a visible label, but individual array item
    // fields use compact mode and suppress the label entirely.
    const itemFields = screen.getAllByTestId(/compact-field-tags-\d+-control/u);
    expect(itemFields).toHaveLength(3);
    for (const input of itemFields) {
      const fieldWrapper = input.closest('[data-slot="field"]');
      expect(fieldWrapper).toBeTruthy();
      expect(fieldWrapper?.querySelectorAll('[data-slot="field-label"]')).toHaveLength(0);
    }

    const [firstRemoveButton] = screen.getAllByRole("button", { name: /remove item/iu });
    if (!firstRemoveButton) {
      throw new Error("Expected the first compact-row remove button.");
    }
    await user.click(firstRemoveButton);

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /remove item/iu })).toHaveLength(2);
    });
    expect(screen.queryByDisplayValue("alpha")).not.toBeInTheDocument();
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

  test("hides customData.hidden fields, disables customData.immutable fields, and collapses customData.collapsible objects", async () => {
    const schema = createMockProvider([
      { key: "editable", required: true, type: "string" },
      { key: "locked", required: true, type: "string" },
      { key: "secret", required: true, type: "string" },
    ]);

    render(
      <AutoForm
        defaultValues={{ editable: "can edit", locked: "read only", secret: "world" }}
        fieldConfig={{ locked: { customData: { immutable: true } }, secret: { customData: { hidden: true } } }}
        schema={schema}
        testId="policy"
        withSubmit
      />
    );

    expect(screen.queryByDisplayValue("world")).not.toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="auto-form-field-row"]')).toHaveLength(2);
    expect(screen.getByDisplayValue("can edit")).not.toBeDisabled();
    expect(screen.getByDisplayValue("read only")).toBeDisabled();

    cleanup();
    const user = userEvent.setup();
    const schemaCollapsible = createMockProvider([
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
        schema={schemaCollapsible}
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
