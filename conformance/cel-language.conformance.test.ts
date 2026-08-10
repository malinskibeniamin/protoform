// @vitest-environment node

import { CelScalar, celEnv, isCelError, parse, plan, run } from "@bufbuild/cel";
import { describe, expect, it } from "vitest";

function expectCelTrue(expression: string): void {
  expect(run(expression)).toBe(true);
}

describe("CEL language conformance", () => {
  it("supports CEL syntax, literals, scalar types, operators, and conversions", () => {
    expectCelTrue(`
      true && null == null &&
      1 + 2 * 3 == 7 &&
      7u > 1u &&
      1.5 * 2.0 == 3.0 &&
      int('42') == 42 &&
      uint('7') == 7u &&
      double('1.5') == 1.5 &&
      string(42) == '42' &&
      type(1) == int
    `);
  });

  it("supports lists, maps, and every standard comprehension macro", () => {
    expectCelTrue(`
      [1, 2, 3].all(value, value > 0) &&
      [1, 2, 3].exists(value, value == 2) &&
      [1, 2, 3].exists_one(value, value == 2) &&
      [1, 2, 3].filter(value, value > 1) == [2, 3] &&
      [1, 2].map(value, value * 2) == [2, 4] &&
      'owner' in {'owner': 'ada'} &&
      {'owner': 'ada'}.owner == 'ada'
    `);
  });

  it("supports string and bytes operations", () => {
    expectCelTrue(`
      'protoform'.startsWith('proto') &&
      'protoform'.endsWith('form') &&
      'protoform'.contains('tofo') &&
      'protoform'.matches('^[a-z]+$') &&
      'protoform'.size() == 9 &&
      b'proto'.size() == 5
    `);
  });

  it("uses RE2 semantics for string matching", () => {
    expect(run("'protoform'.matches('^proto.*$')")).toBe(true);
    expect(isCelError(run("'ab'.matches('a(?=b)')"))).toBe(true);
  });

  it("supports timestamp and duration construction, comparison, and arithmetic", () => {
    expectCelTrue(`
      duration('90s') > duration('60s') &&
      timestamp('2025-01-01T00:00:00Z') + duration('3600s') ==
        timestamp('2025-01-01T01:00:00Z') &&
      timestamp('2025-01-01T00:00:00Z').getFullYear() == 2025
    `);
  });

  it("propagates errors while preserving logical short circuit behavior", () => {
    expect(run("false && (1 / 0 > 0)")).toBe(false);
    expect(run("true || (1 / 0 > 0)")).toBe(true);
    expect(isCelError(run("1 / 0"))).toBe(true);
    expect(isCelError(run("missing_attribute == 1"))).toBe(true);
  });

  it("parses once and reuses a planned expression across evaluations", () => {
    const env = celEnv({ variables: { value: CelScalar.INT } });
    const evaluate = plan(env, parse("value * 2"));

    expect(evaluate({ value: 2n })).toBe(4n);
    expect(evaluate({ value: 7n })).toBe(14n);
  });

  it("meets the CEL minimum expression nesting and repetition limits", () => {
    expectCelTrue(Array.from({ length: 32 }, () => "true").join(" && "));

    const nested = `${"int(".repeat(12)}1${")".repeat(12)} == 1`;
    expectCelTrue(nested);
  });

  it("returns safe errors instead of throwing for invalid runtime inputs", () => {
    expect(() => run("1 / 0")).not.toThrow();
    expect(() => run("unknown_name")).not.toThrow();
    expect(isCelError(run("1 / 0"))).toBe(true);
    expect(isCelError(run("unknown_name"))).toBe(true);
  });
});
