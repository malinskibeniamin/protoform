import { describe, expect, rs } from "@rstest/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { SchemaProvider } from "../../auto-form/core-types";
import { AutoForm } from "..";

describe("experimental React Hook Form v8 AutoForm conformance", () => {
  test("keeps the v8-native API and submits transformed provider output", async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    const onFormInit = rs.fn();
    const schema = createNameSchema((values) => ({
      data: { name: String(values.name).trim().toUpperCase() },
      success: true,
    }));

    render(<AutoForm onFormInit={onFormInit} onSubmit={onSubmit} schema={schema} withSubmit />);

    await user.type(screen.getByRole("textbox", { name: /name/iu }), " ada ");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ name: "ADA" });
    expect(onFormInit.mock.calls[0]?.[0].register).toBeTypeOf("function");
    expect(onFormInit.mock.calls[0]?.[0].control).toBeDefined();
  });

  test("uses v8 field keys for repeated fields", async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    const schema: SchemaProvider<{ tags: string[] }> = {
      getDefaultValues: () => ({ tags: ["first"] }),
      parseSchema: () => ({
        fields: [
          {
            key: "tags",
            required: false,
            schema: [{ key: "item", required: true, type: "string" }],
            type: "array",
          },
        ],
      }),
      validateSchema: (values) => ({ data: values, success: true }),
    };

    render(<AutoForm onSubmit={onSubmit} schema={schema} withSubmit />);

    await user.click(screen.getByRole("button", { name: /add tags/iu }));
    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[1] as HTMLInputElement, "second");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ tags: ["first", "second"] });
  });

  test("renders every provider validation failure through v8 field errors", async () => {
    const user = userEvent.setup();
    const schema = createNameSchema(() => ({
      errors: [
        { message: "Name is required.", path: ["name"] },
        { message: "Name must be unique.", path: ["name"] },
      ],
      success: false,
    }));

    render(<AutoForm schema={schema} withSubmit />);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    const fieldError = await screen.findByRole("alert");
    expect(fieldError).toHaveTextContent("Name is required.");
    expect(fieldError).toHaveTextContent("Name must be unique.");
    expect(screen.getByRole("textbox", { name: /name/iu })).toHaveAttribute("aria-invalid", "true");
  });

  test("renders a provider root error once", async () => {
    const user = userEvent.setup();
    const schema = createNameSchema(() => ({
      errors: [{ message: "Provider exploded.", path: [] }],
      success: false,
    }));

    render(<AutoForm schema={schema} withSubmit />);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    const rootError = await screen.findByRole("alert");
    expect(rootError.textContent?.match(/Provider exploded\./gu)).toHaveLength(1);
  });
});

function createNameSchema(
  validateSchema: SchemaProvider<{ name: string }>["validateSchema"] = (values) => ({ data: values, success: true })
): SchemaProvider<{ name: string }> {
  return {
    getDefaultValues: () => ({ name: "" }),
    parseSchema: () => ({
      fields: [{ key: "name", required: true, type: "string" }],
    }),
    validateSchema,
  };
}
