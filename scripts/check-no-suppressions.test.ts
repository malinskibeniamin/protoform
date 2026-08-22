import { describe, expect, test } from "@rstest/core";
import { findForbiddenDirectives } from "./check-no-suppressions";

const forbiddenDirectiveCases = [
  ["biome", "ignore"].join("-"),
  ["eslint", "disable"].join("-"),
  ["oxlint", "disable"].join("-"),
  ["prettier", "ignore"].join("-"),
  ["@ts", "expect-error"].join("-"),
  ["@ts", "ignore"].join("-"),
  ["@ts", "nocheck"].join("-"),
];

describe("inline suppression policy", () => {
  test.each(forbiddenDirectiveCases)("rejects %s", (directive) => {
    expect(findForbiddenDirectives(`// ${directive}`)).toEqual([directive]);
  });

  test("accepts ordinary comments", () => {
    expect(findForbiddenDirectives("// Explain why this branch exists.")).toEqual([]);
  });
});
