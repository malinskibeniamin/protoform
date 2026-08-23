#!/usr/bin/env bun

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import {
  type AutoFormAuditFormat,
  type AutoFormAuditTarget,
  auditAutoFormConfigurations,
  formatAutoFormAuditReport,
} from "../registry/base-nova/protoform/components/auto-form/audit";

export interface ProtoformCliArguments {
  command: "audit";
  configPaths: string[];
  format: AutoFormAuditFormat;
}

const USAGE = "Usage: protoform audit [config.ts ...] [--format json|sarif]";

export function parseProtoformCliArguments(arguments_: readonly string[]): ProtoformCliArguments {
  const [command, ...options] = arguments_;
  if (command !== "audit") {
    throw new Error('Unknown command "'.concat(command ?? "", '". ', USAGE));
  }

  const configPaths: string[] = [];
  let format: AutoFormAuditFormat = "json";
  for (let index = 0; index < options.length; index += 1) {
    const option = options[index];
    if (option === "--format") {
      const value = options[index + 1];
      if (value !== "json" && value !== "sarif") {
        throw new Error('Unsupported format "'.concat(value ?? "", '". Use json or sarif.'));
      }
      format = value;
      index += 1;
      continue;
    }
    if (option?.startsWith("--")) {
      throw new Error('Unknown option "'.concat(option, '". ', USAGE));
    }
    if (option) {
      configPaths.push(option);
    }
  }

  return {
    command,
    configPaths: configPaths.length > 0 ? configPaths : ["protoform.audit.ts"],
    format,
  };
}

function isAuditTarget(value: unknown): value is AutoFormAuditTarget {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof value.name === "string" &&
    "schema" in value
  );
}

async function loadAuditTargets(configPath: string): Promise<AutoFormAuditTarget[]> {
  const modulePath = pathToFileURL(resolve(configPath)).href;
  const module = await import(modulePath);
  const candidate: unknown = module.default ?? module.auditTargets;
  if (!(Array.isArray(candidate) && candidate.every(isAuditTarget))) {
    throw new TypeError(configPath.concat(" must export an AutoFormAuditTarget array as default or auditTargets."));
  }
  return candidate;
}

export async function runProtoformCli(arguments_: readonly string[]): Promise<number> {
  const parsed = parseProtoformCliArguments(arguments_);
  const targets = (await Promise.all(parsed.configPaths.map(loadAuditTargets))).flat();
  const report = auditAutoFormConfigurations(targets);
  process.stdout.write(formatAutoFormAuditReport(report, parsed.format).concat("\n"));
  return report.diagnostics.some((diagnostic) => diagnostic.severity === "error") ? 1 : 0;
}

if (import.meta.main) {
  runProtoformCli(process.argv.slice(2))
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch((error: unknown) => {
      process.stderr.write((error instanceof Error ? error.message : String(error)).concat("\n"));
      process.exitCode = 1;
    });
}
