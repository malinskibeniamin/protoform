import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import ts from 'typescript';

import { isGeneratedSource } from './source-files';

const testFile = /\.test\.[cm]?[jt]sx?$/u;
const crossBoundaryTest = /\.(?:conformance|e2e)\.test\.[cm]?[jt]sx?$/u;
const testSupport = /\.(?:test|test-utils|fixture|setup|typecheck)\.[cm]?[jt]sx?$/u;
const currentDirectory = process.cwd();
const project = ts.getParsedCommandLineOfConfigFile('tsconfig.json', undefined, {
  ...ts.sys,
  onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
    throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  },
});
if (project === undefined) {
  throw new Error('Cannot resolve test owners without tsconfig.json.');
}
const { options } = project;
const resolver = ts.createModuleResolutionCache(currentDirectory, (name) => name, options);

function importSubject(statement: ts.Statement) {
  if (!(ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier))) {
    return;
  }
  const clause = statement.importClause;
  const bindings = clause?.namedBindings;

  if (clause?.phaseModifier === ts.SyntaxKind.TypeKeyword) {
    return;
  }
  if (clause?.name === undefined && bindings && ts.isNamedImports(bindings)) {
    const { elements } = bindings;
    return elements.length > 0 && elements.every((element) => element.isTypeOnly)
      ? undefined
      : statement.moduleSpecifier.text;
  }
  return statement.moduleSpecifier.text;
}

function resolveSubject(file: string, specifier: string) {
  const { resolvedModule } = ts.resolveModuleName(specifier, resolve(file), options, ts.sys, resolver);
  const filename = resolvedModule?.resolvedFileName;
  if (filename === undefined || resolvedModule?.isExternalLibraryImport === true) {
    return;
  }
  const path = relative(currentDirectory, filename);
  if (
    isAbsolute(path) ||
    path.startsWith(`..${sep}`) ||
    path.endsWith('.d.ts') ||
    isGeneratedSource(path) ||
    testSupport.test(path)
  ) {
    return;
  }
  return path;
}

export function detachedTestOwner(source: ts.SourceFile) {
  if (!testFile.test(source.fileName) || crossBoundaryTest.test(source.fileName)) {
    return;
  }
  const base = relative(currentDirectory, resolve(source.fileName));
  const local = dirname(base);
  const subjects = source.statements.flatMap((statement) => {
    const specifier = importSubject(statement);
    const subject = specifier === undefined ? undefined : resolveSubject(base, specifier);
    return subject === undefined ? [] : [subject];
  });
  const owners = new Set(subjects.map((subject) => dirname(subject)));
  if (owners.has(local)) {
    return;
  }
  if (owners.size === 1) {
    const [onlyOwner] = owners;
    return onlyOwner;
  }
  const [stem] = basename(base).split('.');
  const named = subjects.filter(
    (subject) => basename(subject).split('.')[0] === stem || basename(dirname(subject)) === stem
  );
  const namedOwners = new Set(named.map((subject) => dirname(subject)));
  const [owner] = namedOwners;
  return namedOwners.size === 1 ? owner : undefined;
}
