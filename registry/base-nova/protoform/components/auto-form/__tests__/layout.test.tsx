import { describe, expect } from "@rstest/core";
import { cleanup, render as renderWithTestingLibrary, screen } from "@testing-library/react";
import type React from "react";

import { formSpacing } from "../form-spacing";
import { FormField, FormLayout, FormSection, FormSubmit } from "../layout";
import { shadcnUIComponents } from "../shadcn-ui-components";
import { ProtoformUIProvider } from "../ui-components";

function render(children: React.ReactNode) {
  return renderWithTestingLibrary(
    <ProtoformUIProvider components={shadcnUIComponents}>{children}</ProtoformUIProvider>
  );
}

describe("FormLayout", () => {
  test("renders a form element with the form-spacing token and forwards native form props", () => {
    const handler = () => undefined;
    render(
      <FormLayout aria-label="Test form" onSubmit={handler} testId="form">
        <div>child</div>
      </FormLayout>
    );
    const form = screen.getByTestId("form");
    expect(form.tagName).toBe("FORM");
    expect(form.className).toContain(formSpacing.form);
    expect(form.getAttribute("aria-label")).toBe("Test form");
  });
});

describe("FormSection", () => {
  test("renders nested heading levels and the header description, required marker, and optional divider only when needed", () => {
    render(
      <FormLayout testId="form">
        <FormSection title="L1">
          <FormSection title="L2">
            <FormSection title="L3">
              <div>body</div>
            </FormSection>
          </FormSection>
        </FormSection>
      </FormLayout>
    );
    expect(screen.getByText("L1").tagName).toBe("H2");
    expect(screen.getByText("L2").tagName).toBe("H3");
    expect(screen.getByText("L3").tagName).toBe("H4");

    cleanup();
    render(
      <FormLayout>
        <FormSection description="AWS credentials and region." required testId="titled" title="Aws" />
        <FormSection divider={false} testId="undivided" title="Basic" />
        <FormSection testId="untitled">
          <div>body</div>
        </FormSection>
      </FormLayout>
    );
    const titled = screen.getByTestId("titled");
    expect(screen.getByText("AWS credentials and region.")).toBeVisible();
    expect(titled.textContent).toContain("*");
    expect((titled.firstElementChild as HTMLElement).className).toContain("border-b");
    expect((screen.getByTestId("undivided").firstElementChild as HTMLElement).className).not.toContain("border-b");

    const untitled = screen.getByTestId("untitled");
    expect(untitled.querySelector("h2, h3, h4, h5")).toBeNull();
    expect(untitled.textContent).toContain("body");
  });
});

describe("FormField", () => {
  test("renders label, control, and help text, replaces help with the error, and renders no trailing text without either", () => {
    render(
      <FormField helpText="Your full name" htmlFor="name" label="Name" testId="field">
        <input id="name" />
      </FormField>
    );
    const field = screen.getByTestId("field");
    expect(field.className).toContain(formSpacing.labelStack);
    expect(screen.getByText("Name").closest("label")?.getAttribute("for")).toBe("name");
    expect(screen.getByText("Your full name")).toBeVisible();

    cleanup();
    const { rerender } = render(
      <FormField error="Required" helpText="Your full name" label="Name" testId="fieldError">
        <input id="name" />
      </FormField>
    );
    expect(screen.getByText("Required")).toBeVisible();
    expect(screen.queryByText("Your full name")).not.toBeInTheDocument();

    rerender(
      <ProtoformUIProvider components={shadcnUIComponents}>
        <FormField label="Name" testId="fieldError">
          <input id="name" />
        </FormField>
      </ProtoformUIProvider>
    );
    const fieldError = screen.getByTestId("fieldError");
    expect(fieldError.querySelectorAll("span.text-muted-foreground, span.text-destructive")).toHaveLength(0);
  });
});

describe("FormSubmit", () => {
  test('renders a submit-typed button that defaults to "Submit"', () => {
    const { rerender } = render(<FormSubmit testId="submit">Save</FormSubmit>);
    const button = screen.getByTestId("submit");
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("submit");
    expect(button.textContent).toBe("Save");

    rerender(
      <ProtoformUIProvider components={shadcnUIComponents}>
        <FormSubmit testId="submit" />
      </ProtoformUIProvider>
    );
    expect(screen.getByTestId("submit").textContent).toBe("Submit");
  });
});
