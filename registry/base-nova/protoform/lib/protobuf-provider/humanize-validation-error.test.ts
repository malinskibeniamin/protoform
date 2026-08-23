import { describe, expect, it } from "@rstest/core";

import { humanizeServerFieldError, humanizeValidationError } from "./humanize-validation-error";

describe("humanizeServerFieldError", () => {
  it.each([
    ["value is required", "Enter a value."],
    ["must contain at least 1 item(s)", "Add at least one item."],
    ["value must contain at least 3 items", "Add at least 3 items."],
    ["", "Review this value and try again."],
    ["   ", "Review this value and try again."],
  ])("turns %j into actionable copy", (description, expected) => {
    expect(humanizeServerFieldError(description)).toBe(expected);
  });
});

describe("localized validation messages", () => {
  it("passes a stable code, parameters, and fallback to the host formatter", () => {
    const calls: unknown[][] = [];

    const message = humanizeValidationError("value length must be at least 3", (code, params, fallback) => {
      calls.push([code, params, fallback]);
      return `translated:${String(params["limit"])}`;
    });

    expect(message).toBe("translated:3");
    expect(calls).toEqual([["validation.min_length", { limit: 3 }, "Must be at least 3 characters."]]);
  });
});
