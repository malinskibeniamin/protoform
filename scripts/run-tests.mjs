import { runCLI } from "@rstest/core";

const configs = {
  browser: "rstest.browser.config.ts",
  conformance: "rstest.conformance.config.ts",
  integration: "rstest.integration.config.ts",
  unit: "rstest.unit.config.ts",
};

const [, , suite, ...args] = process.argv;
const config = suite ? configs[suite] : undefined;

if (!config) {
  console.error(`Unknown test suite: ${suite ?? "missing"}.`);
  process.exit(1);
}

runCLI({ argv: [process.execPath, "rstest", "--config", config, ...args] });
