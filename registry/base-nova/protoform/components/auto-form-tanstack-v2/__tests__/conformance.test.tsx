import { describe, expect, rs } from "@rstest/core";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import "@/registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations";
import { AddressSchema } from "@/registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb";

import type { SchemaProvider } from "../../auto-form/core-types";
import { AutoForm } from "..";

describe("experimental TanStack Form v2 AutoForm conformance", () => {
  test("keeps the v2-native API and submits transformed provider output", async () => {
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
    expect(onFormInit.mock.calls[0]?.[0].Field).toBeTypeOf("function");
    expect(onFormInit.mock.calls[0]?.[0].Subscribe).toBeTypeOf("function");
    expect(onFormInit.mock.calls[0]?.[0].atom).toBeDefined();
    const [initializedForm] = onFormInit.mock.calls[0] ?? [];
    expect(initializedForm).toBeDefined();
    expect(initializedForm && "store" in initializedForm).toBe(false);
  });

  test("uses v2 field state for repeated fields", async () => {
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

  test("clears the previous oneof branch when the selection changes", async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    const schema: SchemaProvider<{
      contact: { case?: string; value?: unknown };
    }> = {
      getDefaultValues: () => ({
        contact: { case: "email", value: "ada@example.com" },
      }),
      parseSchema: () => ({
        fields: [
          {
            key: "contact",
            required: false,
            schema: [
              { key: "email", required: true, type: "string" },
              { key: "phone", required: true, type: "string" },
            ],
            type: "oneof",
          },
        ],
      }),
      validateSchema: (values) => ({ data: values, success: true }),
    };

    render(<AutoForm onSubmit={onSubmit} schema={schema} withSubmit />);

    fireEvent.click(screen.getByRole("combobox", { name: /contact/iu }));
    const phoneOption = await screen.findByRole("option", { name: /phone/iu });
    fireEvent.pointerEnter(phoneOption, { pointerType: "touch" });
    fireEvent.pointerDown(phoneOption, { pointerType: "touch" });
    fireEvent.click(phoneOption);
    await user.type(await screen.findByRole("textbox", { name: /phone/iu }), "+48123456789");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      contact: { case: "phone", value: "+48123456789" },
    });
  });

  test("renders every provider validation failure through v2 field errors", async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    const schema = createNameSchema(() => ({
      errors: [
        { message: "Name is required.", path: ["name"] },
        { message: "Name must be unique.", path: ["name"] },
      ],
      success: false,
    }));

    render(<AutoForm onSubmit={onSubmit} schema={schema} withSubmit />);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).not.toHaveBeenCalled();
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

  test("surfaces a rejected async provider validation without leaking it", async () => {
    const user = userEvent.setup();
    const schema = createNameSchema(async (values) => {
      await Promise.resolve();
      if (values.name === "reject") {
        throw new Error("Async provider exploded.");
      }
      return { data: values, success: true };
    });

    render(<AutoForm schema={schema} withSubmit />);
    await user.type(screen.getByRole("textbox", { name: /name/iu }), "reject");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    const rootError = await screen.findByRole("alert");
    expect(rootError.textContent?.match(/Async provider exploded\./gu)).toHaveLength(1);
  });

  test("clears provider errors when controlled values reset the form", async () => {
    const user = userEvent.setup();
    const schema = createNameSchema((values) =>
      values.name
        ? { data: values, success: true }
        : {
            errors: [{ message: "Enter a name.", path: ["name"] }],
            success: false,
          }
    );
    const view = render(<AutoForm schema={schema} values={{ name: "" }} withSubmit />);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Enter a name.")).toBeInTheDocument();

    view.rerender(<AutoForm schema={schema} values={{ name: "Ada" }} withSubmit />);

    await waitFor(() => expect(screen.queryByText("Enter a name.")).not.toBeInTheDocument());
    expect(screen.getByRole("textbox", { name: /name/iu })).toHaveValue("Ada");
  });

  test("runs provider validation on change when requested", async () => {
    const user = userEvent.setup();
    const schema = createNameSchema((values) =>
      String(values.name).length >= 3
        ? { data: values, success: true }
        : {
            errors: [
              {
                message: "Use at least three characters.",
                path: ["name"],
              },
            ],
            success: false,
          }
    );

    render(<AutoForm schema={schema} validationMode="change" />);
    await user.type(screen.getByRole("textbox", { name: /name/iu }), "ab");

    expect(await screen.findByText("Use at least three characters.")).toBeInTheDocument();
  });

  test("runs provider validation on blur when requested", async () => {
    const user = userEvent.setup();
    const schema = createNameSchema((values) =>
      String(values.name).length >= 3
        ? { data: values, success: true }
        : {
            errors: [
              {
                message: "Use at least three characters.",
                path: ["name"],
              },
            ],
            success: false,
          }
    );

    render(<AutoForm schema={schema} validationMode="blur" />);
    await user.type(screen.getByRole("textbox", { name: /name/iu }), "ab");
    expect(screen.queryByText("Use at least three characters.")).not.toBeInTheDocument();

    await user.tab();
    expect(await screen.findByText("Use at least three characters.")).toBeInTheDocument();
  });

  test("ignores stale asynchronous v2 validation results", async () => {
    const user = userEvent.setup();
    let resolveFirst: (() => void) | undefined;
    let resolveSecond: (() => void) | undefined;
    const schema = createNameSchema(
      (values) =>
        new Promise((resolve) => {
          if (values.name === "a") {
            resolveFirst = () =>
              resolve({
                errors: [
                  {
                    message: "Stale validation result.",
                    path: ["name"],
                  },
                ],
                success: false,
              });
            return;
          }
          resolveSecond = () => resolve({ data: values, success: true });
        })
    );

    render(<AutoForm schema={schema} validationMode="change" />);
    await user.type(screen.getByRole("textbox", { name: /name/iu }), "ab");
    await waitFor(() => {
      expect(resolveFirst).toBeTypeOf("function");
      expect(resolveSecond).toBeTypeOf("function");
    });

    await act(async () => resolveSecond?.());
    await act(async () => resolveFirst?.());
    expect(screen.queryByText("Stale validation result.")).not.toBeInTheDocument();
  });

  test("appends provider validation without replacing native v2 validators", async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    const nativeValidator = rs.fn(() => ({
      fields: { name: "Native validation failed." },
    }));

    render(
      <AutoForm
        formOptions={{
          validators: [{ run: nativeValidator, triggers: [] }],
        }}
        onSubmit={onSubmit}
        schema={createNameSchema()}
        withSubmit
      />
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(nativeValidator).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText("Native validation failed.")).toBeInTheDocument();
  });

  test("runs native v2 submission only after provider validation passes", async () => {
    const user = userEvent.setup();
    const nativeOnSubmit = rs.fn();
    const onSubmit = rs.fn();
    const schema = createNameSchema((values) =>
      values.name
        ? { data: values, success: true }
        : {
            errors: [{ message: "Enter a name.", path: ["name"] }],
            success: false,
          }
    );

    render(<AutoForm formOptions={{ onSubmit: nativeOnSubmit }} onSubmit={onSubmit} schema={schema} withSubmit />);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Enter a name.")).toBeInTheDocument();
    expect(nativeOnSubmit).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(screen.getByRole("textbox", { name: /name/iu }), "Ada");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(nativeOnSubmit).toHaveBeenCalledTimes(1);
  });

  test("honors validation errors returned by native v2 onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();

    render(
      <AutoForm
        formOptions={{
          onSubmit: ({ createValidationError }) =>
            createValidationError({
              fields: { name: "The server rejected this name." },
            }),
        }}
        onSubmit={onSubmit}
        schema={createNameSchema()}
        withSubmit
      />
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText("The server rejected this name.")).toBeInTheDocument();
  });

  test("builds update masks from the v2 default-value baseline", async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    render(
      <AutoForm
        defaultValues={{
          city: "Warsaw",
          country: 4,
          lineOne: "1 Main Street",
          postalCode: "00-001",
          state: "Mazowieckie",
        }}
        onSubmit={onSubmit}
        schema={AddressSchema}
        withSubmit
      />
    );

    const city = screen.getByRole("textbox", { name: /city/iu });
    await user.clear(city);
    await user.type(city, "Krakow");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[2].updateMask.paths).toEqual(["city"]);
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
