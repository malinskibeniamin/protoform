import { describe, expect } from "@rstest/core";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AutoForm } from "../index";
import { createMockProvider } from "./test-utils";

describe("AutoForm runtime messages", () => {
  test("formats Protoform-owned submit, collection ARIA, multiselect, and provider empty-state copy through stable message codes", async () => {
    const schema = createMockProvider(
      [
        { key: "name", required: true, type: "string" },
        {
          key: "tags",
          required: false,
          schema: [{ key: "0", required: true, type: "string" }],
          type: "array",
        },
        {
          key: "regions",
          required: false,
          schema: [{ key: "value", options: [["eu", "Europe"]], required: true, type: "select" }],
          type: "array",
        },
      ],
      { tags: ["one"] }
    );
    const translations: Record<string, string> = {
      "auto_form.add_item": "Add translated",
      "auto_form.multiselect.placeholder": "Choose translated",
      "auto_form.remove_item": "Remove translated",
      "auto_form.submit": "Send translated",
    };

    render(
      <AutoForm
        formatMessage={(code, _params, fallback) => translations[code] ?? fallback}
        schema={schema}
        withSubmit
      />
    );

    expect(screen.getByRole("button", { name: "Send translated" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Add translated" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Remove translated" })).toBeVisible();
    expect(screen.getByText("Choose translated")).toBeVisible();

    cleanup();
    const user = userEvent.setup();
    const schemaEmpty = createMockProvider([
      {
        fieldConfig: { customData: { dataProvider: "regions" } },
        key: "region",
        required: false,
        type: "string",
      },
    ]);

    render(
      <AutoForm
        dataProviders={{ regions: () => ({ options: [] }) }}
        formatMessage={(code, _params, fallback) =>
          code === "auto_form.select.empty" ? "Nothing translated" : fallback
        }
        schema={schemaEmpty}
      />
    );

    await user.click(screen.getByRole("combobox", { name: "Region" }));
    expect(screen.getByText("Nothing translated")).toBeVisible();
  });

  test("formats step navigation and progress copy", () => {
    const schema = createMockProvider([{ key: "name", required: true, type: "string" }]);
    const translations: Record<string, string> = {
      "auto_form.continue": "Continue translated",
      "auto_form.form_progress": "Progress translated",
      "auto_form.step_progress": "First translated",
    };

    render(
      <AutoForm
        formatMessage={(code, _params, fallback) => translations[code] ?? fallback}
        schema={schema}
        stepper={{
          steps: [
            { id: "details", title: "Details" },
            { id: "review", title: "Review" },
          ],
        }}
        withSubmit
      />
    );

    expect(screen.getByRole("navigation", { name: "Progress translated" })).toBeVisible();
    expect(screen.getByText("First translated")).toBeVisible();
    expect(screen.getByRole("button", { name: "Continue translated" })).toBeVisible();
  });
});
