import { expect } from '@rstest/playwright';
import { verifyAgentWorkbench } from './agent-workbench-journey';
import { reliabilityBaseURL } from './e2e-context';
import { test } from './e2e-test';

test('installed SDK enhancement honors its opt-in safety boundary without registering WebMCP', async ({ page }) => {
  await page.addInitScript(() => {
    const registrations: string[] = [];
    Reflect.set(globalThis.window, 'agentTestRegistrations', registrations);
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: {
        registerTool(tool: { name: string }) {
          registrations.push(tool.name);
        },
      },
    });
  });
  await page.goto(`${reliabilityBaseURL}/agent.html`);
  await verifyAgentWorkbench(page);
  expect(await page.evaluate((): unknown => Reflect.get(globalThis.window, 'agentTestRegistrations'))).toEqual([]);
});
