import { describe, expect } from "@rstest/core";
import { render, screen } from "@testing-library/react";
import type React from "react";

import { AutoFormContext, type AutoFormContextValue } from "../context";
import type { ParsedField } from "../core-types";
import { ArrayElementWrapper, ArrayWrapper, FieldWrapper, Form, ObjectWrapper } from "../field-wrapper";
import { formSpacing } from "../form-spacing";

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
  return <AutoFormContext.Provider value={value}>{children}</AutoFormContext.Provider>;
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

describe("Form", () => {
  test("renders with the form spacing token", () => {
    render(
      <Form testId="form">
        <div>child</div>
      </Form>
    );
    const form = screen.getByTestId("form");
    expect(form.className).toContain(formSpacing.form);
  });
});

describe("ObjectWrapper", () => {
  test("uses a split label rail only for top-level sections", () => {
    render(
      withAutoFormContext(
        <Form>
          <ObjectWrapper field={makeField({ key: "outer" })} label="Outer" testId="outer">
            <ObjectWrapper field={makeField({ key: "inner" })} label="Inner" testId="inner">
              <div>body</div>
            </ObjectWrapper>
          </ObjectWrapper>
        </Form>
      )
    );

    expect(screen.getByTestId("outer")).toHaveAttribute("data-layout", "split");
    expect(screen.getByTestId("inner")).toHaveAttribute("data-layout", "stacked");
  });

  test("at the form root renders the title as an h2", () => {
    render(
      withAutoFormContext(
        <Form>
          <ObjectWrapper field={makeField({ key: "basic" })} label="Basic" testId="section">
            <div>body</div>
          </ObjectWrapper>
        </Form>
      )
    );
    expect(screen.getByText("Basic").tagName).toBe("H2");
  });

  test("nested one level deep renders the title as an h3", () => {
    render(
      withAutoFormContext(
        <Form>
          <ObjectWrapper field={makeField({ key: "outer" })} label="Outer" testId="outer">
            <ObjectWrapper field={makeField({ key: "inner" })} label="Inner" testId="inner">
              <div>body</div>
            </ObjectWrapper>
          </ObjectWrapper>
        </Form>
      )
    );
    expect(screen.getByText("Outer").tagName).toBe("H2");
    expect(screen.getByText("Inner").tagName).toBe("H3");
  });

  test("renders a divider under the heading when a label is present", () => {
    render(
      withAutoFormContext(
        <Form>
          <ObjectWrapper field={makeField()} label="Basic" testId="section">
            <div>body</div>
          </ObjectWrapper>
        </Form>
      )
    );
    const section = screen.getByTestId("section");
    const header = section.firstElementChild as HTMLElement;
    expect(header.className).toContain("border-b");
  });

  test("suppresses the divider when there is no visible label", () => {
    render(
      withAutoFormContext(
        <Form>
          <ObjectWrapper field={makeField()} label="" testId="section">
            <div>body</div>
          </ObjectWrapper>
        </Form>
      )
    );
    const section = screen.getByTestId("section");
    const firstChild = section.firstElementChild as HTMLElement;
    // Without a visible label, no header is rendered — first child is the body wrapper.
    expect(firstChild.className).not.toContain("border-b");
  });

  test("suppresses the divider when customData.showDivider is false", () => {
    render(
      withAutoFormContext(
        <Form>
          <ObjectWrapper
            field={makeField({ fieldConfig: { customData: { showDivider: false } } })}
            label="No Rule"
            testId="section"
          >
            <div>body</div>
          </ObjectWrapper>
        </Form>
      )
    );
    const section = screen.getByTestId("section");
    const header = section.firstElementChild as HTMLElement;
    // Header still renders (label visible) but the divider token is dropped —
    // parity with FormSection's `divider={false}` escape hatch.
    expect(header.className).not.toContain("border-b");
  });

  test("applies the field-spacing token to its children", () => {
    render(
      withAutoFormContext(
        <Form>
          <ObjectWrapper field={makeField()} label="Basic" testId="section">
            <div data-testid="body-child">body</div>
          </ObjectWrapper>
        </Form>
      )
    );
    const child = screen.getByTestId("body-child");
    const wrapper = child.parentElement as HTMLElement;
    expect(wrapper.className).toContain(formSpacing.field);
  });
});

describe("FieldWrapper", () => {
  test("uses a responsive label rail for a top-level field", () => {
    render(
      withAutoFormContext(
        <Form>
          <FieldWrapper field={makeField({ key: "name" })} id="name" label="Name">
            <input id="name" />
          </FieldWrapper>
        </Form>
      )
    );

    expect(screen.getByTestId("test-field-name")).toHaveAttribute("data-layout", "split");
  });

  test("renders field help as a named shadcn button with an outline question icon", () => {
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
        </Form>
      )
    );

    const helpButton = screen.getByRole("button", { name: "Help for Name" });
    expect(helpButton.className).toContain("focus-visible:ring-3");
    expect(helpButton.querySelector("svg")).toHaveAttribute("fill", "none");
  });

  test("keeps help-only annotations in a tooltip instead of duplicating them inline", () => {
    render(
      withAutoFormContext(
        <Form>
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

    expect(screen.getByRole("button", { name: "Help for Replicas" })).toBeInTheDocument();
    expect(screen.queryByText("Choose between 1 and 12 replicas.")).not.toBeInTheDocument();
  });
});

describe("ArrayWrapper", () => {
  test("renders with the field-spacing token and an add button", () => {
    render(
      withAutoFormContext(
        <ArrayWrapper field={makeField()} label="Seed Brokers" onAddItem={() => undefined} testId="array">
          <div>item</div>
        </ArrayWrapper>
      )
    );
    const wrapper = screen.getByTestId("array");
    expect(wrapper.className).toContain(formSpacing.field);
    expect(screen.getByRole("button", { name: /add seed brokers/iu })).toBeInTheDocument();
  });
});

describe("ArrayElementWrapper", () => {
  test("contains each complex repeated item in a distinct native card", () => {
    render(
      <>
        <ArrayElementWrapper index={0} onRemove={() => undefined} testId="item-0">
          first
        </ArrayElementWrapper>
        <ArrayElementWrapper index={1} onRemove={() => undefined} testId="item-1">
          second
        </ArrayElementWrapper>
      </>
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
