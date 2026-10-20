import { runCLI } from '@rstest/core/api';

const configs = {
  browser: 'rstest.browser.config.ts',
  conformance: 'rstest.conformance.config.ts',
  integration: 'rstest.integration.config.ts',
  unit: 'rstest.unit.config.ts',
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

runCLI({ argv: [process.execPath, 'rstest', '--config', config, ...args] });
