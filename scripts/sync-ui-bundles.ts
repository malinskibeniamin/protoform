import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { registrySchema } from 'shadcn/schema';
import { z } from 'zod';

type Registry = z.infer<typeof registrySchema>;
const fallbackPackages = /^(?:recharts|react-is)(?:@|$)/u;

function assertRegistry(value: unknown): asserts value is Registry {
  registrySchema.parse(value);
}

const registryPath = new URL('../registry.json', import.meta.url);
const registry: unknown = JSON.parse(await readFile(registryPath, 'utf8'));
assertRegistry(registry);
const fallback = registry.items.find((item) => item.name === 'protoform-shadcn');
if (fallback === undefined) {
  throw new Error('Missing Recharts fallback UI bundle');
}
const manifest = z
  .object({ dependencies: z.record(z.string(), z.string()) })
  .parse(JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')));
const version = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/u)
  .parse(manifest.dependencies['@tanstack/charts']);
const bundle = {
  ...structuredClone(fallback),
  name: 'protoform-shadcn-tanstack',
  title: 'Protoform UI with TanStack Charts',
  description: 'Recommended full UI bundle with native TanStack Charts. Installs no Recharts code or dependency.',
  dependencies: [
    ...(fallback.dependencies ?? []).filter((dependency) => !fallbackPackages.test(dependency)),
    `@tanstack/charts@${version}`,
  ],
  files: [
    ...(fallback.files ?? [])
      .filter((file) => file.path !== 'registry/base-nova/protoform/components/chart/index.tsx')
      .map((file) =>
        file.path === 'registry/base-nova/protoform/SHADCN_COMPONENTS.md'
          ? { ...file, path: 'registry/base-nova/protoform/SHADCN_TANSTACK_COMPONENTS.md' }
          : file
      ),
    {
      path: 'registry/base-nova/protoform/components/chart-tanstack/index.tsx',
      type: 'registry:ui',
      target: '~/components/ui/chart-tanstack/index.tsx',
    },
    {
      path: 'registry/base-nova/protoform/components/chart-tanstack/chart-module.tsx',
      type: 'registry:ui',
      target: '~/components/ui/chart-tanstack/chart-module.tsx',
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
const content = execFileSync('bun', ['x', '--no-install', 'biome', 'format', '--stdin-file-path=registry.json'], {
  input: JSON.stringify(registry, null, 2),
  encoding: 'utf8',
});
if ((await readFile(registryPath, 'utf8')) !== content) {
  await writeFile(registryPath, content);
}
