import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@rstest/core';

function probe() {
  return spawnSync('bun', ['run', 'scripts/check-test-policy.ts'], { encoding: 'utf8' });
}

test('discovers test helpers and rejects native runner replacements, retries, and recorder polling', () => {
  const directory = mkdtempSync(join('scripts', 'test-policy-probe-'));
  const file = join(directory, 'e2e.test-utils.ts');
  const imports = "import { rstest as runner } from '@rstest/core';\nimport { mock as recorder } from 'bun:test';";
  try {
    writeFileSync(
      file,
      `${imports}
runner.fn(() => 'replacement');
runner.mock('./dependency', () => ({}));
runner.mockObject(console);
runner.importMock('./dependency');
runner.requireMock('./dependency');
recorder(() => 'replacement');
recorder.module('./dependency', () => ({}));
runner.setConfig({ retry: 1, testTimeout: 60000 });
runner.waitFor(() => expect(recorder.mock.calls).toHaveLength(1));
`
    );
    const rejected = probe();
    expect(rejected.status, rejected.stderr).toBe(1);
    expect(rejected.stderr).toContain(file);
    expect(rejected.stderr.match(/spies must only observe/gu)).toHaveLength(7);
    expect(rejected.stderr).toContain('do not set retry or testTimeout inside tests');
    expect(rejected.stderr).toContain('instead of polling recorded calls');

    writeFileSync(
      file,
      `${imports}
runner.fn();
runner.fn(undefined);
runner.mock('./dependency', { spy: true });
runner.mockObject(console, { spy: true });
runner.spyOn(console, 'info');
recorder();
`
    );
    const accepted = probe();
    expect(accepted.status, accepted.stderr).toBe(0);
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test('requires a clear implementation owner outside package src directories', () => {
  const directory = mkdtempSync(join('scripts', 'test-owner-probe-'));
  const owner = join(directory, 'components', 'feature');
  const detached = join(directory, 'subject.test.ts');
  const colocated = join(owner, 'subject.test.ts');
  try {
    mkdirSync(owner, { recursive: true });
    writeFileSync(join(owner, 'subject.ts'), 'export const value = 1;\n');
    writeFileSync(detached, "import { value } from './components/feature/subject';\nexport const checked = value;\n");
    const rejected = probe();
    expect(rejected.status, rejected.stderr).toBe(1);
    expect(rejected.stderr).toContain(`colocate this test with its implementation in ${owner}`);

    renameSync(detached, colocated);
    writeFileSync(colocated, "import { value } from './subject';\nexport const checked = value;\n");
    const accepted = probe();
    expect(accepted.status, accepted.stderr).toBe(0);
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});
