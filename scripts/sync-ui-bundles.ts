import { execFileSync } from 'node:child_process';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { registrySchema } from 'shadcn/schema';
import { z } from 'zod';

type Registry = z.infer<typeof registrySchema>;
const sourceFileExtension = /\.tsx?$/u;
const fallbackPackages = /^(?:recharts|react-is)(?:@|$)/u;
function assertRegistry(value: unknown): asserts value is Registry {
  registrySchema.parse(value);
}
const registryPath = new URL('../registry.json', import.meta.url);
const registry: unknown = JSON.parse(await readFile(registryPath, 'utf8'));
assertRegistry(registry);
const presentationDirectory = 'registry/base-nova/protoform/lib/presentation';
const presentation = registry.items.find((item) => item.name === 'protoform-ui-presentation');
if (presentation === undefined) {
  throw new Error('Missing shared UI presentation registry item');
}
const chartModules = new Set(['chart-recharts.tsx', 'chart-tanstack.tsx', 'chart-module.tsx']);
presentation.files = [
  ...(presentation.files ?? []).filter((file) => !file.path.startsWith(`${presentationDirectory}/`)),
  ...(await readdir(new URL(`../${presentationDirectory}`, import.meta.url)))
    .filter((name) => sourceFileExtension.test(name) && !chartModules.has(name))
    .toSorted()
    .map((name) => ({
      path: `${presentationDirectory}/${name}`,
      type: 'registry:ui' as const,
      target: `@ui/shared/${name}`,
    })),
];
const manifest = z
  .object({ dependencies: z.record(z.string(), z.string()) })
  .parse(JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')));
const version = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/u)
  .parse(manifest.dependencies['@tanstack/charts']);
for (const { name, directory, documentation, target } of [
  {
    name: 'protoform-shadcn',
    directory: 'registry/base-nova/protoform/components',
    documentation: 'SHADCN',
    target: '@ui',
  },
  {
    name: 'protoform-ui-sdk',
    directory: 'registry/ui-sdk/protoform/components',
    documentation: 'UI_SDK',
    target: '@ui/sdk',
  },
]) {
  const fallback = registry.items.find((item) => item.name === name);
  if (fallback === undefined) {
    throw new Error(`Missing ${name} fallback UI bundle`);
  }
  const root = 'registry/base-nova/protoform';
  const notices: NonNullable<Registry['items'][number]['files']> =
    name === 'protoform-ui-sdk'
      ? [
          {
            path: `${root}/UI_SDK_COMPONENTS.md`,
            type: 'registry:file',
            target: '~/LICENSES/protoform-ui-sdk-controls.md',
          },
        ]
      : [];
  const bundle = {
    ...structuredClone(fallback),
    name: `${name}-tanstack`,
    title: `${fallback.title ?? name} with TanStack Charts`,
    description: `${fallback.description ?? ''} Uses TanStack Charts instead of Recharts.`,
    registryDependencies: [
      ...(fallback.registryDependencies ?? []).filter(
        (dependency) => dependency !== '@protoform/protoform-recharts-presentation'
      ),
      '@protoform/protoform-tanstack-charts-presentation',
    ],
    dependencies: [
      ...(fallback.dependencies ?? []).filter((dependency) => !fallbackPackages.test(dependency)),
      `@tanstack/charts@${version}`,
    ],
    files: [
      ...(fallback.files ?? [])
        .filter((file) => file.path !== `${directory}/chart/index.tsx`)
        .map((file) =>
          file.path === `${root}/${documentation}_COMPONENTS.md`
            ? { ...file, path: `${root}/${documentation}_TANSTACK_COMPONENTS.md` }
            : file
        ),
      ...notices,
      {
        path: `${directory}/chart-tanstack/index.tsx`,
        type: 'registry:ui',
        target: `${target}/chart-tanstack/index.tsx`,
      },
    ],
  } satisfies Registry['items'][number];
  registrySchema.parse({ ...registry, items: [bundle] });
  const existing = registry.items.findIndex((item) => item.name === bundle.name);
  if (existing === -1) {
    registry.items.splice(registry.items.indexOf(fallback) + 1, 0, bundle);
  } else {
    registry.items[existing] = bundle;
  }
}
const content = execFileSync('bun', ['x', '--no-install', 'biome', 'format', '--stdin-file-path=registry.json'], {
  input: JSON.stringify(registry, null, 2),
  encoding: 'utf8',
});
if ((await readFile(registryPath, 'utf8')) !== content) {
  await writeFile(registryPath, content);
}
