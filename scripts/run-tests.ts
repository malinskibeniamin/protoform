import { type ChildProcess, spawn, spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startTestServers } from './test-servers.ts';

const configs = {
  browser: 'rstest.browser.config.ts',
  e2e: 'rstest.e2e.config.ts',
  canary: 'rstest.canary.config.ts',
  host: 'rstest.host-registry.config.ts',
  conformance: 'rstest.conformance.config.ts',
  integration: 'rstest.config.ts',
  node: 'rstest.node.config.ts',
  dom: 'rstest.dom.config.ts',
};

const [suite, ...args] = process.argv.slice(2);
function isSuite(value: string | undefined): value is keyof typeof configs {
  return value !== undefined && Object.hasOwn(configs, value);
}

const config = isSuite(suite) ? configs[suite] : undefined;

if (!config) {
  console.error(`Unknown test suite: ${suite ?? 'missing'}.`);
  process.exit(1);
}
const needsServers =
  (suite === 'e2e' || suite === 'host') && !args.some((arg) => ['--help', '-h', 'list'].includes(arg));
if (args.includes('--update') || args.includes('-u')) {
  process.env['PROTOFORM_UPDATE_SCREENSHOTS'] = 'true';
}
const controller = new AbortController();
let runner: ChildProcess | undefined;
let close: () => Promise<void> = async () => undefined;
const handleSignal = (signal: NodeJS.Signals) => {
  controller.abort(new Error(`Test run interrupted by ${signal}`));
  runner?.kill(signal);
  process.exitCode = signal === 'SIGINT' ? 130 : 143;
};
process.once('SIGINT', handleSignal);
process.once('SIGTERM', handleSignal);
try {
  if (needsServers || suite === 'canary') {
    const build = spawnSync(
      'bun',
      ['build', 'scripts/e2e-accessibility.ts', '--target=browser', '--outfile=.tmp/e2e/accessibility.js'],
      { stdio: 'inherit' }
    );
    if (build.status !== 0) {
      throw new Error('Could not build E2E accessibility helper');
    }
  }
  if (needsServers) {
    const { hostBaseURL, reliabilityBaseURL } = await import('./e2e-context.ts');
    close = await startTestServers(
      suite === 'e2e'
        ? [
            { command: 'bun', args: ['run', 'docs:blume:e2e'], url: 'http://127.0.0.1:55013/docs', timeout: 120_000 },
            { command: 'bun', args: ['run', 'examples:server'], url: 'http://127.0.0.1:55012/health', timeout: 60_000 },
          ]
        : [
            {
              command: 'bun',
              args: ['x', '--no-install', 'vite', '--host', '127.0.0.1', '--port', new URL(hostBaseURL).port],
              cwd: '.tmp/host-consumer-fixture',
              url: hostBaseURL,
              timeout: 60_000,
            },
            {
              command: 'bun',
              args: ['x', '--no-install', 'vite', '--host', '127.0.0.1', '--port', new URL(reliabilityBaseURL).port],
              cwd: '.tmp/consumer-fixture',
              url: reliabilityBaseURL,
              timeout: 60_000,
            },
          ],
      controller.signal
    );
  }
  controller.signal.throwIfAborted();
  const cli = join(dirname(fileURLToPath(import.meta.resolve('@rstest/core/package.json'))), 'bin/rstest.js');
  const customConfig = args.some((arg) => ['--config', '-c'].includes(arg) || arg.startsWith('--config='));
  const child = spawn(process.execPath, [cli, ...(customConfig ? [] : ['--config', config]), ...args], {
    stdio: 'inherit',
  });
  runner = child;
  process.exitCode = await new Promise<number>((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code) => resolve(code ?? 1));
  });
} catch (error) {
  if (!controller.signal.aborted) {
    throw error;
  }
  console.error(controller.signal.reason);
} finally {
  await close();
  process.off('SIGINT', handleSignal);
  process.off('SIGTERM', handleSignal);
}
