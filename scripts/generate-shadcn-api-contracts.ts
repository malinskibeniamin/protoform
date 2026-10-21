import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import ts from 'typescript';
import { z } from 'zod';
import digests from '../registry/shadcn-api-contracts/source-digests.json' with { type: 'json' };
import catalog from '../registry/shadcn-catalog.json' with { type: 'json' };

const registrySchema = z.array(
  z.object({ name: z.string(), files: z.array(z.object({ path: z.string(), content: z.string() })) })
);
const [sourcePath] = process.argv.slice(2);
if (sourcePath === undefined) {
  throw new Error('Pass the pinned shadcn view JSON file. See registry/shadcn-api-contracts/README.md.');
}
const input = registrySchema.parse(JSON.parse(readFileSync(sourcePath, 'utf8')));
const root = resolve(import.meta.dirname, '..');
const output = join(root, 'registry/shadcn-api-contracts');
mkdirSync(join(root, '.tmp'), { recursive: true });
const temporary = mkdtempSync(join(root, '.tmp/shadcn-api-'));
const COMPONENT_NAME = /^[A-Z]/u;
const inferredElement =
  /import\("react"\)\.ReactElement<unknown, string \| import\("react"\)\.JSXElementConstructor<any>>/gu;

function normalizeDeclaration(content: string, name: string) {
  let result = content
    .replaceAll('import * as ', 'import type * as ')
    .replaceAll(inferredElement, 'ReturnType<typeof useRender>')
    .replaceAll('import("@base-ui/react").ToastManager<any>', 'ReturnType<typeof ToastPrimitive.createToastManager>');
  result = result.replaceAll(/(React\.ReactElement<unknown), string \| React\.JSXElementConstructor<any>>/gu, '$1>');
  if (name === 'message-scroller') {
    for (const symbol of ['useMessageScroller', 'useMessageScrollerScrollable', 'useMessageScrollerVisibility']) {
      result = result.replaceAll(new RegExp(`\\b${symbol}\\b,?\\s*`, 'gu'), '');
    }
    result +=
      '\nexport { useMessageScroller, useMessageScrollerScrollable, useMessageScrollerVisibility } from "@shadcn/react/message-scroller";\n';
  }
  return result;
}

try {
  const files = catalog.components.map(({ name }) => {
    const source = input
      .find((item) => item.name === name)
      ?.files.find((file) => basename(file.path) === `${name}.tsx`);
    if (source === undefined) {
      throw new Error(`Missing official source: ${name}`);
    }
    const digest = createHash('sha256').update(source.content).digest('hex');
    if (digest !== Reflect.get(digests, name)) {
      throw new Error(`Upstream source drift: ${name}. Review the pin before updating contracts.`);
    }
    const path = join(temporary, `${name}.tsx`);
    const content = source.content
      .replaceAll('@/registry/base-nova/ui/', './')
      .replaceAll('from "cn"', `from "${join(root, 'registry/base-nova/protoform/lib/utils')}"`);
    writeFileSync(path, content);
    return path;
  });
  const configuration = ts.getParsedCommandLineOfConfigFile(
    join(root, 'tsconfig.json'),
    {
      noEmit: false,
      declaration: true,
      emitDeclarationOnly: true,
      removeComments: true,
      incremental: false,
      noUnusedLocals: false,
      noUnusedParameters: false,
    },
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
      },
    }
  );
  if (configuration === undefined) {
    throw new Error('Cannot read the repository TypeScript configuration.');
  }
  const program = ts.createProgram(files, configuration.options);
  const checker = program.getTypeChecker();
  const imports = ["import { expectTypeOf } from 'expect-type';", "import type React from 'react';"];
  const tests: string[] = [];
  for (const file of files) {
    const source = program.getSourceFile(file);
    if (source === undefined) {
      throw new Error(`Cannot parse ${file}`);
    }
    const name = basename(file, '.tsx');
    const alias = name.replaceAll(/-([a-z])/gu, (_match, character: string) => character.toUpperCase());
    program.emit(source, (filename, content) => {
      if (basename(filename) === `${name}.d.ts`) {
        writeFileSync(join(output, `${name}.d.ts`), normalizeDeclaration(content, name));
      }
    });
    imports.push(
      `import type * as ${alias}Official from './shadcn-api-contracts/${name}';`,
      `import type * as ${alias}Local from './base-nova/protoform/components/${name}';`
    );
    const module = checker.getSymbolAtLocation(source);
    if (module === undefined) {
      throw new Error(`Missing upstream module: ${name}`);
    }
    const assertions = checker.getExportsOfModule(module).map((symbol) => {
      const target = symbol.flags === ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      if (
        target.declarations?.some(
          (declaration) => ts.isTypeAliasDeclaration(declaration) || ts.isInterfaceDeclaration(declaration)
        )
      ) {
        return `expectTypeOf<${alias}Official.${symbol.name}>().toEqualTypeOf<${alias}Local.${symbol.name}>();`;
      }
      const type = checker.getTypeOfSymbolAtLocation(symbol, source);
      const [signature] = type.getCallSignatures();
      if (signature !== undefined && signature.parameters.length > 0 && COMPONENT_NAME.test(symbol.name)) {
        return `expectTypeOf<React.ComponentProps<typeof ${alias}Official.${symbol.name}>>().toExtend<React.ComponentProps<typeof ${alias}Local.${symbol.name}>>();`;
      }
      return `expectTypeOf<typeof ${alias}Local.${symbol.name}>().toExtend<typeof ${alias}Official.${symbol.name}>();`;
    });
    tests.push(`test('${name} accepts the pinned shadcn public props', () => {\n${assertions.join('\n')}\n});`);
  }
  const contracts = join(root, 'registry/shadcn-api-contract.test.ts');
  writeFileSync(
    contracts,
    `${imports.join('\n')}\n\ndeclare const { test }: typeof import('bun:test');\n\n${tests.join('\n\n')}\n`
  );
  execFileSync('bunx', ['--no-install', 'oxlint', '--config', '.oxlintrc.jsonc', '--fix', output, contracts], {
    cwd: root,
    stdio: 'inherit',
  });
  execFileSync('bunx', ['--no-install', 'biome', 'check', '--write', output, contracts], {
    cwd: root,
    stdio: 'inherit',
  });
} finally {
  rmSync(temporary, { force: true, recursive: true });
}
