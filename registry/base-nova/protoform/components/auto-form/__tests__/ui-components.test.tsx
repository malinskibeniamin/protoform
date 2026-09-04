import { describe, expect } from "@rstest/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";

import { shadcnUIComponents } from "../shadcn-ui-components";
import { Button, ProtoformUIProvider } from "../ui-components";

function ConsumerButton({ children, ...props }: React.ComponentProps<"button">) {
  return (
    <button data-consumer-component="button" type="button" {...props}>
      {children}
    </button>
  );
}

describe("ProtoformUIProvider", () => {
  test("renders controls from the consumer component map", async () => {
    const user = userEvent.setup();
    let clicked = false;

    render(
      <ProtoformUIProvider components={{ ...shadcnUIComponents, Button: ConsumerButton }}>
        <Button
          onClick={() => {
            clicked = true;
          }}
        >
          Continue
        </Button>
      </ProtoformUIProvider>
    );

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toHaveAttribute("data-consumer-component", "button");

    await user.click(button);

    expect(clicked).toBe(true);
  });
});
