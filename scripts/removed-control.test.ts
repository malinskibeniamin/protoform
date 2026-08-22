import { readdirSync, readFileSync } from "node:fs";
import { extname } from "node:path";
import { describe, expect } from "@rstest/core";

const repositoryDirectory = new URL("../", import.meta.url);
const excludedDirectories = new Set([
  ".blume",
  ".blume-verify",
  ".context",
  ".git",
  ".tmp",
  "artifacts",
  "coverage",
  "dist",
  "node_modules",
  "test-results",
]);
const sourceExtensions = new Set([".json", ".md", ".mdx", ".proto", ".ts", ".tsx"]);
const removedControlNames = [
  ["secret", "selector"].join(""),
  ["secret", "selector"].join("-"),
  ["secret", "selector"].join("_"),
];

function findSourceFiles(directory: URL): URL[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) {
      return [];
    }

    const entryUrl = new URL(entry.name, directory);
    if (entry.isDirectory()) {
      return findSourceFiles(new URL(`${entry.name}/`, directory));
    }

    return sourceExtensions.has(extname(entry.name)) ? [entryUrl] : [];
  });
}

describe("removed controls", () => {
  test("does not publish the removed control in source or registry artifacts", () => {
    const matches = findSourceFiles(repositoryDirectory).flatMap((file) => {
      const normalized = readFileSync(file, "utf8").toLowerCase();
      return removedControlNames.some((name) => normalized.includes(name))
        ? [file.pathname.slice(repositoryDirectory.pathname.length)]
        : [];
    });

    expect(matches).toEqual([]);
  });
});
