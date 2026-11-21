import { posix } from 'node:path';
import type { registrySchema } from 'shadcn/schema';
import ts from 'typescript';
import type { z } from 'zod';

type RegistryItem = z.infer<typeof registrySchema>['items'][number];
const sourceRoot = 'registry/base-nova/protoform/';
const componentEntry = /^registry\/base-nova\/protoform\/components\/([^/]+)\/index\.tsx$/u;
const demoEntry = /^registry\/base-nova\/protoform\/demo\/ui\/([^/]+)\.tsx$/u;
const jsExtension = /\.js$/u;
const codeFile = /\.[cm]?[jt]sx?$/u;
const hostPackages = new Set(['react', 'react-dom']);

function packageName(specifier: string): string {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : (parts[0] ?? specifier);
}

function dependencyName(dependency: string): string {
  const at = dependency.indexOf('@', dependency.startsWith('@') ? 1 : 0);
  return at === -1 ? dependency : dependency.slice(0, at);
}

export function generateGranularUiItems(items: RegistryItem[], readSource: (path: string) => string): RegistryItem[] {
  const bundles = items.filter((item) => ['protoform-shadcn', 'protoform-shadcn-tanstack'].includes(item.name));
  if (bundles.length !== 2) {
    throw new Error('Granular UI generation requires both full UI bundles');
  }
  const files = new Map(bundles.flatMap((item) => (item.files ?? []).map((file) => [file.path, file] as const)));
  const versions = new Map(
    bundles.flatMap((item) => (item.dependencies ?? []).map((dep) => [dependencyName(dep), dep] as const))
  );
  const types = new Map(
    bundles.flatMap((item) => (item.devDependencies ?? []).map((dep) => [dependencyName(dep), dep] as const))
  );
  const notices = (bundles[0]?.files ?? []).filter((file) => file.type === 'registry:file');
  const entries = [...files.values()].filter((file) => {
    const name = componentEntry.exec(file.path)?.[1];
    return (name !== undefined && name !== 'auto-form') || demoEntry.test(file.path);
  });
  const typographyAdapter = `${sourceRoot}components/typography/tanstack-link.tsx`;
  const adapter = {
    path: typographyAdapter,
    target: '~/components/ui/typography/tanstack-link.tsx',
    type: 'registry:ui',
  } as const;
  files.set(typographyAdapter, adapter);
  entries.push(adapter);
  const imports = new Map<string, string[]>();
  return entries
    .map((entry) => {
      const { reached, packages } = sourceClosure(entry.path, files, versions, readSource, imports);
      if (packages.has('recharts')) {
        packages.add('react-is');
      }
      const component = componentEntry.exec(entry.path)?.[1];
      const demo = demoEntry.exec(entry.path)?.[1];
      const name = component ?? (demo === undefined ? 'typography-tanstack-link' : `${demo}-demo`);
      return {
        name: `protoform-ui-${name}`,
        type: demo === undefined ? 'registry:ui' : 'registry:block',
        title: `Protoform ${name}`,
        description: `Opt-in ${name} with only its source dependencies. Full UI bundles remain available.`,
        registryDependencies: ['@protoform/protoform-license'],
        dependencies: [...packages]
          .sort((left, right) => left.localeCompare(right))
          .map((pkg) => requiredValue(versions, pkg)),
        devDependencies: [...packages]
          .flatMap((pkg) => {
            const typesName = pkg.startsWith('@') ? `@types/${pkg.slice(1).replace('/', '__')}` : `@types/${pkg}`;
            const dependency = types.get(typesName);
            return dependency === undefined ? [] : [dependency];
          })
          .sort((left, right) => left.localeCompare(right)),
        files: [
          ...[...reached].sort((left, right) => left.localeCompare(right)).map((path) => requiredValue(files, path)),
          ...notices,
        ],
        ...(bundles[0]?.cssVars === undefined ? {} : { cssVars: structuredClone(bundles[0].cssVars) }),
      } satisfies RegistryItem;
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

function requiredValue<T>(values: Map<string, T>, key: string): T {
  const value = values.get(key);
  if (value === undefined) {
    throw new Error(`Missing registry value: ${key}`);
  }
  return value;
}

function sourceImports(path: string, content: string): string[] {
  const imports: string[] = [];
  const source = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
  const visit = (node: ts.Node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier !== undefined &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      imports.push(node.moduleSpecifier.text);
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const [specifier] = node.arguments;
      if (specifier !== undefined && ts.isStringLiteral(specifier)) {
        imports.push(specifier.text);
      }
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      imports.push(node.argument.literal.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return imports;
}

function localSource(specifier: string, path: string): string | undefined {
  if (specifier.startsWith('@/components/ui/')) {
    return specifier.replace('@/components/ui/', `${sourceRoot}components/`);
  }
  if (specifier.startsWith('@/')) {
    return specifier.slice(2);
  }
  if (specifier.startsWith('.')) {
    return posix.normalize(posix.join(posix.dirname(path), specifier));
  }
  return undefined;
}

function resolveSource(files: Map<string, unknown>, local: string, path: string, specifier: string): string {
  const stem = local.replace(jsExtension, '');
  const resolved = [local, `${stem}.ts`, `${stem}.tsx`, `${stem}/index.ts`, `${stem}/index.tsx`].find((candidate) =>
    files.has(candidate)
  );
  if (resolved === undefined) {
    throw new Error(`Missing aggregate file metadata: ${path} -> ${specifier}`);
  }
  return resolved;
}

function sourceClosure(
  entry: string,
  files: Map<string, unknown>,
  versions: Map<string, string>,
  readSource: (path: string) => string,
  imports: Map<string, string[]>
) {
  const reached = new Set<string>();
  const packages = new Set<string>();
  const pending = [entry];
  while (pending.length > 0) {
    const path = pending.pop();
    if (path === undefined || reached.has(path)) {
      continue;
    }
    reached.add(path);
    if (!codeFile.test(path)) {
      continue;
    }
    const specifiers = imports.get(path) ?? sourceImports(path, readSource(path));
    imports.set(path, specifiers);
    for (const specifier of specifiers) {
      const local = localSource(specifier, path);
      if (local === undefined) {
        addPackage(packages, versions, specifier, path);
      } else {
        pending.push(resolveSource(files, local, path, specifier));
      }
    }
  }
  return { reached, packages };
}

function addPackage(packages: Set<string>, versions: Map<string, string>, specifier: string, path: string) {
  const name = packageName(specifier);
  if (hostPackages.has(name)) {
    return;
  }
  if (!versions.has(name)) {
    throw new Error(`Missing aggregate dependency metadata: ${path} -> ${name}`);
  }
  packages.add(name);
}
