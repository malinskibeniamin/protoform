import { type ChildProcess, execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';

const processColumns = /\s+/u;

interface TestServer {
  args: string[];
  command: string;
  cwd?: string;
  timeout: number;
  url: string;
}

function liveGroupMembers(pid: number) {
  const processes = execFileSync('ps', ['-axo', 'pgid=,pid=,ppid=,uid=,stat=,comm='], {
    encoding: 'utf8',
    timeout: 2000,
  });
  return processes.split('\n').filter((line) => {
    const { 0: group, 4: state } = line.trim().split(processColumns);
    return Number(group) === pid && state !== undefined && !state.startsWith('Z');
  });
}

async function signalGroup(pid: number, signal: NodeJS.Signals | 0, deadline = Date.now() + 1000): Promise<boolean> {
  try {
    process.kill(-pid, signal);
    return true;
  } catch (error) {
    if (!(error instanceof Error && 'code' in error)) {
      throw error;
    }
    if (error.code === 'ESRCH') {
      return false;
    }
    if (error.code !== 'EPERM') {
      throw error;
    }
    const live = liveGroupMembers(pid);
    if (live.length === 0) {
      return false;
    }
    if (Date.now() >= deadline) {
      throw new Error(`${error.message}; live test-server group ${pid}: ${live.join('; ')}`, { cause: error });
    }
    await delay(50);
    return signalGroup(pid, signal, deadline);
  }
}

async function waitForGroupExit(pid: number, deadline: number): Promise<void> {
  if ((await signalGroup(pid, 0)) && Date.now() < deadline) {
    await delay(50);
    await waitForGroupExit(pid, deadline);
  }
}

async function stop(child: ChildProcess) {
  if (!child.pid) {
    return;
  }
  const exited = child.exitCode === null && child.signalCode === null ? once(child, 'exit') : Promise.resolve();
  await signalGroup(child.pid, 'SIGTERM');
  await waitForGroupExit(child.pid, Date.now() + 5000);
  await signalGroup(child.pid, 'SIGKILL');
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
  async function poll(): Promise<void> {
    if (Date.now() >= deadline) {
      throw new Error(`Test server ${server.url} did not become ready within ${server.timeout}ms`);
    }
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
    await poll();
  }
  await poll();
}

export async function startTestServers(servers: TestServer[], signal?: AbortSignal) {
  const children: ChildProcess[] = [];
  const close = async () => {
    await Promise.all(children.map(stop));
  };
  try {
    await servers.reduce<Promise<void>>(async (previous, server) => {
      await previous;
      if ((await isReady(server.url)) === true) {
        throw new Error(`Refusing to reuse an existing test server at ${server.url}`);
      }
      const child = spawn(server.command, server.args, { cwd: server.cwd, detached: true, stdio: 'inherit' });
      children.push(child);
      await waitForServer(child, server, signal);
    }, Promise.resolve());
    return close;
  } catch (error) {
    await close();
    throw error;
  }
}
