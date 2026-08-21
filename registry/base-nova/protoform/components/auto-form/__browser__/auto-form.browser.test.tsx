import { page } from "@rstest/browser";
import { render } from "@rstest/browser-react";
import { expect, test } from "@rstest/core";
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

test("renders a simple shadcn-native auto form in a browser", async () => {
  await render(
    <>
      <style>{'[data-testid="browser-simple-form"] textarea { resize: none; }'}</style>
      <main className="max-w-2xl bg-background p-6 text-foreground">
        <AutoForm schema={simpleProvider} testId="browser-simple-form" withSubmit />
      </main>
    </>
  );

  const form = page.getByTestId("browser-simple-form");
  await expect.element(form).toBeVisible();
});

test("renders labels for controlled enum selections on first paint", async () => {
  await render(
    <SimpleMultiSelect
      options={[
        { label: "Active", value: "1" },
        { label: "Paused", value: "2" },
      ]}
      testId="enum-statuses"
      value={["1", "2"]}
    />
  );

  await expect.element(page.getByTestId("enum-statuses-selected-1")).toHaveText("Active");
  await expect.element(page.getByTestId("enum-statuses-selected-2")).toHaveText("Paused");
});
