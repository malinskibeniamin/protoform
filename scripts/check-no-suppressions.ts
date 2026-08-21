import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const sourceExtensionPattern = /\.(?:astro|cjs|css|js|jsx|mdx|mjs|ts|tsx)$/;
const generatedPathPatterns = [
  /(^|\/)gen\//,
  /(^|\/)__golden__\//,
  /(^|\/)public\/r\//,
  /(^|\/)registry\/base-nova\/protoform\/lib\/protobuf-v1-bridge\//,
  /(?:^|\/)routeTree\.gen\.ts$/,
  /_(?:form|pb)\.ts$/,
];

const forbiddenDirectives = [
  ["biome", "ignore"].join("-"),
  ["eslint", "disable"].join("-"),
  ["oxlint", "disable"].join("-"),
  ["prettier", "ignore"].join("-"),
  ["@ts", "expect-error"].join("-"),
  ["@ts", "ignore"].join("-"),
  ["@ts", "nocheck"].join("-"),
];

export function findForbiddenDirectives(source: string): string[] {
  return forbiddenDirectives.filter((directive) => source.includes(directive));
}

function checkNoSuppressions(): void {
  const filesResult = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
    encoding: "utf8",
  });

  if (filesResult.status !== 0) {
    throw new Error(`Could not list source files: ${filesResult.stderr.trim()}`);
  }

  const sourceFiles = filesResult.stdout
    .split("\0")
    .filter(Boolean)
    .filter(existsSync)
    .filter((path) => sourceExtensionPattern.test(path))
    .filter((path) => !generatedPathPatterns.some((pattern) => pattern.test(path)));

  const violations: string[] = [];

  for (const path of sourceFiles) {
    const lines = readFileSync(path, "utf8").split("\n");
    for (const [index, line] of lines.entries()) {
      for (const directive of findForbiddenDirectives(line)) {
        violations.push(`${path}:${index + 1}: ${directive}`);
      }
    }
  }

  if (violations.length > 0) {
    console.error(
      "Inline quality-rule suppressions are forbidden. Fix the issue or add a documented config exception."
    );
    console.error(violations.join("\n"));
    process.exitCode = 1;
  } else {
    console.info(`No inline quality-rule suppressions found in ${sourceFiles.length} authored source files.`);
  }
}

if (import.meta.main) {
  checkNoSuppressions();
}
