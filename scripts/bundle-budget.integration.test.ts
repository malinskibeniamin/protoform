import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect } from '@rstest/core';

const external = [
  '@bufbuild/*',
  '@connectrpc/*',
  '@hookform/*',
  '@standard-schema/*',
  '@tanstack/*',
  '@/registry/*',
  'lucide-react',
  'react',
  'react-dom',
  'react-hook-form',
];

const entries = [
  {
    budget: 2500,
    entry: 'registry/base-nova/protoform/lib/core/index.ts',
    name: 'core',
  },
  {
    budget: 136_000,
    entry: 'registry/base-nova/protoform/lib/protobuf-provider/index.ts',
    name: 'protobuf',
  },
  {
    budget: 30_000,
    entry: 'registry/base-nova/protoform/hooks/use-proto-form/index.ts',
    name: 'react',
  },
  {
    budget: 130_000,
    entry: 'islands/ServerErrorFormExample.tsx',
    name: 'server-error example',
  },
] as const;

const consumerEntries = [
  { asyncBudget: 0, entry: 'host.tsx', initialBudget: 265_000, name: 'host', totalBudget: 265_000 },
  { asyncBudget: 180_000, entry: 'index.tsx', initialBudget: 490_000, name: 'default UI', totalBudget: 670_000 },
] as const;

describe('bundle budgets', () => {
  test.each(consumerEntries)('bounds complete $name payloads without externalizing dependencies', async (entry) => {
    const { build } = await import('vite');
    mkdirSync('.tmp', { recursive: true });
    const directory = mkdtempSync(resolve('.tmp/consumer-payload-'));
    const fixture = resolve(directory, 'entry.ts');
    const chunks: {
      dynamicImports: string[];
      gzip: number;
      initial: boolean;
      imports: string[];
      modules: string[];
      name: string;
    }[] = [];
    writeFileSync(
      fixture,
      `export { AutoForm } from ${JSON.stringify(resolve('registry/base-nova/protoform/components/auto-form', entry.entry))};`
    );
    try {
      await build({
        configFile: false,
        define: { 'process.env.NODE_ENV': '"production"' },
        logLevel: 'silent',
        resolve: {
          alias: [
            { find: '@/components/ui', replacement: resolve('registry/base-nova/protoform/components') },
            { find: '@', replacement: resolve('.') },
          ],
        },
        plugins: [
          {
            name: 'consumer-payload-budget',
            generateBundle(_options, bundle) {
              for (const output of Object.values(bundle)) {
                if (output.type === 'chunk') {
                  chunks.push({
                    dynamicImports: output.dynamicImports,
                    gzip: gzipSync(output.code).byteLength,
                    initial: output.isEntry,
                    imports: output.imports,
                    modules: Object.entries(output.modules)
                      .filter(([, module]) => module.renderedLength > 0)
                      .map(([file]) => file),
                    name: output.fileName,
                  });
                }
              }
            },
          },
        ],
        build: {
          cssCodeSplit: true,
          lib: { entry: fixture, formats: ['es'] },
          minify: true,
          reportCompressedSize: false,
          write: false,
        },
      });
    } finally {
      rmSync(directory, { force: true, recursive: true });
    }
    const initialChunks = new Set<string>();
    const visit = (name: string) => {
      if (initialChunks.has(name)) {
        return;
      }
      initialChunks.add(name);
      const chunk = chunks.find((candidate) => candidate.name === name);
      if (chunk === undefined) {
        throw new Error(`Unbudgeted external import: ${name}`);
      }
      for (const dependency of chunk.imports) {
        visit(dependency);
      }
    };
    for (const chunk of chunks) {
      if (chunk.initial) {
        visit(chunk.name);
      }
    }
    const initial = chunks.filter((chunk) => initialChunks.has(chunk.name));
    const deferred = chunks.filter((chunk) => !initialChunks.has(chunk.name));
    const sum = (values: typeof chunks) => values.reduce((bytes, chunk) => bytes + chunk.gzip, 0);
    const initialModules = initial.flatMap((chunk) => chunk.modules);
    expect(
      chunks
        .flatMap((chunk) => [...chunk.imports, ...chunk.dynamicImports])
        .filter((name) => chunks.every((chunk) => chunk.name !== name))
    ).toEqual([]);
    expect(initial.some((chunk) => chunk.modules.some((file) => file.endsWith(`/auto-form/${entry.entry}`)))).toBe(
      true
    );
    expect(initialModules.some((file) => file.includes('/node_modules/react/'))).toBe(true);
    expect(
      initialModules.filter((file) => /\/node_modules\/(?:@codemirror|@uiw\/react-codemirror)\//u.test(file))
    ).toEqual([]);
    expect(sum(initial)).toBeLessThanOrEqual(entry.initialBudget);
    expect(sum(deferred)).toBeLessThanOrEqual(entry.asyncBudget);
    expect(sum(chunks)).toBeLessThanOrEqual(entry.totalBudget);
    expect(
      chunks
        .flatMap((chunk) => chunk.modules)
        .filter((file) => /\/node_modules\/(?:recharts|formik|react-final-form|@tanstack\/react-form)\//u.test(file))
    ).toEqual([]);
    expect(deferred.some((chunk) => chunk.modules.some((file) => file.includes('/node_modules/@codemirror/')))).toBe(
      entry.name === 'default UI'
    );
  });

  test('keeps the headless configuration inspector independent of rendering runtimes', async () => {
    const { build } = await import('vite');
    const modules: string[] = [];
    let compressedBytes = 0;
    await build({
      configFile: false,
      logLevel: 'silent',
      resolve: { alias: { '@': resolve('.') } },
      plugins: [
        {
          name: 'inspect-configuration-dependencies',
          generateBundle(_options, bundle) {
            for (const output of Object.values(bundle)) {
              if (output.type !== 'chunk') {
                continue;
              }
              compressedBytes += gzipSync(output.code).byteLength;
              modules.push(
                ...Object.entries(output.modules)
                  .filter(([, module]) => module.renderedLength > 0)
                  .map(([file]) => file)
              );
            }
          },
        },
      ],
      build: {
        lib: { entry: 'registry/base-nova/protoform/components/auto-form/configuration.ts', formats: ['es'] },
        minify: true,
        reportCompressedSize: false,
        write: false,
      },
    });
    expect(modules.some((file) => file.endsWith('/auto-form/configuration.ts'))).toBe(true);
    expect(modules.filter((file) => /\/auto-form\/fields\/.*\.tsx$/u.test(file))).toEqual([]);
    expect(
      modules.filter((file) => /\/node_modules\/(?:date-fns|lucide-react|motion|framer-motion|react)\//u.test(file))
    ).toEqual([]);
    expect(compressedBytes).toBeLessThan(160_000);
  });

  test('enforces registry runtime and example budgets', () => {
    const outputDirectory = '.tmp/bundle-budget';
    rmSync(outputDirectory, { force: true, recursive: true });
    mkdirSync(outputDirectory, { recursive: true });
    const bundles = entries.map(({ entry, ...definition }) => {
      const output = `${outputDirectory}/${definition.name.replaceAll(' ', '-')}.js`;
      execFileSync('bun', [
        'build',
        entry,
        '--target=browser',
        '--format=esm',
        '--minify',
        `--outfile=${output}`,
        ...external.map((dependency) => `--external=${dependency}`),
      ]);
      return {
        ...definition,
        size: statSync(output).size,
        text: readFileSync(output, 'utf8'),
      };
    });

    for (const bundle of bundles) {
      expect(bundle.size, `${bundle.name} exceeded ${bundle.budget} bytes`).toBeLessThanOrEqual(bundle.budget);
    }
    for (const name of ['core', 'protobuf']) {
      const text = bundles.find((bundle) => bundle.name === name)?.text ?? '';
      expect(text).not.toContain('react-hook-form');
      expect(text).not.toContain('@tanstack/react-form');
    }
    expect(bundles.find((bundle) => bundle.name === 'react')?.text).not.toContain('@tanstack/react-form');
  });
});
