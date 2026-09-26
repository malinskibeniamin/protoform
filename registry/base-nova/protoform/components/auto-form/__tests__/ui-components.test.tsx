import { describe, expect, rs } from "@rstest/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";

import { AutoForm } from "../host";
import { shadcnUIComponents } from "../shadcn-ui-components";
import { Button, Input, ProtoformUIProvider } from "../ui-components";
import { createMockProvider } from "./test-utils";

function ConsumerButton({ children, ...props }: React.ComponentProps<"button">) {
  return (
    <button data-consumer-component="button" type="button" {...props}>
      {children}
    </button>
  );
}

describe("ProtoformUIProvider", () => {
  test("shows a missing host control without requiring Alert and recovers when supplied", () => {
    const schema = createMockProvider([{ key: "title", required: true, type: "string" }]);
    const { Input: _input, Alert: _alert, ...incomplete } = shadcnUIComponents;
    const onCaughtError = rs.fn();
    const view = render(<AutoForm components={incomplete} modes={["simple"]} schema={schema} showSummary={false} />, {
      onCaughtError,
    });
    expect(screen.getByRole("alert")).toHaveTextContent('Protoform requires the "Input" component');
    view.rerender(
      <AutoForm components={{ ...incomplete, Input: "input" }} modes={["simple"]} schema={schema} showSummary={false} />
    );
    expect(screen.getByRole("textbox", { name: "Title *" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("renders consumer controls, translates test IDs, and names a missing control", async () => {
    const user = userEvent.setup();
    const onClick = rs.fn();

    render(
      <ProtoformUIProvider components={{ Button: ConsumerButton, Input: "input" }}>
        <Input aria-label="Title" testId="title-control" />
        <Button onClick={onClick}>Continue</Button>
      </ProtoformUIProvider>
    );
    expect(screen.getByRole("textbox", { name: "Title" })).toHaveAttribute("data-testid", "title-control");
    expect(screen.getByRole("textbox")).not.toHaveAttribute("testId");
    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toHaveAttribute("data-consumer-component", "button");
    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();

    expect(() =>
      render(
        <ProtoformUIProvider components={{}}>
          <Input />
        </ProtoformUIProvider>
      )
    ).toThrow('Protoform requires the "Input" component. Supply it through AutoForm components.');
  });
});
