import { describe, expect } from "@rstest/core";
import { render, screen } from "@testing-library/react";
import { AutoForm, defaultRegistry } from "..";
import { createMockProvider } from "./test-utils";

function GreetingCustomComponent() {
  return <div data-testid="custom-rendered">Custom!</div>;
}

function NestedCustomComponent() {
  return <div data-testid="nested-custom-rendered">Nested custom</div>;
}

describe("AutoForm – fieldRegistry prop wiring", () => {
  test("uses a custom fieldRegistry to resolve field components", () => {
    const customRegistry = defaultRegistry.clone().register({
      component: GreetingCustomComponent,
      match: (field) => field.key === "greeting",
      name: "code",
      priority: 9999,
    });

    const schema = createMockProvider([{ key: "greeting", required: true, type: "string" }]);

    render(
      <AutoForm fieldConfig={{ greeting: { fieldType: "code" } }} fieldRegistry={customRegistry} schema={schema} />
    );

    expect(screen.getByTestId("custom-rendered")).toBeInTheDocument();
  });

  test("renders custom field types inside nested messages", () => {
    const registry = defaultRegistry.clone().register({
      component: NestedCustomComponent,
      match: (field) => field.key === "source",
      name: "code",
      priority: 9999,
    });
    const schema = createMockProvider([
      {
        key: "settings",
        required: true,
        schema: [{ key: "source", required: true, type: "string" }],
        type: "object",
      },
    ]);

    render(
      <AutoForm
        fieldConfig={{ "settings.source": { fieldType: "code" } }}
        fieldRegistry={registry}
        formComponents={{ code: NestedCustomComponent }}
        schema={schema}
      />
    );

    expect(screen.getByTestId("nested-custom-rendered")).toBeInTheDocument();
  });

  test("shows a configuration error when a renderer has no component", () => {
    const schema = createMockProvider([{ key: "greeting", required: true, type: "string" }]);

    render(<AutoForm fieldConfig={{ greeting: { fieldType: "missing-renderer" } }} schema={schema} />);

    expect(screen.getByRole("alert")).toHaveTextContent('No component found for type "missing-renderer".');
  });
});
