import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { SimpleMultiSelect } from "../../multi-select";
import { AutoForm } from "..";
import type { SchemaProvider } from "../core-types";

const simpleProvider: SchemaProvider = {
  getDefaultValues: () => ({
    email: "hello@protoform.dev",
    newsletter: true,
    notes: "Generated from a schema provider.",
  }),
  parseSchema: () => ({
    fields: [
      { fieldConfig: { label: "Work email" }, key: "email", required: true, type: "string" },
      { fieldConfig: { label: "Subscribe" }, key: "newsletter", required: false, type: "boolean" },
      {
        fieldConfig: { description: "A short textarea rendered through the shadcn input stack.", label: "Notes" },
        key: "notes",
        required: false,
        type: "string",
      },
    ],
  }),
  validateSchema: (values) => ({ data: values, success: true }),
};

test("browser visual regression: simple shadcn-native auto form", async () => {
  render(
    <>
      <style>{'[data-testid="browser-simple-form"] textarea { resize: none; }'}</style>
      <main className="max-w-2xl bg-background p-6 text-foreground">
        <AutoForm schema={simpleProvider} testId="browser-simple-form" withSubmit />
      </main>
    </>
  );

  const form = page.getByTestId("browser-simple-form");
  await expect.element(form).toBeVisible();
  if (import.meta.env["VISUAL_REGRESSION"]) {
    await expect.element(form).toMatchScreenshot("simple-auto-form", {
      comparatorName: "pixelmatch",
      comparatorOptions: { allowedMismatchedPixels: 50 },
    });
  }
});

test("renders labels for controlled enum selections on first paint", async () => {
  render(
    <SimpleMultiSelect
      options={[
        { label: "Active", value: "1" },
        { label: "Paused", value: "2" },
      ]}
      testId="enum-statuses"
      value={["1", "2"]}
    />
  );

  await expect.element(page.getByTestId("enum-statuses-selected-1")).toHaveTextContent("Active");
  await expect.element(page.getByTestId("enum-statuses-selected-2")).toHaveTextContent("Paused");
});
