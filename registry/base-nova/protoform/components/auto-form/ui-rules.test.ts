import { describe, expect } from "@rstest/core";

import { evaluateUiRules } from "./ui-rules";

const readyRule = {
  expression: "form.enabled && this == 'ready'",
  id: "ui.ready",
  message: "Ready state is required.",
};

describe("AutoForm UI CEL profile", () => {
  test("exposes only form and current-field values to UI expressions", () => {
    expect(
      evaluateUiRules([readyRule], {
        form: { enabled: true },
        thisValue: "ready",
      })
    ).toBe(true);
    expect(
      evaluateUiRules([readyRule], {
        form: { enabled: false },
        thisValue: "ready",
      })
    ).toBe(false);
  });

  test("fails closed for malformed, unknown, erroring, and non-boolean rules", () => {
    const context = { form: {}, thisValue: undefined };
    const expressions = ["(", "unknown_name", "1 / 0", "'visible'"];

    for (const expression of expressions) {
      expect(evaluateUiRules([{ expression, id: `ui.${expression}`, message: "" }], context)).toBe(false);
    }
  });

  test("reuses a compiled expression with changing form contexts", () => {
    expect(
      evaluateUiRules([readyRule], {
        form: { enabled: true },
        thisValue: "ready",
      })
    ).toBe(true);
    expect(
      evaluateUiRules([readyRule], {
        form: { enabled: true },
        thisValue: "waiting",
      })
    ).toBe(false);
  });
});
