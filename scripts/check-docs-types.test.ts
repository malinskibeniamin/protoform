import { describe, expect, test } from "vitest";
import { parseDocsDiagnosticSummary } from "./check-docs-types";

describe("documentation typecheck diagnostics", () => {
  test.each([
    ["clean", "Result (404 files):\n- 0 errors\n- 0 warnings\n- 0 hints", { errors: 0, hints: 0, warnings: 0 }],
    ["warning", "Result (404 files):\n- 0 errors\n- 1 warning\n- 0 hints", { errors: 0, hints: 0, warnings: 1 }],
    ["hint", "Result (404 files):\n- 0 errors\n- 0 warnings\n- 18 hints", { errors: 0, hints: 18, warnings: 0 }],
  ])("parses a %s summary", (_name, output, expected) => {
    expect(parseDocsDiagnosticSummary(output)).toEqual(expected);
  });

  test("rejects output without a complete summary", () => {
    expect(parseDocsDiagnosticSummary("No type errors.")).toBeNull();
  });
});
