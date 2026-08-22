import { describe, expect, it } from "@rstest/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutoForm } from "..";
import { createMockProvider } from "./test-utils";

describe("AutoForm – regex error augmentation", () => {
  it("appends example to regex validation errors when field has example configured", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([{ key: "resourceId", required: true, type: "string" }], {}, (values) => {
      const value = values["resourceId"];
      const resourceId = typeof value === "string" ? value : "";
      if (!/^[a-f0-9-]{36}$/.test(resourceId)) {
        return {
          errors: [{ message: "Must match regex pattern `^[a-f0-9-]{36}$`", path: ["resourceId"] }],
          success: false,
        };
      }
      return { data: values, success: true };
    });

    render(
      <AutoForm
        defaultValues={{ resourceId: "bad" }}
        fieldConfig={{
          resourceId: {
            customData: { example: "123e4567-e89b-12d3-a456-426614174000" },
          },
        }}
        formOptions={{ mode: "all" }}
        schema={schema}
        withSubmit
      />
    );

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      const errorEl = screen.getByText(/example: 123e4567/i);
      expect(errorEl).toBeInTheDocument();
    });
  });

  it("passes non-regex errors through unchanged", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([{ key: "name", required: true, type: "string" }], {}, (values) => {
      const value = values["name"];
      const name = typeof value === "string" ? value : "";
      if (name.length < 5) {
        return {
          errors: [{ message: "Must be at least 5 characters", path: ["name"] }],
          success: false,
        };
      }
      return { data: values, success: true };
    });

    render(
      <AutoForm
        defaultValues={{ name: "ab" }}
        fieldConfig={{
          name: {
            customData: { example: "protoform" },
          },
        }}
        formOptions={{ mode: "all" }}
        schema={schema}
        withSubmit
      />
    );

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/must be at least 5 characters/i)).toBeInTheDocument();
    });

    // The example should NOT be appended to non-regex errors
    expect(screen.queryByText(/example: protoform/i)).not.toBeInTheDocument();
  });

  it("passes regex errors through unchanged when no example is configured", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([{ key: "code", required: true, type: "string" }], {}, (values) => {
      const value = values["code"];
      const code = typeof value === "string" ? value : "";
      if (!/^[A-Z]{3}$/.test(code)) {
        return {
          errors: [{ message: "Must match regex pattern `^[A-Z]{3}$`", path: ["code"] }],
          success: false,
        };
      }
      return { data: values, success: true };
    });

    render(<AutoForm defaultValues={{ code: "bad" }} formOptions={{ mode: "all" }} schema={schema} withSubmit />);

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/must match regex pattern/i)).toBeInTheDocument();
    });

    // No example text should appear since none was configured
    expect(screen.queryByText(/example:/i)).not.toBeInTheDocument();
  });
});
