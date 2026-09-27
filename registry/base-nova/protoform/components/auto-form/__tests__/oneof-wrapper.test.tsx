import { describe, expect, rs } from "@rstest/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AutoForm, type OneofWrapperProps } from "..";
import { createMockProvider } from "./test-utils";

function VariantButtons({ disabled, label, onSelect, renderVariant, selected, variants }: OneofWrapperProps) {
  return (
    <fieldset aria-label={label} disabled={disabled}>
      {variants.map((variant) => (
        <button
          aria-pressed={variant.key === selected?.key}
          disabled={variant.disabled}
          key={variant.key}
          onClick={() => onSelect(variant.key)}
          type="button"
        >
          {variant.label}
        </button>
      ))}
      <button onClick={() => onSelect(undefined)} type="button">
        Clear
      </button>
      {selected ? renderVariant(selected) : null}
    </fieldset>
  );
}

const schema = createMockProvider(
  [
    {
      fieldConfig: { label: "Contact" },
      key: "contact",
      required: false,
      schema: [
        { fieldConfig: { label: "Email" }, key: "email", required: false, type: "string" },
        { fieldConfig: { label: "Phone" }, key: "phone", required: false, type: "string" },
      ],
      type: "oneof",
    },
  ],
  { contact: { case: undefined, value: undefined } }
);

describe("OneofWrapper", () => {
  test("replaces the variant picker while Protoform owns selection and variant rendering", async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();

    render(<AutoForm onSubmit={onSubmit} schema={schema} uiComponents={{ OneofWrapper: VariantButtons }} withSubmit />);

    expect(screen.queryByRole("combobox")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Phone" }));
    expect(screen.getByRole("button", { name: "Phone" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("textbox", { name: /Phone/u }));
    await user.paste("555 0100");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ contact: { case: "phone", value: "555 0100" } });
  });

  test("clears the selection through onSelect", async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();

    render(<AutoForm onSubmit={onSubmit} schema={schema} uiComponents={{ OneofWrapper: VariantButtons }} withSubmit />);

    await user.click(screen.getByRole("button", { name: "Email" }));
    expect(screen.getByRole("textbox", { name: /Email/u })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.queryByRole("textbox", { name: /Email/u })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ contact: { case: undefined } });
  });
});
