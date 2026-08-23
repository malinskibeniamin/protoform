import { describe, expect, it } from "@rstest/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AutoForm } from "../index";
import { createMockProvider } from "./test-utils";

describe("AutoForm runtime messages", () => {
  it("formats Protoform-owned submit copy through stable message codes", () => {
    const schema = createMockProvider([{ key: "name", required: true, type: "string" }]);

    render(
      <AutoForm
        formatMessage={(code, _params, fallback) => (code === "auto_form.submit" ? "Send translated" : fallback)}
        schema={schema}
        withSubmit
      />
    );

    expect(screen.getByRole("button", { name: "Send translated" })).toBeVisible();
  });

  it("formats Protoform-owned ARIA labels", () => {
    const schema = createMockProvider(
      [
        {
          key: "tags",
          required: false,
          schema: [{ key: "0", required: true, type: "string" }],
          type: "array",
        },
      ],
      { tags: ["one"] }
    );

    render(
      <AutoForm
        formatMessage={(code, _params, fallback) => {
          if (code === "auto_form.add_item") {
            return "Add translated";
          }
          return code === "auto_form.remove_item" ? "Remove translated" : fallback;
        }}
        schema={schema}
      />
    );

    expect(screen.getByRole("button", { name: "Add translated" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Remove translated" })).toBeVisible();
  });

  it("formats a provider empty state", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([
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
        schema={schema}
      />
    );

    await user.click(screen.getByRole("combobox", { name: "Region" }));
    expect(screen.getByText("Nothing translated")).toBeVisible();
  });

  it("formats a static multiselect placeholder", () => {
    const schema = createMockProvider([
      {
        key: "regions",
        required: false,
        schema: [{ key: "value", options: [["eu", "Europe"]], required: true, type: "select" }],
        type: "array",
      },
    ]);

    render(
      <AutoForm
        formatMessage={(code, _params, fallback) =>
          code === "auto_form.multiselect.placeholder" ? "Choose translated" : fallback
        }
        schema={schema}
      />
    );

    expect(screen.getByText("Choose translated")).toBeVisible();
  });

  it("formats step navigation and progress copy", () => {
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
