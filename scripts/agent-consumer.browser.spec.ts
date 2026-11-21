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

test('installed WebMCP opt-in invokes SDK tools with policy and unregisters on disable', async ({ page }) => {
  await page.addInitScript(() => {
    const tools = new Map<string, { execute: (input: unknown) => unknown }>();
    Reflect.set(globalThis.window, 'agentTestTools', tools);
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: {
        async registerTool(
          tool: { name: string; execute: (input: unknown) => unknown },
          { signal }: { signal: AbortSignal }
        ) {
          await Promise.resolve();
          if (!signal.aborted) {
            tools.set(tool.name, tool);
            signal.addEventListener('abort', () => tools.delete(tool.name), { once: true });
          }
        },
      },
    });
  });
  await page.goto(`${reliabilityBaseURL}/agent.html`);
  const names = () =>
    page.evaluate(() => {
      const tools: unknown = Reflect.get(globalThis.window, 'agentTestTools');
      if (!(tools instanceof Map)) {
        throw new TypeError('Tool registry missing');
      }
      return [...tools.keys()].filter((key: unknown) => typeof key === 'string');
    });
  const call = (name: string, input: unknown) =>
    page.evaluate(
      ({ name: toolName, input: args }): unknown => {
        const tools: unknown = Reflect.get(globalThis.window, 'agentTestTools');
        const tool: unknown = tools instanceof Map ? tools.get(toolName) : undefined;
        if (!(typeof tool === 'object' && tool !== null && 'execute' in tool && typeof tool.execute === 'function')) {
          throw new Error('Tool is not registered');
        }
        const result: unknown = Reflect.apply(tool.execute, tool, [args]);
        return result;
      },
      { name, input }
    );
  const set = (ref: string, value: number | string) =>
    call('act', { steps: [{ ref, action: 'setValue', args: [value] }] });
  expect(await names()).toEqual([]);
  await page.getByRole('button', { name: 'Enable WebMCP agent', exact: true }).click();
  await expect.poll(names).toEqual(['snapshot', 'act', 'query']);
  const snapshot = JSON.stringify(await call('snapshot', {}));
  expect(snapshot).toContain('Review confidence');
  expect(snapshot).toContain('[redacted]');
  expect(snapshot).not.toContain('Private score');
  expect(snapshot).not.toContain('Human project name');
  expect(await call('query', { within: 'Review confidence' })).toEqual(
    expect.arrayContaining([expect.objectContaining({ label: 'Review confidence' })])
  );
  expect(await set('Human project name', 'not allowed')).toMatchObject({ ok: false });
  expect(await set('Review confidence', 4)).toMatchObject({ ok: true });
  const rating = page.getByRole('radiogroup', { name: 'Review confidence', exact: true });
  await expect(rating.getByRole('radio', { name: '4 of 5 stars' })).toBeChecked();
  const approval = page.getByRole('dialog', { name: 'Approve agent action' });
  const rejected = set('Approval level', 3);
  await approval.getByRole('button', { name: 'Reject action' }).click();
  expect(await rejected).toMatchObject({ ok: false });
  const approved = set('Approval level', 3);
  await approval.getByRole('button', { name: 'Approve action' }).click();
  expect(await approved).toMatchObject({ ok: true });
  const pending = set('Approval level', 4);
  await approval.getByRole('button', { name: 'Stop agent' }).click();
  expect(await pending).toMatchObject({ ok: false });
  await expect.poll(names).toEqual([]);
});
