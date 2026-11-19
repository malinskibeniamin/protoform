import { afterAll, beforeAll, describe, expect, test } from '@rstest/core';
import { startTestServers } from './test-servers';

function terminate(pid: number) {
  try {
    process.kill(pid, 'SIGKILL');
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ESRCH')) {
      throw error;
    }
  }
}

test('starts a real server and closes it after the run', async () => {
  const url = 'http://127.0.0.1:55129';
  const close = await startTestServers([
    {
      command: process.execPath,
      args: ['-e', 'require("node:http").createServer((_, r) => r.end("ready")).listen(55129, "127.0.0.1")'],
      url,
      timeout: 5000,
    },
  ]);
  const response1 = await fetch(url);
  expect(await response1.text()).toBe('ready');
  await close();
  await expect(fetch(url)).rejects.toThrow();
});

test('rejects failed startup without leaving earlier servers alive', async () => {
  await expect(
    startTestServers([
      {
        command: process.execPath,
        args: ['-e', 'require("node:http").createServer((_, r) => r.end("ready")).listen(55129, "127.0.0.1")'],
        url: 'http://127.0.0.1:55129',
        timeout: 5000,
      },
      { command: process.execPath, args: ['-e', 'process.exit(7)'], url: 'http://127.0.0.1:55130', timeout: 5000 },
    ])
  ).rejects.toThrow('exited');
  await expect(fetch('http://127.0.0.1:55129')).rejects.toThrow();
});

describe('process-group cleanup', () => {
  const url = 'http://127.0.0.1:55131';
  let descendantPid: number | undefined;
  beforeAll(async () => {
    const descendant =
      'process.on("SIGTERM", () => {}); require("node:http").createServer((_, r) => r.end(String(process.pid))).listen(55131, "127.0.0.1")';
    const close = await startTestServers([
      {
        command: process.execPath,
        args: [
          '-e',
          `require("node:child_process").spawn(process.execPath, ['-e', ${JSON.stringify(descendant)}], { stdio: 'inherit' }); setInterval(() => {}, 1000)`,
        ],
        url,
        timeout: 5000,
      },
    ]);
    const response2 = await fetch(url);
    descendantPid = Number(await response2.text());
    await close();
  }, 15_000);

  afterAll(() => {
    if (descendantPid !== undefined) {
      terminate(descendantPid);
    }
  });

  test('closes descendants even when their parent exits first during shutdown', async () => {
    await expect(fetch(url)).rejects.toThrow();
  });
});
