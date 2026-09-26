import { describe, expect } from "@rstest/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { Input as BundledInput } from "@/components/ui/input";

import { AutoFormContext, type AutoFormContextValue } from "../context";
import type { ParsedField } from "../core-types";
import { ArrayElementWrapper, ArrayWrapper, FieldWrapper, Form, ObjectWrapper } from "../field-wrapper";
import { formSpacing } from "../form-spacing";
import { shadcnUIComponents } from "../shadcn-ui-components";
import { Input, ProtoformUIProvider } from "../ui-components";

/**
 * Minimal AutoForm context wrapper — just enough for field-wrapper to render.
 * Most of its reads (testIdPrefix, getFieldUiConfig) have simple fallbacks.
 */
function withAutoFormContext(children: React.ReactNode) {
  const value: AutoFormContextValue = {
    deprecatedFields: "show",
    evaluateRules: () => true,
    formComponents: {} as AutoFormContextValue["formComponents"],
    formValues: {},
    getFieldUiConfig: () => ({}),
    testIdPrefix: "test",
    uiComponents: {} as AutoFormContextValue["uiComponents"],
  };
  return (
    <ProtoformUIProvider components={shadcnUIComponents}>
      <AutoFormContext.Provider value={value}>{children}</AutoFormContext.Provider>
    </ProtoformUIProvider>
  );
}

function makeField(partial: Partial<ParsedField> = {}): ParsedField {
  return {
    fieldConfig: {},
    key: "example",
    required: false,
    type: "string",
    ...partial,
  } as ParsedField;
}

describe("ObjectWrapper", () => {
  test("toggles a collapsible section through the Protoform button", async () => {
    const user = userEvent.setup();
    render(
      withAutoFormContext(
        <Form>
          <ObjectWrapper
            field={makeField({ fieldConfig: { customData: { collapsible: true } } })}
            label="Advanced"
            testId="section"
          >
            <div>Advanced fields</div>
          </ObjectWrapper>
        </Form>
      )
    );

    const trigger = screen.getByRole("button", { name: /advanced/iu });
    expect(screen.queryByText("Advanced fields")).toBeNull();

    await user.click(trigger);

    expect(screen.getByText("Advanced fields")).toBeVisible();
  });

  test("opens a collapsible section with errors and keeps it open once they clear", async () => {
    const section = (hasError: boolean) =>
      withAutoFormContext(
        <Form>
          <ObjectWrapper
            field={makeField({ fieldConfig: { customData: { collapsible: true } } })}
            hasError={hasError}
            label="Advanced"
            testId="section"
          >
            <div>Advanced fields</div>
          </ObjectWrapper>
        </Form>
      );
    const view = render(section(false));
    expect(screen.queryByText("Advanced fields")).toBeNull();

    view.rerender(section(true));
    await waitFor(() => expect(screen.getByText("Advanced fields")).toBeVisible());

    view.rerender(section(false));
    await waitFor(() => expect(screen.getByText("Advanced fields")).toBeVisible());
  });

  test("uses nested heading levels and label rails, spacing tokens, and dividers only under visible labels", () => {
    render(
      withAutoFormContext(
        <Form testId="form">
          <ObjectWrapper field={makeField({ key: "outer" })} label="Outer" testId="outer">
            <ObjectWrapper field={makeField({ key: "inner" })} label="Inner" testId="inner">
              <div>body</div>
            </ObjectWrapper>
          </ObjectWrapper>
          <ObjectWrapper field={makeField()} label="Basic" testId="labelled">
            <div data-testid="body-child">body</div>
          </ObjectWrapper>
          <ObjectWrapper field={makeField()} label="" testId="unlabelled">
            <div>body</div>
          </ObjectWrapper>
          <ObjectWrapper
            field={makeField({ fieldConfig: { customData: { showDivider: false } } })}
            label="No Rule"
            testId="undivided"
          >
            <div>body</div>
          </ObjectWrapper>
        </Form>
      )
    );
    const firstChild = (testId: string) => screen.getByTestId(testId).firstElementChild as HTMLElement;

    // Root sections use h2 and a split label rail; nested sections use h3 and a stacked rail.
    expect(screen.getByText("Outer").tagName).toBe("H2");
    expect(screen.getByText("Inner").tagName).toBe("H3");
    expect(screen.getByTestId("outer")).toHaveAttribute("data-layout", "split");
    expect(screen.getByTestId("inner")).toHaveAttribute("data-layout", "stacked");

    expect(screen.getByTestId("form").className).toContain(formSpacing.form);
    expect((screen.getByTestId("body-child").parentElement as HTMLElement).className).toContain(formSpacing.field);
    expect(firstChild("labelled").className).toContain("border-b");
    // Without a visible label, no header is rendered — first child is the body wrapper.
    expect(firstChild("unlabelled").className).not.toContain("border-b");
    // The header still renders but drops the divider — parity with FormSection's `divider={false}`.
    expect(screen.getByText("No Rule")).toBeVisible();
    expect(firstChild("undivided").className).not.toContain("border-b");
  });
});

describe("FieldWrapper", () => {
  test("preserves caller descriptions and isolates error links between fields", () => {
    const renderFields = (error?: string) =>
      withAutoFormContext(
        <Form>
          <span id="hint">Use your display name.</span>
          <FieldWrapper error={error} field={makeField()} id="name" label="Name">
            <Input aria-describedby="hint" id="name" />
          </FieldWrapper>
          <FieldWrapper error="Enter a code" field={makeField()} id="code" label="Code">
            <BundledInput id="code" />
          </FieldWrapper>
        </Form>
      );
    const { rerender } = render(renderFields("Enter a name"));
    const name = screen.getByRole("textbox", { name: "Name" });
    const code = screen.getByRole("textbox", { name: "Code" });
    expect(name).toHaveAccessibleDescription("Use your display name. Enter a name");
    expect(code).toHaveAccessibleDescription("Enter a code");
    rerender(renderFields());
    expect(name).toHaveAccessibleDescription("Use your display name.");
    expect(name).toHaveAttribute("aria-describedby", "hint");
    expect(code).toHaveAccessibleDescription("Enter a code");
  });

  test("renders field help as a named shadcn button in a responsive label rail", () => {
    render(
      withAutoFormContext(
        <Form>
          <FieldWrapper
            field={makeField({
              fieldConfig: {
                customData: {
                  description: "Shown to other workspace members.",
                  help: "Use the name people will recognize.",
                },
              },
              key: "name",
            })}
            id="name"
            label="Name"
          >
            <input id="name" />
          </FieldWrapper>
          <FieldWrapper
            field={makeField({
              fieldConfig: { customData: { help: "Choose between 1 and 12 replicas." } },
              key: "replicas",
            })}
            id="replicas"
            label="Replicas"
          >
            <input id="replicas" />
          </FieldWrapper>
        </Form>
      )
    );

    const helpButton = screen.getByRole("button", { name: "Help for Name" });
    expect(helpButton.className).toContain("focus-visible:ring-3");
    expect(helpButton.querySelector("svg")).toHaveAttribute("fill", "none");
    expect(screen.getByTestId("test-field-name")).toHaveAttribute("data-layout", "split");
    // Help-only annotations stay in the tooltip instead of duplicating inline.
    expect(screen.getByRole("button", { name: "Help for Replicas" })).toBeVisible();
    expect(screen.queryByText("Choose between 1 and 12 replicas.")).not.toBeInTheDocument();
  });
});

describe("ArrayWrapper", () => {
  test("renders with the field-spacing token and an add button, and contains complex items in native cards", () => {
    const { unmount } = render(
      withAutoFormContext(
        <ArrayWrapper field={makeField()} label="Seed Brokers" onAddItem={() => undefined} testId="array">
          <div>item</div>
        </ArrayWrapper>
      )
    );
    expect(screen.getByTestId("array").className).toContain(formSpacing.field);
    expect(screen.getByRole("button", { name: /add seed brokers/iu })).toBeVisible();
    unmount();

    render(
      <ProtoformUIProvider components={shadcnUIComponents}>
        <ArrayElementWrapper index={0} onRemove={() => undefined} testId="item-0">
          first
        </ArrayElementWrapper>
        <ArrayElementWrapper index={1} onRemove={() => undefined} testId="item-1">
          second
        </ArrayElementWrapper>
      </ProtoformUIProvider>
    );
    const first = screen.getByTestId("item-0");
    const second = screen.getByTestId("item-1");
    expect(first.className).toContain("rounded-xl");
    expect(first.className).toContain("border");
    expect(second.className).toContain("rounded-xl");
    expect(second.className).not.toContain("border-t");
    expect(screen.getAllByRole("button", { name: "Remove item" })[0]?.className).toContain("hover:bg-muted");
  });
});
