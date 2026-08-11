import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type RegistryItem = {
  dependencies?: string[];
  files?: Array<{ path: string }>;
  name: string;
  registryDependencies?: string[];
};

const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
  items: RegistryItem[];
};

function item(name: string): RegistryItem {
  const match = registry.items.find((candidate) => candidate.name === name);
  if (!match) {
    throw new Error(`Missing registry item: ${name}`);
  }
  return match;
}

function filePaths(registryItem: RegistryItem): string[] {
  return registryItem.files?.map((file) => file.path) ?? [];
}

describe('native form adapter registry entries', () => {
  it('keeps the shared AutoForm core independent from form engines', () => {
    const core = item('auto-form-core');

    expect(core.dependencies).not.toContain('react-hook-form');
    expect(core.dependencies).not.toContain('@tanstack/react-form');
    expect(filePaths(core)).not.toContain(
      'registry/base-nova/protoform/components/auto-form/adapters/react-hook-form.tsx'
    );
    expect(filePaths(core)).not.toContain(
      'registry/base-nova/protoform/components/auto-form/adapters/tanstack.tsx'
    );
    expect(filePaths(core)).not.toContain(
      'registry/base-nova/protoform/components/auto-form/adapters/tanstack-v2.tsx'
    );
  });

  it('ships React Hook Form as the default AutoForm adapter', () => {
    const reactHookForm = item('auto-form');

    expect(reactHookForm.registryDependencies).toEqual([
      '@protoform/auto-form-core',
      '@protoform/use-proto-form',
    ]);
    expect(reactHookForm.dependencies).toContain('react-hook-form');
    expect(filePaths(reactHookForm)).toContain(
      'registry/base-nova/protoform/components/auto-form/adapters/react-hook-form.tsx'
    );
  });

  it('ships TanStack Form without pulling React Hook Form', () => {
    const tanstackHook = item('use-proto-form-tanstack');
    const tanstackAutoForm = item('auto-form-tanstack');

    expect(tanstackHook.dependencies).toContain('@tanstack/react-form');
    expect(tanstackHook.dependencies).not.toContain('react-hook-form');
    expect(tanstackAutoForm.registryDependencies).toEqual([
      '@protoform/auto-form-core',
      '@protoform/use-proto-form-tanstack',
    ]);
    expect(tanstackAutoForm.dependencies).toContain('@tanstack/react-form');
    expect(tanstackAutoForm.dependencies).not.toContain('react-hook-form');
    expect(filePaths(tanstackAutoForm)).toContain(
      'registry/base-nova/protoform/components/auto-form/adapters/tanstack.tsx'
    );
  });

  it('ships TanStack Form v2 as separate experimental registry items', () => {
    const packageAlias =
      '@tanstack/react-form-v2@npm:@tanstack/react-form@2.0.0-alpha.0';
    const tanstackHook = item('use-proto-form-tanstack-v2');
    const tanstackAutoForm = item('auto-form-tanstack-v2');

    expect(tanstackHook.dependencies).toContain(packageAlias);
    expect(tanstackHook.dependencies).not.toContain('react-hook-form');
    expect(tanstackAutoForm.registryDependencies).toEqual([
      '@protoform/auto-form-core',
      '@protoform/use-proto-form-tanstack-v2',
    ]);
    expect(tanstackAutoForm.dependencies).toContain(packageAlias);
    expect(tanstackAutoForm.dependencies).not.toContain('react-hook-form');
    expect(filePaths(tanstackAutoForm)).toContain(
      'registry/base-nova/protoform/components/auto-form/adapters/tanstack-v2.tsx'
    );
  });
});
