import { type ChildProcess, spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';

interface TestServer {
  args: string[];
  command: string;
  cwd?: string;
  timeout: number;
  url: string;
}

function signalGroup(pid: number, signal: NodeJS.Signals | 0) {
  try {
    process.kill(-pid, signal);
    return true;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ESRCH') {
      return false;
    }
    throw error;
  }
}

async function stop(child: ChildProcess) {
  if (!child.pid) {
    return;
  }
  const exited = child.exitCode === null && child.signalCode === null ? once(child, 'exit') : Promise.resolve();
  signalGroup(child.pid, 'SIGTERM');
  const deadline = Date.now() + 5000;
  while (signalGroup(child.pid, 0) && Date.now() < deadline) {
    await delay(50);
  }
  signalGroup(child.pid, 'SIGKILL');
  await exited;
}

async function isReady(url: string) {
  try {
    return (await fetch(url, { signal: AbortSignal.timeout(500) })).ok;
  } catch (error) {
    return { error };
  }
}

async function waitForServer(child: ChildProcess, server: TestServer, signal?: AbortSignal) {
  const deadline = Date.now() + server.timeout;
  let failure: unknown;
  child.on('error', (error) => {
    failure = error;
  });
  while (Date.now() < deadline) {
    signal?.throwIfAborted();
    if (failure || child.exitCode !== null || child.signalCode !== null) {
      throw new Error(`Test server ${server.url} exited before readiness (${child.exitCode ?? child.signalCode})`, {
        cause: failure,
      });
    }
    const ready = await isReady(server.url);
    if (ready === true) {
      return;
    }
    await delay(100, undefined, signal ? { signal } : undefined);
  }
  throw new Error(`Test server ${server.url} did not become ready within ${server.timeout}ms`);
}

export async function startTestServers(servers: TestServer[], signal?: AbortSignal) {
  const children: ChildProcess[] = [];
  const close = async () => {
    await Promise.all(children.map(stop));
  };
  try {
    for (const server of servers) {
      if ((await isReady(server.url)) === true) {
        throw new Error(`Refusing to reuse an existing test server at ${server.url}`);
      }
      const child = spawn(server.command, server.args, { cwd: server.cwd, detached: true, stdio: 'inherit' });
      children.push(child);
      await waitForServer(child, server, signal);
    }
    return close;
  } catch (error) {
    await close();
    throw error;
  }
}
