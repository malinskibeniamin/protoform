import { describe, expect } from "@rstest/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutoForm } from "..";
import { createMockProvider } from "./test-utils";

describe("AutoForm – regex error augmentation", () => {
  test("appends the configured example only to regex validation errors", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider(
      [
        { key: "resourceId", required: true, type: "string" },
        { key: "name", required: true, type: "string" },
        { key: "code", required: true, type: "string" },
      ],
      {},
      () => ({
        errors: [
          { message: "Must match regex pattern `^[a-f0-9-]{36}$`", path: ["resourceId"] },
          { message: "Must be at least 5 characters", path: ["name"] },
          { message: "Must match regex pattern `^[A-Z]{3}$`", path: ["code"] },
        ],
        success: false,
      })
    );

    render(
      <AutoForm
        defaultValues={{ code: "bad", name: "ab", resourceId: "bad" }}
        fieldConfig={{
          name: { customData: { example: "protoform" } },
          resourceId: { customData: { example: "123e4567-e89b-12d3-a456-426614174000" } },
        }}
        formOptions={{ mode: "all" }}
        schema={schema}
        withSubmit
      />
    );

    await user.click(screen.getByRole("button", { name: /submit/iu }));

    await waitFor(() => {
      expect(screen.getByText(/example: 123e4567/iu)).toBeVisible();
    });
    // Non-regex errors and regex errors without a configured example pass through unchanged.
    expect(screen.getByText(/must be at least 5 characters/iu)).toBeVisible();
    expect(screen.queryByText(/example: protoform/iu)).not.toBeInTheDocument();
    expect(screen.getByText(/must match regex pattern `\^\[A-Z\]\{3\}\$`$/iu)).toBeVisible();
    expect(screen.getAllByText(/example:/iu)).toHaveLength(1);
  });
});
