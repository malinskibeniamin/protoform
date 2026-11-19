import { readFileSync } from 'node:fs';
import ts from 'typescript';

import { authoredFiles } from './source-files';
import { detachedTestOwner } from './test-policy-owners';

const testPath = /\.(?:test|test-utils|fixture|setup)\.[cm]?[jt]sx?$/u;
const rstestModule = /^@rstest\/(?:core|playwright)(?:\/|$)/u;
const spyCapable = new Set(['mock', 'doMock', 'mockRequire', 'doMockRequire', 'mockObject']);
const recorderExpectation = /^expect\([\w.]+\)/u;
const rstestReplacements = new Set(['stubGlobal', 'importMock', 'requireMock']);

interface RunnerBindings {
  exports: string[];
  names: Set<string>;
  namespaces: Set<string>;
}

function registerBindings(importClause: ts.ImportClause | undefined, runner: RunnerBindings) {
  const bindings = importClause?.namedBindings;
  if (!bindings || importClause?.phaseModifier === ts.SyntaxKind.TypeKeyword) {
    return;
  }
  if (ts.isNamespaceImport(bindings)) {
    runner.namespaces.add(bindings.name.text);
    return;
  }
  const { elements } = bindings;
  for (const element of elements) {
    if (!element.isTypeOnly && runner.exports.includes(element.propertyName?.text ?? element.name.text)) {
      runner.names.add(element.name.text);
    }
  }
}

function readBindings(source: ts.SourceFile) {
  const rstest: RunnerBindings = { names: new Set(['rstest', 'rs']), namespaces: new Set(), exports: ['rstest', 'rs'] };
  const bun: RunnerBindings = { names: new Set(), namespaces: new Set(), exports: ['mock'] };
  const { statements } = source;
  for (const statement of statements) {
    if (!(ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier))) {
      continue;
    }
    const module = statement.moduleSpecifier.text;
    if (rstestModule.test(module)) {
      registerBindings(statement.importClause, rstest);
    } else if (module === 'bun:test') {
      registerBindings(statement.importClause, bun);
    }
  }
  return { rstest, bun };
}

function member(node: ts.Expression) {
  if (ts.isPropertyAccessExpression(node)) {
    return { owner: node.expression, name: node.name.text };
  }
  return ts.isElementAccessExpression(node) && ts.isStringLiteral(node.argumentExpression)
    ? { owner: node.expression, name: node.argumentExpression.text }
    : undefined;
}

function isRunnerBinding(node: ts.Expression, runner: RunnerBindings) {
  if (ts.isIdentifier(node)) {
    return runner.names.has(node.text);
  }
  const path = member(node);
  return (
    path !== undefined &&
    runner.exports.includes(path.name) &&
    ts.isIdentifier(path.owner) &&
    runner.namespaces.has(path.owner.text)
  );
}

function isObservationOptions(node: ts.Expression | undefined) {
  if (node === undefined || !ts.isObjectLiteralExpression(node) || node.properties.length !== 1) {
    return false;
  }
  const [property] = node.properties;
  return (
    property !== undefined &&
    ts.isPropertyAssignment(property) &&
    (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) &&
    property.name.text === 'spy' &&
    property.initializer.kind === ts.SyntaxKind.TrueKeyword
  );
}

function hasImplementation(node: ts.CallExpression) {
  const [implementation] = node.arguments;
  return (
    implementation !== undefined &&
    !(node.arguments.length === 1 && ts.isIdentifier(implementation) && implementation.text === 'undefined')
  );
}

function changesTestBudget(node: ts.Expression | undefined) {
  if (node === undefined || !ts.isObjectLiteralExpression(node)) {
    return false;
  }
  return node.properties.some((property) => {
    const { name } = property;
    return (
      name !== undefined &&
      (ts.isIdentifier(name) || ts.isStringLiteral(name)) &&
      ['testTimeout', 'retry'].includes(name.text)
    );
  });
}

function observesRecorder(node: ts.Node, source: ts.SourceFile) {
  const inspect: (candidate: ts.Node) => boolean = (candidate) => {
    if (ts.isCallExpression(candidate)) {
      const matcher = member(candidate.expression);
      if (
        matcher !== undefined &&
        (matcher.name.startsWith('toHaveBeenCalled') ||
          (matcher.name === 'toHaveLength' && recorderExpectation.test(matcher.owner.getText(source))))
      ) {
        return true;
      }
    }
    if (ts.isPropertyAccessExpression(candidate) && candidate.name.text === 'mock') {
      return true;
    }
    return ts.forEachChild(candidate, (child) => (inspect(child) ? true : undefined)) === true;
  };
  return inspect(node);
}

function rstestViolation(method: string, node: ts.CallExpression, source: ts.SourceFile) {
  if (method === 'setConfig' && changesTestBudget(node.arguments[0])) {
    return 'do not set retry or testTimeout inside tests.';
  }
  const [callback] = node.arguments;
  if (method === 'waitFor' && callback !== undefined && observesRecorder(callback, source)) {
    return 'await the operation or a callback signal instead of polling recorded calls.';
  }
  if (rstestReplacements.has(method) || (spyCapable.has(method) && !isObservationOptions(node.arguments[1]))) {
    return 'use the real dependency or a host callback; spies must only observe.';
  }
  return method === 'fn' && hasImplementation(node)
    ? 'use the real dependency or a host callback; spies must only observe.'
    : undefined;
}

function getViolation(node: ts.CallExpression, source: ts.SourceFile, rstest: RunnerBindings, bun: RunnerBindings) {
  const callee = member(node.expression);
  if (callee !== undefined && isRunnerBinding(callee.owner, rstest)) {
    return rstestViolation(callee.name, node, source);
  }
  const bunModule = callee?.name === 'module' && isRunnerBinding(callee.owner, bun);
  return bunModule || (hasImplementation(node) && isRunnerBinding(node.expression, bun))
    ? 'use the real dependency or a host callback; spies must only observe.'
    : undefined;
}

function callsReplacingDependencies(file: string) {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const { rstest, bun } = readBindings(source);
  const diagnostics: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const violation = getViolation(node, source, rstest, bun);
      if (violation !== undefined) {
        const { line, character } = source.getLineAndCharacterOfPosition(node.getStart(source));
        diagnostics.push(`${file}:${line + 1}:${character + 1}: ${violation}`);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  const owner = detachedTestOwner(source);
  if (owner !== undefined) {
    diagnostics.push(`${file}:1:1: colocate this test with its implementation in ${owner}.`);
  }
  return diagnostics;
}

const files = process.argv.length > 2 ? process.argv.slice(2) : authoredFiles().filter((file) => testPath.test(file));
const diagnostics = files.flatMap(callsReplacingDependencies);
if (diagnostics.length > 0) {
  console.error(diagnostics.join('\n'));
  process.exitCode = 1;
} else {
  console.info('Rstest and Bun test policy passed.');
}
