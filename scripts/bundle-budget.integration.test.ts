import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
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

describe('bundle budgets', () => {
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
