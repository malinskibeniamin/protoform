import { describe, expect } from "@rstest/core";

import { humanizeServerFieldError } from "./humanize-validation-error";

describe("humanizeServerFieldError", () => {
  test.each([
    ["value is required", "Enter a value."],
    ["must contain at least 1 item(s)", "Add at least one item."],
    ["value must contain at least 3 items", "Add at least 3 items."],
    ["", "Review this value and try again."],
    ["   ", "Review this value and try again."],
  ])("turns %j into actionable copy", (description, expected) => {
    expect(humanizeServerFieldError(description)).toBe(expected);
  });
});
