import { spawnSync } from "node:child_process";
import { stripVTControlCharacters } from "node:util";

interface DocsDiagnosticSummary {
  errors: number;
  hints: number;
  warnings: number;
}

const diagnosticSummaryPattern = /^-\s+(\d+)\s+(errors?|warnings?|hints?)\s*$/gim;

export function parseDocsDiagnosticSummary(output: string): DocsDiagnosticSummary | null {
  const summary: Partial<DocsDiagnosticSummary> = {};
  const cleanOutput = stripVTControlCharacters(output);

  for (const match of cleanOutput.matchAll(diagnosticSummaryPattern)) {
    const count = Number(match[1]);
    const severity = match[2]?.toLowerCase();
    if (severity?.startsWith("error")) {
      summary.errors = count;
    } else if (severity?.startsWith("warning")) {
      summary.warnings = count;
    } else if (severity?.startsWith("hint")) {
      summary.hints = count;
    }
  }

  if (summary.errors === undefined || summary.warnings === undefined || summary.hints === undefined) {
    return null;
  }

  return {
    errors: summary.errors,
    hints: summary.hints,
    warnings: summary.warnings,
  };
}

function checkDocsTypes(): void {
  const result = spawnSync("blume", ["check", "--strict", "--isolated"], {
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });

  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
    return;
  }

  const summary = parseDocsDiagnosticSummary(`${result.stdout}\n${result.stderr}`);
  if (!summary) {
    console.error("Documentation typecheck did not report a complete diagnostic summary.");
    process.exitCode = 1;
    return;
  }

  if (summary.errors > 0 || summary.warnings > 0 || summary.hints > 0) {
    console.error(
      `Documentation typecheck reported ${summary.errors} errors, ${summary.warnings} warnings, and ${summary.hints} hints.`
    );
    process.exitCode = 1;
  }
}

if (import.meta.main) {
  checkDocsTypes();
}
