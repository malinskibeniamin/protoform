// @vitest-environment node

import { describe, expect, it } from "vitest";

import { compileCelExpression } from "../registry/base-nova/protoform/components/auto-form/cel-runtime.js";

describe("CEL guarded runtime conformance", () => {
  it("propagates partial unknown attributes separately from evaluation errors", () => {
    const evaluate = compileCelExpression("form.enabled && form.restricted_region == 'eu-central1'", {
      unknownAttributes: ["form.restricted_region"],
    });

    expect(
      evaluate({
        form: { enabled: true, restrictedRegion: "redacted" },
      })
    ).toMatchObject({
      attributes: ["form.restricted_region"],
      kind: "unknown",
    });
    expect(
      evaluate({
        form: { enabled: false, restrictedRegion: "redacted" },
      })
    ).toMatchObject({ kind: "value", value: false });

    const error = compileCelExpression("1 / 0")();
    expect(error).toMatchObject({ kind: "error" });
    expect(error).not.toHaveProperty("attributes");
  });

  it("merges unknown sets and preserves logical short circuit", () => {
    const evaluate = compileCelExpression("form.primary == 'ready' || form['backup-region'] == 'eu-west1'", {
      unknownAttributes: ["form.primary", 'form["backup-region"]'],
    });

    expect(evaluate({ form: {} })).toMatchObject({
      attributes: ["form.primary", 'form["backup-region"]'],
      kind: "unknown",
    });
    expect(
      compileCelExpression("true || form.primary == 'ready'", {
        unknownAttributes: ["form.primary"],
      })({ form: {} })
    ).toMatchObject({ kind: "value", value: true });
    expect(
      compileCelExpression("false && form.primary == 'ready'", {
        unknownAttributes: ["form.primary"],
      })({ form: {} })
    ).toMatchObject({ kind: "value", value: false });
  });

  it("enforces a configurable execution budget and fails safely", () => {
    const withinBudget = compileCelExpression("[1, 2, 3].all(value, value > 0)", {
      maxCost: 100,
    });
    expect(withinBudget()).toMatchObject({ kind: "value", value: true });

    const overBudget = compileCelExpression("[1, 2, 3].all(value, value > 0)", {
      maxCost: 2,
    });
    expect(() => overBudget()).not.toThrow();
    expect(overBudget()).toEqual({
      cost: 3,
      kind: "cost-exceeded",
      limit: 2,
    });

    const repeatedWork = compileCelExpression("form.items.all(item, item > 0.0)", { maxCost: 100 });
    const oneItem = repeatedWork({ form: { items: [1] } });
    const threeItems = repeatedWork({ form: { items: [1, 2, 3] } });
    expect(threeItems.cost).toBeGreaterThan(oneItem.cost);
  });
});
