import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect } from '@rstest/core';

const repositoryDirectory = new URL('../', import.meta.url);
const excludedDirectories = new Set([
  '.blume',
  '.blume-verify',
  '.context',
  '.git',
  '.tmp',
  'artifacts',
  'coverage',
  'dist',
  'node_modules',
  'test-results',
]);
const sourceExtensions = new Set(['.json', '.md', '.mdx', '.proto', '.ts', '.tsx']);
const removedControlNames = [
  ['secret', 'selector'].join(''),
  ['secret', 'selector'].join('-'),
  ['secret', 'selector'].join('_'),
];

function findSourceFiles(directory: URL): URL[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && (excludedDirectories.has(entry.name) || entry.name.startsWith('shadcn-lint-test-'))) {
      return [];
    }

    const entryUrl = new URL(entry.name, directory);
    if (entry.isDirectory()) {
      return findSourceFiles(new URL(`${entry.name}/`, directory));
    }

    return sourceExtensions.has(extname(entry.name)) ? [entryUrl] : [];
  });
}

describe('removed controls', () => {
  test('ignores transient shadcn lint fixtures inside registry', () => {
    const directory = mkdtempSync(join(tmpdir(), 'removed-control-test-'));
    try {
      const components = join(directory, 'registry/base-nova/protoform/components');
      const fixture = join(components, 'shadcn-lint-test-123');
      mkdirSync(fixture, { recursive: true });
      writeFileSync(join(fixture, 'index.tsx'), 'export const fixture = true;');
      writeFileSync(join(components, 'real.tsx'), 'export const real = true;');

      expect(findSourceFiles(pathToFileURL(`${directory}/`)).map((file) => file.pathname)).toEqual([
        `${components}/real.tsx`,
      ]);
    } finally {
      rmSync(directory, { force: true, recursive: true });
    }
  });

  test('does not publish the removed control in source or registry artifacts', () => {
    const matches = findSourceFiles(repositoryDirectory).flatMap((file) => {
      const normalized = readFileSync(file, 'utf8').toLowerCase();
      return removedControlNames.some((name) => normalized.includes(name))
        ? [file.pathname.slice(repositoryDirectory.pathname.length)]
        : [];
    });

    expect(matches).toEqual([]);
  });
});
