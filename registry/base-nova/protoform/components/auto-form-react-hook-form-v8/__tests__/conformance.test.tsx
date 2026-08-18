import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { SchemaProvider } from "../../auto-form/core-types";
import { AutoForm } from "..";

describe("experimental React Hook Form v8 AutoForm conformance", () => {
  it("keeps the v8-native API and submits transformed provider output", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onFormInit = vi.fn();
    const schema = createNameSchema((values) => ({
      data: { name: String(values.name).trim().toUpperCase() },
      success: true,
    }));

    render(<AutoForm onFormInit={onFormInit} onSubmit={onSubmit} schema={schema} withSubmit />);

    await user.type(screen.getByRole("textbox", { name: /name/i }), " ada ");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ name: "ADA" });
    expect(onFormInit.mock.calls[0]?.[0].register).toBeTypeOf("function");
    expect(onFormInit.mock.calls[0]?.[0].control).toBeDefined();
  });

  it("uses v8 field keys for repeated fields", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
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

    await user.click(screen.getByRole("button", { name: /add tags/i }));
    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[1] as HTMLInputElement, "second");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ tags: ["first", "second"] });
  });

  it("renders every provider validation failure through v8 field errors", async () => {
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
    expect(screen.getByRole("textbox", { name: /name/i })).toHaveAttribute("aria-invalid", "true");
  });

  it("renders a provider root error once", async () => {
    const user = userEvent.setup();
    const schema = createNameSchema(() => ({
      errors: [{ message: "Provider exploded.", path: [] }],
      success: false,
    }));

    render(<AutoForm schema={schema} withSubmit />);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    const rootError = await screen.findByRole("alert");
    expect(rootError.textContent?.match(/Provider exploded\./g)).toHaveLength(1);
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
