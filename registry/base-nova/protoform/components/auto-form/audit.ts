import { type InspectAutoFormConfigurationInput, inspectAutoFormConfiguration } from "./configuration";

export type AutoFormAuditFormat = "json" | "sarif";

export interface AutoFormAuditTarget extends InspectAutoFormConfigurationInput<Record<string, unknown>, string> {
  name: string;
  source?: string;
}

export interface AutoFormAuditDiagnostic {
  code: ReturnType<typeof inspectAutoFormConfiguration>[number]["code"];
  message: string;
  path: string;
  severity: ReturnType<typeof inspectAutoFormConfiguration>[number]["severity"];
  source?: string;
  target: string;
}

export interface AutoFormAuditReport {
  diagnostics: AutoFormAuditDiagnostic[];
  version: 1;
}

export function auditAutoFormConfigurations(targets: readonly AutoFormAuditTarget[]): AutoFormAuditReport {
  const diagnostics = Array.from(targets)
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap(({ name, source, ...configuration }) =>
      inspectAutoFormConfiguration(configuration).map((diagnostic) => ({
        code: diagnostic.code,
        message: diagnostic.message,
        path: diagnostic.path,
        severity: diagnostic.severity,
        ...(source ? { source } : {}),
        target: name,
      }))
    );

  return { diagnostics, version: 1 };
}

function formatSarifReport(report: AutoFormAuditReport): string {
  const codes = [...new Set(report.diagnostics.map((diagnostic) => diagnostic.code))].sort();
  const sarif = {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [
      {
        results: report.diagnostics.map((diagnostic) => ({
          level: diagnostic.severity,
          ...(diagnostic.source
            ? {
                locations: [
                  {
                    physicalLocation: {
                      artifactLocation: { uri: diagnostic.source },
                    },
                  },
                ],
              }
            : {}),
          message: { text: diagnostic.target.concat(": ", diagnostic.message, " (", diagnostic.path, ")") },
          ruleId: diagnostic.code,
        })),
        tool: {
          driver: {
            name: "protoform",
            rules: codes.map((code) => ({ id: code })),
          },
        },
      },
    ],
    version: "2.1.0",
  };

  return JSON.stringify(sarif, null, 2);
}

export function formatAutoFormAuditReport(report: AutoFormAuditReport, format: AutoFormAuditFormat): string {
  return format === "sarif" ? formatSarifReport(report) : JSON.stringify(report, null, 2);
}
