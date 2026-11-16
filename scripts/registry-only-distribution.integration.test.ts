import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect } from '@rstest/core';
import { z } from 'zod';

const repositoryRoot = resolve(import.meta.dirname, '..');
const PROTOFORM_LICENSE_DEPENDENCY = '@protoform/protoform-license';
const PROTOFORM_LICENSE_TARGET = '~/LICENSES/protoform-MIT.txt';

interface RegistryItem {
  name: string;
  registryDependencies?: string[] | undefined;
}

describe('registry license distribution', () => {
  test('copies license notices with every installable registry item', () => {
    const registry = z
      .looseObject({
        items: z.array(
          z.looseObject({
            files: z
              .array(z.looseObject({ path: z.string(), target: z.string().optional(), type: z.string() }))
              .optional(),
            name: z.string(),
            registryDependencies: z.array(z.string()).optional(),
            type: z.string(),
          })
        ),
      })
      .parse(JSON.parse(readFileSync(resolve(repositoryRoot, 'registry.json'), 'utf8')));
    const itemsByName = new Map(registry.items.map((item) => [item.name, item]));
    const license = itemsByName.get('protoform-license');

    expect(license).toMatchObject({
      files: [
        {
          path: 'LICENSE',
          target: PROTOFORM_LICENSE_TARGET,
          type: 'registry:file',
        },
      ],
      type: 'registry:file',
    });

    function installsLicense(item: RegistryItem, visited = new Set<string>()): boolean {
      if (item.name === 'protoform-license') {
        return true;
      }
      if (visited.has(item.name)) {
        return false;
      }
      visited.add(item.name);

      return (item.registryDependencies ?? []).some((dependency) => {
        if (dependency === PROTOFORM_LICENSE_DEPENDENCY) {
          return true;
        }
        const dependencyName = dependency.startsWith('@protoform/')
          ? dependency.slice('@protoform/'.length)
          : undefined;
        const dependencyItem = dependencyName ? itemsByName.get(dependencyName) : undefined;
        return dependencyItem === undefined ? false : installsLicense(dependencyItem, new Set(visited));
      });
    }

    for (const item of registry.items) {
      expect(installsLicense(item), item.name).toBe(true);
    }
  });
});
