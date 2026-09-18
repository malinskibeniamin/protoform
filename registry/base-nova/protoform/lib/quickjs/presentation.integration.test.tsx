import { expect, test } from "@rstest/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutoForm } from "../../components/auto-form";
import { createMockProvider } from "../../components/auto-form/__tests__/test-utils";
import type { FieldConfigMap } from "../../components/auto-form/types";
import { quickJsFieldConfig } from "./presentation";

test("AutoForm applies the optional presentation adapter without clearing hidden values", async () => {
  const user = userEvent.setup();
  const schema = createMockProvider([{ key: "company", required: false, type: "string" }]);
  const base: FieldConfigMap = { company: { label: "Company" } };
  const initial = { company: "Acme" };
  const view = render(<AutoForm defaultValues={initial} fieldConfig={base} schema={schema} />);
  expect(screen.getByRole("textbox", { name: "Company" })).toHaveValue("Acme");
  await user.clear(screen.getByRole("textbox", { name: "Company" }));
  await user.type(screen.getByRole("textbox", { name: "Company" }), "Edited company");
  view.rerender(
    <AutoForm
      defaultValues={initial}
      fieldConfig={quickJsFieldConfig({ company: { visible: false } }, base)}
      schema={schema}
    />
  );
  expect(screen.queryByRole("textbox", { name: "Company" })).not.toBeInTheDocument();
  view.rerender(
    <AutoForm
      defaultValues={initial}
      fieldConfig={quickJsFieldConfig({ company: { disabled: true, visible: true } }, base)}
      schema={schema}
    />
  );
  expect(screen.getByRole("textbox", { name: "Company" })).toHaveValue("Edited company");
  expect(screen.getByRole("textbox", { name: "Company" })).toBeDisabled();
});
