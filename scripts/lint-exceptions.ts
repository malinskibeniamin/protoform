import { matchesGlob, posix } from 'node:path';
import ts from 'typescript';

export interface LintExceptionDiagnostic {
  file: string;
  line: number;
  message: string;
}

const GLOB_SYNTAX = /[*?{[]/u;
const STRUCTURAL_ROOTS = ['', 'registry/', 'registry/base-nova/', 'registry/base-nova/protoform/'];
const SOURCE_EXTENSIONS = ['ts', 'tsx', 'js', 'jsx'];
const PROBE_OWNERS = ['__boundary_owner_a__', '__boundary_owner_b__'];
const WEAKER_SEVERITIES = new Set(['off', 'warn', 'info']);

function isUnboundedPattern(pattern: string): boolean {
  const normalized = posix.normalize(pattern);
  return STRUCTURAL_ROOTS.some((root) =>
    SOURCE_EXTENSIONS.some((extension) =>
      PROBE_OWNERS.every((owner) => matchesGlob(`${root}${owner}/__boundary_file__.${extension}`, normalized))
    )
  );
}

function propertyName(name: ts.PropertyName): string | undefined {
  return ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : undefined;
}

function propertyValue(object: ts.ObjectLiteralExpression, name: string): ts.Expression | undefined {
  const property = object.properties.find(
    (entry): entry is ts.PropertyAssignment => ts.isPropertyAssignment(entry) && propertyName(entry.name) === name
  );
  return property?.initializer;
}

function hasWeakerSeverity(node: ts.Node): boolean {
  if (ts.isStringLiteral(node) && WEAKER_SEVERITIES.has(node.text)) {
    return true;
  }
  return ts.forEachChild(node, hasWeakerSeverity) ?? false;
}

function isException(override: ts.ObjectLiteralExpression): boolean {
  const rules = propertyValue(override, 'rules');
  return (rules !== undefined && ts.isArrayLiteralExpression(rules)) || hasWeakerSeverity(override);
}

function inspectPattern(pattern: string, sourcePaths: readonly string[]): string[] {
  if (isUnboundedPattern(pattern)) {
    return ['Exception must name a bounded owner, not all source.'];
  }
  if (pattern.startsWith('!') || GLOB_SYNTAX.test(pattern) || sourcePaths.includes(pattern)) {
    return [];
  }
  return [`Selector "${pattern}" matches no source files. Remove or correct the stale exception.`];
}

function inspectSelectors(override: ts.ObjectLiteralExpression, sourcePaths: readonly string[]): string[] {
  const selectors = propertyValue(override, 'files') ?? propertyValue(override, 'includes');
  if (!(selectors && ts.isArrayLiteralExpression(selectors))) {
    return ['Exception must declare static files/includes selectors.'];
  }
  const patterns: string[] = [];
  const messages: string[] = [];
  for (const selector of selectors.elements) {
    if (ts.isStringLiteral(selector)) {
      patterns.push(selector.text);
      messages.push(...inspectPattern(selector.text, sourcePaths));
    } else {
      messages.push('Exception selectors must be literal paths so the gate can validate their scope.');
    }
  }
  const positive = patterns.filter((pattern) => !pattern.startsWith('!'));
  const negative = patterns.filter((pattern) => pattern.startsWith('!')).map((pattern) => pattern.slice(1));
  const matches = sourcePaths.some(
    (path) =>
      positive.some((pattern) => matchesGlob(path, pattern)) && !negative.some((pattern) => matchesGlob(path, pattern))
  );
  if (!matches && (positive.length === 0 || positive.some((pattern) => GLOB_SYNTAX.test(pattern)))) {
    messages.push('Exception scope matches no source files. Remove or correct its selectors.');
  }
  return messages;
}

function collectOverrideArrays(node: ts.Node, found: ts.PropertyAssignment[]): void {
  if (ts.isPropertyAssignment(node) && propertyName(node.name) === 'overrides') {
    found.push(node);
  }
  ts.forEachChild(node, (child) => collectOverrideArrays(child, found));
}

export function auditLintExceptions(
  file: string,
  source: string,
  sourcePaths: readonly string[]
): LintExceptionDiagnostic[] {
  const text = file.endsWith('.jsonc') ? `const config = ${source};` : source;
  const parsed = ts.createSourceFile('config.ts', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const lineOf = (node: ts.Node) => parsed.getLineAndCharacterOfPosition(node.getStart(parsed)).line + 1;
  const assignments: ts.PropertyAssignment[] = [];
  collectOverrideArrays(parsed, assignments);
  return assignments.flatMap((assignment) => {
    const overrides = assignment.initializer;
    if (!ts.isArrayLiteralExpression(overrides)) {
      return [{ file, line: lineOf(assignment), message: 'Overrides must be a static array.' }];
    }
    return overrides.elements.flatMap((override) => {
      if (!(ts.isObjectLiteralExpression(override) && isException(override))) {
        return [];
      }
      return inspectSelectors(override, sourcePaths).map((message) => ({ file, line: lineOf(override), message }));
    });
  });
}
