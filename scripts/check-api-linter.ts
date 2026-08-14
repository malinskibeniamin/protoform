import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const API_LINTER = "github.com/googleapis/api-linter/v2/cmd/api-linter@v2.3.1";
const AIP_PROTO = "conformance/proto/protoform/conformance/v1/aip.proto";
const GO_TOOLCHAIN = "go1.26.6";
const ENABLED_RULES = [
  "core::0127",
  "core::0131",
  "core::0132",
  "core::0133",
  "core::0134",
  "core::0135",
  "core::0164",
  "core::0203",
] as const;

const temporaryDirectory = mkdtempSync(join(tmpdir(), "protoform-api-linter-"));
const descriptorSet = join(temporaryDirectory, "aip.binpb");

try {
  execFileSync(
    "bunx",
    [
      "buf",
      "build",
      "--path",
      AIP_PROTO,
      "--as-file-descriptor-set",
      "--output",
      descriptorSet,
    ],
    { stdio: "inherit" }
  );
  execFileSync(
    "env",
    [
      `GOTOOLCHAIN=${GO_TOOLCHAIN}`,
      "go",
      "run",
      API_LINTER,
      "--descriptor-set-in",
      descriptorSet,
      "--disable-rule",
      "all",
      ...ENABLED_RULES.flatMap((rule) => ["--enable-rule", rule]),
      "--set-exit-status",
      "--output-format",
      "summary",
      AIP_PROTO,
    ],
    { stdio: "inherit" }
  );
} finally {
  rmSync(temporaryDirectory, { force: true, recursive: true });
}
