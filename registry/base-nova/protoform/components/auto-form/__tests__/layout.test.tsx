import { describe, expect, it } from "@rstest/core";
import { render, screen } from "@testing-library/react";

import { formSpacing } from "../form-spacing";
import { FormField, FormLayout, FormSection, FormSubmit } from "../layout";

describe("FormLayout", () => {
  it("renders as a form element with the form-spacing token", () => {
    render(
      <FormLayout testId="form">
        <div>child</div>
      </FormLayout>
    );
    const form = screen.getByTestId("form");
    expect(form.tagName).toBe("FORM");
    expect(form.className).toContain(formSpacing.form);
  });

  it("forwards native form props", () => {
    const handler = () => undefined;
    render(
      <FormLayout aria-label="Test form" onSubmit={handler} testId="form">
        <div>child</div>
      </FormLayout>
    );
    const form = screen.getByTestId("form");
    expect(form.getAttribute("aria-label")).toBe("Test form");
  });
});

describe("FormSection", () => {
  it("at the form root renders the title as an h2", () => {
    render(
      <FormLayout testId="form">
        <FormSection title="Basic">
          <div>body</div>
        </FormSection>
      </FormLayout>
    );
    const heading = screen.getByText("Basic");
    expect(heading.tagName).toBe("H2");
  });

  it("nested one level deep renders the title as an h3", () => {
    render(
      <FormLayout testId="form">
        <FormSection title="Outer">
          <FormSection title="Inner">
            <div>body</div>
          </FormSection>
        </FormSection>
      </FormLayout>
    );
    expect(screen.getByText("Outer").tagName).toBe("H2");
    expect(screen.getByText("Inner").tagName).toBe("H3");
  });

  it("nested two levels deep renders the title as an h4", () => {
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
    expect(screen.getByText("L3").tagName).toBe("H4");
  });

  it("with no title and no description renders no header", () => {
    const { container } = render(
      <FormLayout>
        <FormSection testId="section">
          <div>body</div>
        </FormSection>
      </FormLayout>
    );
    const section = screen.getByTestId("section");
    expect(section.querySelector("h2, h3, h4, h5")).toBeNull();
    expect(section.textContent).toContain("body");
    expect(container).toBeTruthy();
  });

  it("shows the divider by default when a title is present", () => {
    render(
      <FormLayout>
        <FormSection testId="section" title="Basic" />
      </FormLayout>
    );
    const section = screen.getByTestId("section");
    const header = section.firstElementChild as HTMLElement;
    expect(header.className).toContain("border-b");
  });

  it("suppresses the divider when divider={false}", () => {
    render(
      <FormLayout>
        <FormSection divider={false} testId="section" title="Basic" />
      </FormLayout>
    );
    const section = screen.getByTestId("section");
    const header = section.firstElementChild as HTMLElement;
    expect(header.className).not.toContain("border-b");
  });

  it("renders a description when provided", () => {
    render(
      <FormLayout>
        <FormSection description="AWS credentials and region." title="Aws" />
      </FormLayout>
    );
    expect(screen.getByText("AWS credentials and region.")).toBeInTheDocument();
  });

  it("marks the heading as required with an asterisk when required", () => {
    render(
      <FormLayout>
        <FormSection required testId="section" title="Basic" />
      </FormLayout>
    );
    const section = screen.getByTestId("section");
    expect(section.textContent).toContain("*");
  });
});

describe("FormField", () => {
  it("renders label, control, and help text with the label-stack token", () => {
    render(
      <FormField helpText="Your full name" label="Name" testId="field">
        <input id="name" />
      </FormField>
    );
    const field = screen.getByTestId("field");
    expect(field.className).toContain(formSpacing.labelStack);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Your full name")).toBeInTheDocument();
  });

  it("renders error and suppresses help text when both are provided", () => {
    render(
      <FormField error="Required" helpText="Your full name" label="Name" testId="field">
        <input id="name" />
      </FormField>
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.queryByText("Your full name")).not.toBeInTheDocument();
  });

  it("renders no trailing text when neither error nor helpText is provided", () => {
    render(
      <FormField label="Name" testId="field">
        <input id="name" />
      </FormField>
    );
    const field = screen.getByTestId("field");
    // Label + input only — no help/error text nodes.
    const spans = field.querySelectorAll("span.text-muted-foreground, span.text-destructive");
    // The required asterisk is not present either.
    expect(spans.length).toBe(0);
  });

  it("attaches htmlFor to the label for accessibility", () => {
    render(
      <FormField htmlFor="name-input" label="Name" testId="field">
        <input id="name-input" />
      </FormField>
    );
    const label = screen.getByText("Name").closest("label");
    expect(label).not.toBeNull();
    expect(label?.getAttribute("for")).toBe("name-input");
  });
});

describe("FormSubmit", () => {
  it("renders a submit-typed button by default", () => {
    render(<FormSubmit testId="submit">Save</FormSubmit>);
    const button = screen.getByTestId("submit");
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("submit");
    expect(button.textContent).toBe("Save");
  });

  it('defaults to "Submit" when no children are provided', () => {
    render(<FormSubmit testId="submit" />);
    expect(screen.getByTestId("submit").textContent).toBe("Submit");
  });
});
