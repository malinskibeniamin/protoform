import { describe, expect, it } from "vitest";
import { shouldRunVisualRegression } from "./visual-regression-policy";

describe("visual regression platform policy", () => {
  it("runs the Darwin reference in CI and locally", () => {
    expect(shouldRunVisualRegression("darwin")).toBe(true);
  });

  it("skips platforms without a checked-in reference", () => {
    expect(shouldRunVisualRegression("linux")).toBe(false);
    expect(shouldRunVisualRegression("win32")).toBe(false);
  });
});
