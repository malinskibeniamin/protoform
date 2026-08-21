import { describe, expect, it, rs } from "@rstest/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutoForm } from "..";
import { createMockProvider } from "./test-utils";

describe("AutoForm – onFieldChange callback", () => {
  it("calls onFieldChange when a field value changes", async () => {
    const user = userEvent.setup();
    const onFieldChange = rs.fn();
    const schema = createMockProvider([
      { key: "name", required: true, type: "string" },
      { key: "email", required: true, type: "string" },
    ]);

    render(
      <AutoForm
        defaultValues={{ email: "", name: "test" }}
        onFieldChange={onFieldChange}
        schema={schema}
        testId="fieldchange"
        withSubmit
      />
    );

    const nameInput = screen.getByDisplayValue("test");
    await user.clear(nameInput);
    await user.type(nameInput, "hello");

    await waitFor(() => {
      expect(onFieldChange).toHaveBeenCalledWith("name", expect.anything(), expect.anything());
    });

    // Verify the latest call includes the new value
    const nameCalls = onFieldChange.mock.calls.filter((args: unknown[]) => args[0] === "name");
    expect(nameCalls.length).toBeGreaterThan(0);
    const lastCall = nameCalls.at(-1);
    if (!lastCall) {
      throw new Error("Expected a name field change callback.");
    }
    expect(lastCall[1]).toBe("hello");
  });
});
