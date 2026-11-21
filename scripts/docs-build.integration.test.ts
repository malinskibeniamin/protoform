import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { expect, test } from '@rstest/core';

const buildScript = resolve('scripts/build-docs.ts');

function fixture() {
  mkdirSync('.tmp', { recursive: true });
  const directory = mkdtempSync(resolve('.tmp/docs-build-test-'));
  writeFileSync(join(directory, '.gitignore'), 'dist/\n.tmp/\n.env*\n');
  writeFileSync(
    join(directory, 'package.json'),
    JSON.stringify({
      scripts: {
        'docs:blume:compile': 'node build.mjs',
        'docs:blume:build': `${JSON.stringify(process.execPath)} ${JSON.stringify(buildScript)}`,
        e2e: 'bun run nested',
        nested: 'bun run docs:blume:build',
      },
    })
  );
  for (const path of [
    'content/docs.mdx',
    'registry/control.ts',
    'public/r/control.json',
    'blume.config.ts',
    'bun.lock',
  ]) {
    mkdirSync(join(directory, path, '..'), { recursive: true });
    writeFileSync(join(directory, path), 'original');
  }
  writeFileSync(
    join(directory, 'build.mjs'),
    `
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
mkdirSync('.tmp', { recursive: true });
const count = existsSync('.tmp/count') ? Number(readFileSync('.tmp/count', 'utf8')) : 0;
writeFileSync('.tmp/count', String(count + 1));
mkdirSync('dist/assets', { recursive: true });
writeFileSync('dist/index.html', '<title>Built docs</title>');
writeFileSync('dist/llms.txt', 'Built docs');
writeFileSync('dist/assets/app.js', 'built application');
if (process.env['BUILD_MODE'] === 'fail') process.exit(23);
if (process.env['BUILD_MODE'] === 'mutate') writeFileSync('content/docs.mdx', 'changed during build');
`
  );
  const git = (args: string[]) => {
    const result = spawnSync('git', args, { cwd: directory, encoding: 'utf8' });
    expect(result.status, result.stderr).toBe(0);
  };
  git(['init', '--quiet']);
  git(['add', '.']);
  git(['-c', 'user.name=Docs build test', '-c', 'user.email=docs@example.test', 'commit', '--quiet', '-m', 'fixture']);
  return {
    directory,
    git,
    run: (env: NodeJS.ProcessEnv = {}) =>
      spawnSync(process.execPath, [buildScript], {
        cwd: directory,
        env: { ...process.env, ...env },
        encoding: 'utf8',
        timeout: 15_000,
      }),
    command: (script: string) =>
      spawnSync('bun', ['run', script], {
        cwd: directory,
        encoding: 'utf8',
        timeout: 15_000,
      }),
    count: () => Number(readFileSync(join(directory, '.tmp/count'), 'utf8')),
    close: () => rmSync(directory, { recursive: true, force: true }),
  };
}

test('builds missing standalone docs and reuses the complete unchanged artifact', () => {
  const docs = fixture();
  try {
    const first = docs.run();
    expect(first.status, first.stdout + first.stderr).toBe(0);
    const repeated = docs.run({ npm_lifecycle_event: 'build', npm_lifecycle_script: 'a different parent command' });
    expect(repeated.status, repeated.stdout + repeated.stderr).toBe(0);
    expect(docs.count()).toBe(1);
    expect(readFileSync(join(docs.directory, 'dist/assets/app.js'), 'utf8')).toBe('built application');
  } finally {
    docs.close();
  }
});

test('reuses the same artifact across nested E2E and final build script environments', () => {
  const docs = fixture();
  try {
    const e2e = docs.command('e2e');
    expect(e2e.status, e2e.stdout + e2e.stderr).toBe(0);
    const final = docs.command('docs:blume:build');
    expect(final.status, final.stdout + final.stderr).toBe(0);
    expect(docs.count()).toBe(1);
  } finally {
    docs.close();
  }
});

test.each([
  'content/docs.mdx',
  'registry/control.ts',
  'public/r/control.json',
  'blume.config.ts',
  'bun.lock',
  'untracked.ts',
  '.env.local',
])('rebuilds when dirty input %s changes without a new commit', (path) => {
  const docs = fixture();
  try {
    expect(docs.run().status).toBe(0);
    writeFileSync(join(docs.directory, path), 'changed');
    const rebuilt = docs.run();
    expect(rebuilt.status, rebuilt.stdout + rebuilt.stderr).toBe(0);
    expect(docs.count()).toBe(2);
  } finally {
    docs.close();
  }
});

test.each(['missing', 'corrupt', 'extra', 'receipt', 'missing-receipt', 'missing-directory'])(
  'rebuilds an artifact with %s output rather than trusting its receipt',
  (damage) => {
    const docs = fixture();
    try {
      expect(docs.run().status).toBe(0);
      const asset = join(docs.directory, 'dist/assets/app.js');
      if (damage === 'missing') {
        rmSync(asset);
      }
      if (damage === 'corrupt') {
        writeFileSync(asset, 'other application');
      }
      if (damage === 'extra') {
        writeFileSync(join(docs.directory, 'dist/extra.js'), 'unexpected');
      }
      if (damage === 'receipt') {
        writeFileSync(join(docs.directory, '.tmp/docs-build.json'), 'invalid JSON');
      }
      if (damage === 'missing-receipt') {
        rmSync(join(docs.directory, '.tmp/docs-build.json'));
      }
      if (damage === 'missing-directory') {
        rmSync(join(docs.directory, 'dist'), { recursive: true });
      }
      const rebuilt = docs.run();
      expect(rebuilt.status, rebuilt.stdout + rebuilt.stderr).toBe(0);
      expect(docs.count()).toBe(2);
      expect(readFileSync(asset, 'utf8')).toBe('built application');
      expect(existsSync(join(docs.directory, 'dist/extra.js'))).toBe(false);
    } finally {
      docs.close();
    }
  }
);

test('invalidates a new revision and changed build environment', () => {
  const docs = fixture();
  try {
    expect(docs.run().status).toBe(0);
    docs.git([
      '-c',
      'user.name=Docs build test',
      '-c',
      'user.email=docs@example.test',
      'commit',
      '--allow-empty',
      '--quiet',
      '-m',
      'new revision',
    ]);
    expect(docs.run().status).toBe(0);
    expect(docs.count()).toBe(2);
    expect(docs.run({ PROTOFORM_REACT_SCAN: '1' }).status).toBe(0);
    expect(docs.count()).toBe(3);
  } finally {
    docs.close();
  }
});

test('propagates build failures and never certifies their partial output', () => {
  const docs = fixture();
  try {
    expect(docs.run().status).toBe(0);
    expect(docs.run({ BUILD_MODE: 'fail' }).status).toBe(23);
    expect(existsSync(join(docs.directory, '.tmp/docs-build.json'))).toBe(false);
    expect(docs.run().status).toBe(0);
    expect(docs.count()).toBe(3);
  } finally {
    docs.close();
  }
});

test('rejects source changes during a successful build instead of sealing a mixed revision', () => {
  const docs = fixture();
  try {
    const changed = docs.run({ BUILD_MODE: 'mutate' });
    expect(changed.status).toBe(1);
    expect(changed.stdout + changed.stderr).toContain('Docs inputs changed during build');
    expect(existsSync(join(docs.directory, '.tmp/docs-build.json'))).toBe(false);
    expect(docs.run().status).toBe(0);
    expect(docs.count()).toBe(2);
  } finally {
    docs.close();
  }
});
