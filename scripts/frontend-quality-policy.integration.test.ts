import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect } from '@rstest/core';
import { z } from 'zod';

const manifest = z
  .looseObject({ devDependencies: z.record(z.string(), z.string()), scripts: z.record(z.string(), z.string()) })
  .parse(JSON.parse(readFileSync('package.json', 'utf8')));
const tsconfig = z
  .looseObject({ compilerOptions: z.record(z.string(), z.unknown()), exclude: z.array(z.string()).optional() })
  .parse(JSON.parse(readFileSync('tsconfig.json', 'utf8')));
const testTsconfig = z
  .looseObject({ exclude: z.array(z.string()).optional(), include: z.array(z.string()).optional() })
  .parse(JSON.parse(readFileSync('tsconfig.tests.json', 'utf8')));
const biomeConfig = readFileSync('biome.jsonc', 'utf8');

describe('frontend quality policy', () => {
  test('uses the Rust compiler with every practical strictness flag', () => {
    expect(manifest.devDependencies['tsrs']).toBeDefined();
    expect(manifest.devDependencies['@typescript/native']).toBeUndefined();
    expect(manifest.scripts['typecheck:source']).toBe('tsrs --noEmit');
    expect(tsconfig.compilerOptions).toMatchObject({
      allowUnreachableCode: false,
      allowUnusedLabels: false,
      exactOptionalPropertyTypes: true,
      noPropertyAccessFromIndexSignature: true,
      noUncheckedIndexedAccess: true,
      noUncheckedSideEffectImports: true,
      skipLibCheck: true,
      strict: true,
    });
  });

  test('typechecks every authored test with the strict project settings', () => {
    expect(manifest.scripts['typecheck:tests']).toBe('tsrs --project tsconfig.tests.json --noEmit');
    expect(manifest.scripts['typecheck']).toContain('bun run typecheck:source');
    expect(existsSync('tsconfig.tests.json')).toBe(true);
    expect(testTsconfig.include).toEqual(
      expect.arrayContaining(['conformance/**/*.ts', 'e2e/**/*.ts', '**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts'])
    );
    expect(testTsconfig.exclude ?? []).not.toEqual(
      expect.arrayContaining(['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'])
    );
  });

  test('rejects invalid authored tests through the primary strict compiler program', { timeout: 60_000 }, () => {
    const directory = mkdtempSync(resolve('scripts/typecheck-probe-'));
    const fixture = resolve(directory, 'probe.test.ts');
    const run = () =>
      spawnSync('bun', ['run', 'typecheck:source', '--incremental', 'false', '--pretty', 'false'], {
        encoding: 'utf8',
        timeout: 20_000,
      });
    try {
      writeFileSync(fixture, 'export const value: string = 123;\n');
      const primary = run();
      expect(primary.error).toBeUndefined();
      expect(primary.status).toBe(2);
      expect(primary.stdout + primary.stderr).toContain('TS2322');

      writeFileSync(fixture, "export const value: string = 'valid';\n");
      const valid = run();
      expect(valid.error).toBeUndefined();
      expect(valid.status, valid.stdout + valid.stderr).toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  test('typechecks every tracked authored TypeScript file', () => {
    expect(manifest.scripts['typecheck:coverage']).toBe('bun run scripts/check-typescript-coverage.ts');
    expect(manifest.scripts['typecheck']).toContain('bun run typecheck:coverage');

    const result = spawnSync('bun', ['run', 'typecheck:coverage'], { encoding: 'utf8' });
    expect(result.status, `${result.stdout}${result.stderr}`).toBe(0);
  });

  test('fails documentation typechecks on every diagnostic severity', () => {
    expect(manifest.scripts['docs:blume:check']).toBe('bun run scripts/check-docs-types.ts');
    expect(manifest.scripts['typecheck']).toContain('bun run docs:blume:check');
    expect(existsSync('scripts/check-docs-types.ts')).toBe(true);
  });

  test('checks authored installable registry source', () => {
    expect(tsconfig.exclude ?? []).not.toContain('registry/base-nova');
    expect(biomeConfig).not.toContain('"!registry"');
    expect(biomeConfig).not.toMatch(/"includes": \["registry\/\*\*"\][\s\S]*?"enabled": false/u);
    expect(biomeConfig).toContain('"ultracite/biome/type-aware"');
    expect(biomeConfig).not.toContain('"ultracite/biome/jest"');
  });

  test('fails on warnings, formatting drift, and inline suppressions', () => {
    expect(manifest.scripts['lint']).toContain('--error-on-warnings');
    expect(manifest.scripts['format:check']).toBe('biome format . && bun run format:extra');
    expect(manifest.scripts['lint:no-suppressions']).toBe('bun run scripts/check-no-suppressions.ts');
    expect(existsSync('scripts/check-no-suppressions.ts')).toBe(true);
    expect(manifest.scripts['ci:gate']).toContain('bun run lint:no-suppressions');
    expect(manifest.scripts['quality:gate']).toContain('bun run lint:no-suppressions');
  });

  test('runs a full warning-blocking React Doctor gate', () => {
    expect(manifest.devDependencies['react-doctor']).toBeDefined();
    expect(manifest.scripts['doctor']).toContain('--scope full');
    expect(manifest.scripts['doctor']).toContain('--blocking warning');
    expect(manifest.scripts['doctor:strict']).toBe('bun run doctor');
    expect(manifest.scripts['ci:gate']).toContain('bun run doctor:strict');
    expect(manifest.scripts['quality:gate']).toContain('bun run doctor:strict');
    expect(existsSync('doctor.config.ts')).toBe(true);
  });
});
