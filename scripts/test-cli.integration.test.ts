import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { expect, test } from '@rstest/core';

const failures = [
  {
    name: 'behavior',
    source:
      "import { expect, test } from '@rstest/core'; test('deliberate behavior failure', () => { expect(1).toBe(2); });",
    message: 'deliberate behavior failure',
  },
  {
    name: 'hook',
    source:
      "import { beforeAll, test } from '@rstest/core'; beforeAll(() => { throw new Error('deliberate hook failure'); }); test('unreached', () => {});",
    message: 'deliberate hook failure',
  },
  {
    name: 'collection',
    source: "throw new Error('deliberate collection failure');",
    message: 'deliberate collection failure',
  },
];

test.each(failures)('propagates $name failures through the real runner CLI', async ({ source, message }) => {
  const directory = await mkdtemp(resolve('.tmp/runner-cli-'));
  try {
    await writeFile(join(directory, 'fixture.test.ts'), source);
    const config = join(directory, 'rstest.config.mjs');
    await writeFile(
      config,
      `export default { root: ${JSON.stringify(directory)}, include: ['fixture.test.ts'], pool: { maxWorkers: 1 }, testEnvironment: 'node' };`
    );
    const result = spawnSync(
      process.execPath,
      ['scripts/run-tests.mjs', 'node', '--config', config, '--reporters', 'dot'],
      {
        encoding: 'utf8',
        timeout: 20_000,
      }
    );
    expect(result.status, `${result.stdout}${result.stderr}`).toBe(1);
    expect(`${result.stdout}${result.stderr}`).toContain(message);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('rejects unknown suites before running tests', () => {
  const result = spawnSync(process.execPath, ['scripts/run-tests.mjs', 'not-a-suite'], { encoding: 'utf8' });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('Unknown test suite: not-a-suite');
});

test('reports SIGINT as an interrupted run, not success or an assertion failure', { timeout: 20_000 }, async () => {
  const directory = await mkdtemp(resolve('.tmp/runner-cli-signal-'));
  const ready = join(directory, 'ready');
  await writeFile(
    join(directory, 'fixture.test.ts'),
    `import { writeFileSync } from 'node:fs'; import { test } from '@rstest/core'; test('interrupted', async () => { writeFileSync(${JSON.stringify(ready)}, 'ready'); await new Promise(() => {}); });`
  );
  const config = join(directory, 'rstest.config.mjs');
  await writeFile(
    config,
    `export default { root: ${JSON.stringify(directory)}, include: ['fixture.test.ts'], pool: { maxWorkers: 1 }, testEnvironment: 'node', testTimeout: 15000 };`
  );
  const runner = spawn(process.execPath, ['scripts/run-tests.mjs', 'node', '--config', config], { stdio: 'pipe' });
  const exited = once(runner, 'exit');
  try {
    await expect.poll(() => existsSync(ready), { timeout: 5000 }).toBe(true);
    runner.kill('SIGINT');
    const [code, signal] = await exited;
    expect(signal).toBe(null);
    expect(code).toBe(130);
  } finally {
    if (runner.exitCode === null && runner.signalCode === null) {
      runner.kill('SIGTERM');
      await exited;
    }
    await rm(directory, { recursive: true, force: true });
  }
});
