import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import { describe, expect, rs } from "@rstest/core";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import "@/registry/base-nova/protoform/lib/protobuf-provider/auto-form-example-annotations";
import { AddressSchema } from "@/registry/base-nova/protoform/lib/protobuf-provider/gen/auto-form-example_pb";

import type { SchemaProvider } from "../../auto-form/core-types";
import { AutoForm } from "..";

describe("TanStack AutoForm conformance", () => {
  test("keeps the native form API while rendering and submitting provider output", async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    const onFormInit = rs.fn();
    const schema: SchemaProvider<{ name: string }> = {
      getDefaultValues: () => ({ name: "" }),
      parseSchema: () => ({
        fields: [{ key: "name", required: true, type: "string" }],
      }),
      validateSchema: (values) => ({
        data: { name: values.name.trim().toUpperCase() },
        success: true,
      }),
    };

    render(<AutoForm onFormInit={onFormInit} onSubmit={onSubmit} schema={schema} withSubmit />);

    await user.type(screen.getByRole("textbox", { name: /name/iu }), " ada ");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ name: "ADA" });
    expect(onFormInit.mock.calls[0]?.[0].Field).toBeTypeOf("function");
    expect(onFormInit.mock.calls[0]?.[0].Subscribe).toBeTypeOf("function");
  });

  test("uses native TanStack state for repeated fields and clears the previous oneof branch", async () => {
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

    cleanup();
    const onSubmitOneof = rs.fn();
    const schemaOneof: SchemaProvider<{
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

    render(<AutoForm onSubmit={onSubmitOneof} schema={schemaOneof} withSubmit />);

    fireEvent.click(screen.getByRole("combobox", { name: /contact/iu }));
    const phoneOption = await screen.findByRole("option", { name: /phone/iu });
    fireEvent.pointerEnter(phoneOption, { pointerType: "touch" });
    fireEvent.pointerDown(phoneOption, { pointerType: "touch" });
    fireEvent.click(phoneOption);
    await user.type(await screen.findByRole("textbox", { name: /phone/iu }), "+48123456789");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmitOneof).toHaveBeenCalledTimes(1));
    expect(onSubmitOneof.mock.calls[0]?.[0]).toEqual({
      contact: { case: "phone", value: "+48123456789" },
    });
  });

  test("validates with the shared change and blur lifecycles", async () => {
    const user = userEvent.setup();
    const schema: SchemaProvider<{ name: string }> = {
      getDefaultValues: () => ({ name: "" }),
      parseSchema: () => ({
        fields: [{ key: "name", required: true, type: "string" }],
      }),
      validateSchema: (values) =>
        values.name.length >= 3
          ? { data: values, success: true }
          : {
              errors: [{ message: "Use at least three characters.", path: ["name"] }],
              success: false,
            },
    };

    const view = render(<AutoForm schema={schema} validationMode="change" />);
    await user.type(screen.getByRole("textbox", { name: /name/iu }), "ab");
    expect(await screen.findByText("Use at least three characters.")).toBeVisible();
    view.unmount();

    render(<AutoForm schema={schema} validationMode="blur" />);
    await user.type(screen.getByRole("textbox", { name: /name/iu }), "ab");
    expect(screen.queryByText("Use at least three characters.")).not.toBeInTheDocument();

    await user.tab();
    expect(await screen.findByText("Use at least three characters.")).toBeVisible();
  });

  test("ignores stale asynchronous lifecycle results", async () => {
    const user = userEvent.setup();
    let resolveFirst: (() => void) | undefined;
    let resolveSecond: (() => void) | undefined;
    const schema: SchemaProvider<{ name: string }> = {
      getDefaultValues: () => ({ name: "" }),
      parseSchema: () => ({
        fields: [{ key: "name", required: true, type: "string" }],
      }),
      validateSchema: (values) =>
        new Promise((resolve) => {
          if (values.name === "a") {
            resolveFirst = () =>
              resolve({
                errors: [{ message: "Stale validation result.", path: ["name"] }],
                success: false,
              });
            return;
          }
          resolveSecond = () => resolve({ data: values, success: true });
        }),
    };

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

  test("retains native TanStack submit validators and revalidates failed submissions on the shared lifecycle", async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    const nativeValidator = rs.fn(() => "Native validation failed.");
    const schema: SchemaProvider<{ name: string }> = {
      getDefaultValues: () => ({ name: "Ada" }),
      parseSchema: () => ({
        fields: [{ key: "name", required: true, type: "string" }],
      }),
      validateSchema: (values) => ({ data: values, success: true }),
    };

    render(
      <AutoForm
        formOptions={{ validators: { onSubmit: nativeValidator } }}
        onSubmit={onSubmit}
        schema={schema}
        withSubmit
      />
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(nativeValidator).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText("Native validation failed.")).toBeInTheDocument();

    cleanup();
    const schemaRevalidation: SchemaProvider<{ name: string }> = {
      getDefaultValues: () => ({ name: "" }),
      parseSchema: () => ({
        fields: [{ key: "name", required: true, type: "string" }],
      }),
      validateSchema: (values) =>
        values.name
          ? { data: values, success: true }
          : {
              errors: [{ message: "Enter a name.", path: ["name"] }],
              success: false,
            },
    };

    render(<AutoForm revalidationMode="change" schema={schemaRevalidation} validationMode="submit" withSubmit />);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Enter a name.")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: /name/iu }), "Ada");
    await waitFor(() => expect(screen.queryByText("Enter a name.")).not.toBeInTheDocument());
  });

  test("renders every provider failure and runs native TanStack submission only after validation passes", async () => {
    const user = userEvent.setup();
    const nativeOnSubmit = rs.fn();
    const onSubmit = rs.fn();
    const schema: SchemaProvider<{ name: string }> = {
      getDefaultValues: () => ({ name: "" }),
      parseSchema: () => ({
        fields: [{ key: "name", required: true, type: "string" }],
      }),
      validateSchema: (values) =>
        values.name
          ? { data: values, success: true }
          : {
              errors: [
                { message: "Enter a name.", path: ["name"] },
                { message: "Name must be unique.", path: ["name"] },
              ],
              success: false,
            },
    };

    render(<AutoForm formOptions={{ onSubmit: nativeOnSubmit }} onSubmit={onSubmit} schema={schema} withSubmit />);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    // Every provider failure renders and blocks submission.
    const fieldError = await screen.findByRole("alert");
    expect(fieldError).toHaveTextContent("Enter a name.");
    expect(fieldError).toHaveTextContent("Name must be unique.");
    expect(screen.getByRole("textbox", { name: /name/iu })).toHaveAttribute("aria-invalid", "true");
    expect(nativeOnSubmit).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(screen.getByRole("textbox", { name: /name/iu }), "Ada");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(nativeOnSubmit).toHaveBeenCalledTimes(1);
    expect(nativeOnSubmit.mock.calls[0]?.[0].value).toEqual({ name: "Ada" });
  });

  test("builds update masks from native TanStack dirty metadata and preserves the edit source message", async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn((_message, _nativeForm, context) => {
      if (onSubmit.mock.calls.length === 1) {
        context.form.markClean();
      }
    });
    const knownSource = create(AddressSchema, {
      city: "Warsaw",
      country: 4,
      lineOne: "1 Main Street",
      postalCode: "00-001",
      state: "Mazowieckie",
    });
    const source = fromBinary(
      AddressSchema,
      Uint8Array.from([...toBinary(AddressSchema, knownSource), 0x98, 0x06, 0x01])
    );
    render(<AutoForm defaultValues={source} onSubmit={onSubmit} schema={AddressSchema} withSubmit />);

    const city = screen.getByRole("textbox", { name: /city/iu });
    await user.clear(city);
    await user.type(city, "Krakow");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[2].updateMask.paths).toEqual(["city"]);
    expect(onSubmit.mock.calls[0]?.[0].city).toBe("Krakow");
    expect(onSubmit.mock.calls[0]?.[0].$unknown).toEqual(source.$unknown);

    await user.clear(city);
    await user.type(city, "Gdansk");
    await user.clear(city);
    await user.type(city, "Krakow");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[1]?.[2].updateMask.paths).toEqual([]);
  });
});
