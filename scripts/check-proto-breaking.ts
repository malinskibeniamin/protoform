import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

interface BreakingViolation {
  message: string;
  path?: string;
  type: string;
}

interface StableProtoModule {
  legacyPaths?: readonly string[];
  path: string;
  waivers: readonly BreakingViolation[];
}

const stableModules: readonly StableProtoModule[] = [
  {
    legacyPaths: ["registry/new-york/protoform/lib/protobuf-provider/proto"],
    path: "registry/base-nova/protoform/lib/protobuf-provider/proto",
    waivers: [
      {
        message:
          'Previously present file "auto-form-example.proto" was deleted.',
        type: "FILE_NO_DELETE",
      },
    ],
  },
];

function isBreakingViolation(value: unknown): value is BreakingViolation {
  if (!(typeof value === "object" && value !== null)) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.message === "string" &&
    typeof candidate.type === "string" &&
    (candidate.path === undefined || typeof candidate.path === "string")
  );
}

function runBuf(args: readonly string[]) {
  const result = spawnSync("bunx", ["buf", ...args], { encoding: "utf8" });
  if (result.error) {
    throw result.error;
  }
  if (result.status === null) {
    throw new Error(`Buf terminated without an exit status: ${args.join(" ")}`);
  }
  return result;
}

function buildImage(input: string, output: string): void {
  const result = runBuf(["build", input, "-o", output]);
  if (result.status !== 0) {
    throw new Error(`${result.stdout}${result.stderr}`.trim());
  }
}

function buildTargetImage(
  against: string,
  module: StableProtoModule,
  output: string
): void {
  const paths = [module.path, ...(module.legacyPaths ?? [])];
  const failures: string[] = [];

  for (const path of paths) {
    const input = withSubdirectory(against, path);
    const result = runBuf(["build", input, "-o", output]);
    if (result.status === 0) {
      return;
    }
    failures.push(`${input}: ${result.stdout}${result.stderr}`.trim());
  }

  throw new Error(failures.join("\n"));
}

function withSubdirectory(input: string, subdirectory: string): string {
  return input.includes("#")
    ? `${input},subdir=${subdirectory}`
    : `${input}#subdir=${subdirectory}`;
}

function parseViolations(output: string): BreakingViolation[] {
  return output
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as unknown)
    .map((value) => {
      if (!isBreakingViolation(value)) {
        throw new Error("Buf returned an invalid breaking-change violation.");
      }
      return value;
    });
}

function isWaived(
  violation: BreakingViolation,
  waivers: readonly BreakingViolation[]
): boolean {
  return waivers.some(
    (waiver) =>
      waiver.message === violation.message &&
      waiver.path === violation.path &&
      waiver.type === violation.type
  );
}

function againstInput(): string {
  const againstIndex = process.argv.indexOf("--against");
  if (againstIndex === -1) {
    return ".git#ref=origin/main";
  }
  const value = process.argv[againstIndex + 1];
  if (!value) {
    throw new Error("--against requires a Buf Git input.");
  }
  return value;
}

function checkModule(
  module: StableProtoModule,
  against: string,
  directory: string,
  index: number
): void {
  const currentImage = join(directory, `current-${index}.binpb`);
  const targetImage = join(directory, `target-${index}.binpb`);
  buildImage(module.path, currentImage);
  buildTargetImage(against, module, targetImage);

  const result = runBuf([
    "breaking",
    currentImage,
    "--against",
    targetImage,
    "--config",
    "buf.yaml",
    "--error-format=json",
  ]);
  if (result.status === 0) {
    console.info(`Buf breaking passed: ${module.path}`);
    return;
  }

  const violations = parseViolations(`${result.stdout}${result.stderr}`);
  const unwaived = violations.filter(
    (violation) => !isWaived(violation, module.waivers)
  );
  for (const violation of violations.filter((item) =>
    isWaived(item, module.waivers)
  )) {
    console.info(
      `Accepted pre-1.0 protobuf migration in ${module.path}: ${violation.message}`
    );
  }
  if (unwaived.length > 0) {
    throw new Error(
      unwaived
        .map(
          (violation) =>
            `${module.path}: ${violation.type}: ${violation.message}`
        )
        .join("\n")
    );
  }
}

const temporaryDirectory = mkdtempSync(join(tmpdir(), "protoform-breaking-"));
try {
  const against = againstInput();
  for (const [index, module] of stableModules.entries()) {
    checkModule(module, against, temporaryDirectory, index);
  }
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : "Protobuf breaking-change detection failed."
  );
  process.exitCode = 1;
} finally {
  rmSync(temporaryDirectory, { force: true, recursive: true });
}
