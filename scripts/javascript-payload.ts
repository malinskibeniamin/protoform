import { gzipSync } from 'node:zlib';
import ts from 'typescript';

interface JavaScriptModule {
  gzipBytes: number;
  imports: string[];
}

function staticSource(node: ts.Node): string | undefined {
  if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
    const { moduleSpecifier } = node;
    if (moduleSpecifier !== undefined && ts.isStringLiteralLike(moduleSpecifier)) {
      return moduleSpecifier.text;
    }
  }
  return undefined;
}

function runtimeSource(node: ts.Node): { kind: 'import' | 'worker'; argument: ts.Expression | undefined } | undefined {
  if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
    const [argument] = node.arguments;
    return { argument, kind: 'import' };
  }
  if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'Worker') {
    const [argument] = node.arguments ?? [];
    return { argument, kind: 'worker' };
  }
  return undefined;
}

function moduleReferences(url: string, text: string) {
  const source = ts.createSourceFile(url, text, ts.ScriptTarget.Latest, true);
  const imports: string[] = [];
  const deferredImports: string[] = [];
  const computed = { import: 0, worker: 0 };
  const inspect = (node: ts.Node) => {
    const specifier = staticSource(node);
    if (specifier !== undefined) {
      imports.push(new URL(specifier, url).href);
    }
    const runtime = runtimeSource(node);
    if (runtime !== undefined) {
      if (runtime.argument !== undefined && ts.isStringLiteralLike(runtime.argument)) {
        deferredImports.push(new URL(runtime.argument.text, url).href);
      } else {
        computed[runtime.kind] += 1;
      }
    }
    ts.forEachChild(node, inspect);
  };
  inspect(source);
  return { imports, deferredImports, computed };
}

export async function measureJavaScriptPayload(
  roots: { initial: string[]; deferred: string[]; inline?: { url: string; text: string }[] },
  readModule: (url: string) => Promise<string> | string
) {
  const scheduled = new Set<string>();
  const modules = new Map<string, JavaScriptModule>();
  const inline = new Map((roots.inline ?? []).map(({ url, text }) => [url, text]));
  const computedImports = new Map<string, number>();
  const computedWorkers = new Map<string, number>();
  const pending: string[] = [];
  const schedule = (url: string) => {
    if (!scheduled.has(url)) {
      scheduled.add(url);
      pending.push(url);
    }
  };
  const visit = async (url: string): Promise<void> => {
    const text = inline.get(url) ?? (await readModule(url));
    const { imports, deferredImports, computed } = moduleReferences(url, text);
    if (computed.import > 0) {
      computedImports.set(url, computed.import);
    }
    if (computed.worker > 0) {
      computedWorkers.set(url, computed.worker);
    }
    modules.set(url, { gzipBytes: gzipSync(text).byteLength, imports });
    for (const dependency of [...imports, ...deferredImports]) {
      schedule(dependency);
    }
  };
  const visitBatch = async (): Promise<void> => {
    const batch = pending.splice(0, 8);
    if (batch.length === 0) {
      return;
    }
    await Promise.all(batch.map(visit));
    await visitBatch();
  };
  for (const root of [...roots.initial, ...roots.deferred, ...inline.keys()]) {
    schedule(root);
  }
  await visitBatch();
  const initial = new Set<string>();
  const visitInitial = (url: string) => {
    if (initial.has(url)) {
      return;
    }
    initial.add(url);
    const module = modules.get(url);
    if (!module) {
      throw new Error(`Missing initial module ${url}`);
    }
    for (const dependency of module.imports) {
      visitInitial(dependency);
    }
  };
  for (const root of [...roots.initial, ...inline.keys()]) {
    visitInitial(root);
  }
  const initialModules = [...initial];
  const deferredModules = [...modules.keys()].filter((url) => !initial.has(url));
  const sum = (urls: string[]) => urls.reduce((bytes, url) => bytes + (modules.get(url)?.gzipBytes ?? 0), 0);
  return {
    computedImports: [...computedImports].map(([module, count]) => ({ count, module })),
    computedWorkers: [...computedWorkers].map(([module, count]) => ({ count, module })),
    deferredGzipBytes: sum(deferredModules),
    deferredModules,
    initialGzipBytes: sum(initialModules),
    initialModules,
  };
}
