import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/e2e/fixtures/quickjs.html");
});

test("real WASM worker evaluates, rejects runaway code, and recovers without blocking UI", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const path = "/registry/base-nova/protoform/lib/quickjs/client.ts";
    const { evaluateQuickJsInWorker }: typeof import("../registry/base-nova/protoform/lib/quickjs/client") =
      await import(path);
    const request = {
      fields: ["kind", "company"],
      source: 'form => ({fields:{company:{visible:form.kind === "business"}}})',
      values: { kind: "business" },
    };
    const first = await evaluateQuickJsInWorker(request);
    let responsive = false;
    const frame = new Promise<void>((resolve) =>
      requestAnimationFrame(() => {
        responsive = true;
        resolve();
      })
    );
    let rejected = false;
    try {
      await evaluateQuickJsInWorker({ ...request, source: "() => {while(true){}}" });
    } catch {
      rejected = true;
    }
    await frame;
    const recovered = await evaluateQuickJsInWorker({ ...request, values: { kind: "personal" } });
    return { first, recovered, rejected, responsive };
  });
  expect(result).toEqual({
    first: { company: { visible: true } },
    recovered: { company: { visible: false } },
    rejected: true,
    responsive: true,
  });
});

test("cancellation and watchdog terminate unfinished workers", async ({ page }) => {
  const messages = await page.evaluate(async () => {
    const path = "/registry/base-nova/protoform/lib/quickjs/client.ts";
    const { evaluateQuickJsInWorker }: typeof import("../registry/base-nova/protoform/lib/quickjs/client") =
      await import(path);
    const request = { fields: [], source: "() => ({fields:{}})", values: {} };
    const controller = new AbortController();
    const running = evaluateQuickJsInWorker(request, { signal: controller.signal });
    controller.abort();
    const cancelled = await running.then(
      () => "unexpected success",
      (error: Error) => error.message
    );
    const timedOut = await evaluateQuickJsInWorker(request, {
      createWorker: () => {
        const url = URL.createObjectURL(new Blob(["onmessage = () => {};"], { type: "text/javascript" }));
        const worker = new Worker(url);
        URL.revokeObjectURL(url);
        return worker;
      },
      timeoutMs: 25,
    }).then(
      () => "unexpected success",
      (error: Error) => error.message
    );
    return [cancelled, timedOut];
  });
  expect(messages).toEqual(["QuickJS evaluation cancelled", "QuickJS worker timed out"]);
});

test("controller preserves drafts through repeated worker failures and gates exact-snapshot submission", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const path = "/registry/base-nova/protoform/lib/quickjs/controller.ts";
    const { createQuickJsController }: typeof import("../registry/base-nova/protoform/lib/quickjs/controller") =
      await import(path);
    const controller = createQuickJsController();
    const request = {
      fields: ["kind", "company"],
      rule: { id: "company", source: 'form => ({fields:{company:{visible:form.kind === "business"}}})', version: "1" },
      values: { company: "Human draft", kind: "business" },
    };
    const submitted: unknown[] = [];
    let blocked = 0;
    try {
      await controller.update(request);
      const running = controller.update({ ...request, values: { ...request.values, kind: "personal" } });
      try {
        await controller.submit(request, (values) => {
          submitted.push(values);
        });
      } catch {
        blocked += 1;
      }
      await running;
      try {
        await controller.submit(request, (values) => {
          submitted.push(values);
        });
      } catch {
        blocked += 1;
      }
      const states: string[] = [];
      // Same controller and page: repeated failure/recovery does not leave a submission lock.
      async function evaluateState(source: string) {
        await controller.update({ ...request, rule: { ...request.rule, source } });
        states.push(controller.getSnapshot().status);
      }
      await evaluateState("() => {while(true){}}");
      await evaluateState(request.rule.source);
      await evaluateState("() => ({");
      await evaluateState(request.rule.source);
      await controller.submit(request, (values) => {
        submitted.push(values);
      });
      return { blocked, states, submitted };
    } finally {
      controller.dispose();
    }
  });
  expect(result).toEqual({
    blocked: 2,
    states: ["error", "ready", "error", "ready"],
    submitted: [{ company: "Human draft", kind: "business" }],
  });
});
