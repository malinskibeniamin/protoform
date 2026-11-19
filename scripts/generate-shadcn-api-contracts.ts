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
  throw new Error('Pass the pinned shadcn view JSON file or --assertions-only.');
}
const input =
  sourcePath === '--assertions-only' ? undefined : registrySchema.parse(JSON.parse(readFileSync(sourcePath, 'utf8')));
const root = resolve(import.meta.dirname, '..');
const output = join(root, 'registry/shadcn-api-contracts');
mkdirSync(join(root, '.tmp'), { recursive: true });
const temporary = mkdtempSync(join(root, '.tmp/shadcn-api-'));
const chartLegendParameters = /(?<declaration>declare function ChartLegendContent)\(\{[^}]*\}:/u;
const COMPONENTS_PER_FIXTURE = 16;
const COMPONENT_NAME = /^[A-Z]/u;
const inferredElement =
  /import\("react"\)\.ReactElement<unknown, string \| import\("react"\)\.JSXElementConstructor<any>>/gu;

function normalizeParameterBindings(content: string, name: string) {
  return name === 'chart' ? content.replace(chartLegendParameters, '$<declaration>(props:') : content;
}

function normalizeDeclaration(content: string, name: string) {
  let result = content
    .replaceAll('import * as ', 'import type * as ')
    .replaceAll(inferredElement, 'ReturnType<typeof useRender>')
    .replaceAll('import("@base-ui/react").ToastManager<any>', 'ReturnType<typeof ToastPrimitive.createToastManager>');
  result = result.replaceAll(
    /(?<element>React\.ReactElement<unknown), string \| React\.JSXElementConstructor<any>>/gu,
    '$1>'
  );
  if (name === 'message-scroller') {
    for (const symbol of ['useMessageScroller', 'useMessageScrollerScrollable', 'useMessageScrollerVisibility']) {
      result = result.replaceAll(new RegExp(`\\b${symbol}\\b,?\\s*`, 'gu'), '');
    }
    result +=
      '\nexport { useMessageScroller, useMessageScrollerScrollable, useMessageScrollerVisibility } from "@shadcn/react/message-scroller";\n';
  }
  return normalizeParameterBindings(result, name);
}

try {
  const files = catalog.components.map(({ name }) => {
    if (input === undefined) {
      const declaration = join(output, `${name}.d.ts`);
      const content = readFileSync(declaration, 'utf8');
      const normalized = normalizeParameterBindings(content, name);
      if (content !== normalized) {
        writeFileSync(declaration, normalized);
      }
      return declaration;
    }
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
  const sharedImports = ["import { expectTypeOf } from 'expect-type';", "import type React from 'react';"];
  const sections: { imports: string[]; assertions: string[] }[] = [];
  for (const file of files) {
    const source = program.getSourceFile(file);
    if (source === undefined) {
      throw new Error(`Cannot parse ${file}`);
    }
    const name = basename(file, input === undefined ? '.d.ts' : '.tsx');
    const alias = name.replaceAll(/-(?<initial>[a-z])/gu, (_match, character: string) => character.toUpperCase());
    if (input !== undefined) {
      program.emit(source, (filename, content) => {
        if (basename(filename) === `${name}.d.ts`) {
          writeFileSync(join(output, `${name}.d.ts`), normalizeDeclaration(content, name));
        }
      });
    }
    const imports = [
      `import type * as ${alias}Official from './${name}';`,
      `import type * as ${alias}Local from '../base-nova/protoform/components/${name}';`,
    ];
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
    sections.push({ imports, assertions });
  }
  const fixtures: string[] = [];
  const groups = Math.ceil(sections.length / COMPONENTS_PER_FIXTURE);
  for (let group = 0; group < groups; group += 1) {
    const batch = sections.slice(group * COMPONENTS_PER_FIXTURE, (group + 1) * COMPONENTS_PER_FIXTURE);
    const fixture = join(output, `part-${group + 1}.typecheck.ts`);
    const imports = [...sharedImports, ...batch.flatMap((section) => section.imports)];
    const assertions = batch.map((section) => section.assertions.join('\n'));
    writeFileSync(fixture, `${imports.join('\n')}\n\n${assertions.join('\n\n')}\n`);
    fixtures.push(fixture);
  }
  const outputs = input === undefined ? fixtures : [output];
  execFileSync('bunx', ['--no-install', 'oxlint', '--config', '.oxlintrc.jsonc', '--fix', ...outputs], {
    cwd: root,
    stdio: 'inherit',
  });
  execFileSync('bunx', ['--no-install', 'biome', 'check', '--write', ...outputs], {
    cwd: root,
    stdio: 'inherit',
  });
} finally {
  rmSync(temporary, { force: true, recursive: true });
}
