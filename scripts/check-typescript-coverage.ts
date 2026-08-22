import { spawnSync } from "node:child_process";
import { isAbsolute, relative, resolve } from "node:path";

const generatedPathPatterns = [
  /(^|\/)gen\//u,
  /(^|\/)__golden__\//u,
  /(^|\/)registry\/base-nova\/protoform\/lib\/protobuf-v1-bridge\//u,
  /(?:^|\/)routeTree\.gen\.ts$/u,
  /_(?:form|pb)\.ts$/u,
];
const typescriptPathPattern = /\.tsx?$/u;
const projectRoot = process.cwd();

function run(command: string, args: string[]): string {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed:\n${result.stderr.trim()}`);
  }
  return result.stdout;
}

function normalizePath(path: string): string {
  const absolutePath = isAbsolute(path) ? path : resolve(projectRoot, path);
  return relative(projectRoot, absolutePath).replaceAll("\\", "/");
}

const authoredFiles = run("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"])
  .split("\0")
  .filter((path) => typescriptPathPattern.test(path))
  .filter((path) => !generatedPathPatterns.some((pattern) => pattern.test(path)));

const compilerFiles = new Set(
  ["tsconfig.json", "tsconfig.tests.json"].flatMap((config) =>
    run("tsc", ["--project", config, "--listFilesOnly", "--pretty", "false"])
      .split("\n")
      .filter(Boolean)
      .map(normalizePath)
  )
);

const missingFiles = authoredFiles.filter((path) => !compilerFiles.has(path)).sort();

if (missingFiles.length > 0) {
  console.error("Authored TypeScript files missing from the compiler programs:");
  console.error(missingFiles.join("\n"));
  process.exitCode = 1;
} else {
  console.info(`Every authored TypeScript file is covered (${authoredFiles.length} files).`);
}
