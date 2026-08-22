import { describe, expect, rs } from "@rstest/core";
import { render, screen } from "@testing-library/react";

import { JSONField } from ".";

describe("JSONField accessibility", () => {
  test("labels the fallback editor for deeply nested JSON", () => {
    render(
      <JSONField
        maxDepth={1}
        onChange={rs.fn()}
        schema={{
          properties: {
            audit: {
              properties: { retentionDays: { type: "number" } },
              type: "object",
            },
          },
          type: "object",
        }}
        value={{ audit: { retentionDays: 30 } }}
      />
    );

    expect(screen.getByRole("textbox", { name: "Audit JSON" })).toBeVisible();
  });

  test("opens an unconstrained array in JSON mode", async () => {
    render(<JSONField onChange={rs.fn()} schema={{ type: "array" }} value={["overview", 3, true]} />);

    expect(await screen.findByRole("textbox", { name: "JSON value" })).toHaveValue('[\n  "overview",\n  3,\n  true\n]');
  });
});
