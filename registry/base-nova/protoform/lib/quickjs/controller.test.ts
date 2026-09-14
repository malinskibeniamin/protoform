import { expect, test } from "@rstest/core";
import type { QuickJsOptions } from "./client";
import type { QuickJsPresentation } from "./contract";
import { createQuickJsController, type ReviewedQuickJsRequest } from "./controller";

const request: ReviewedQuickJsRequest = {
  fields: ["kind", "company"],
  rule: {
    id: "account-fields",
    source: "form => ({fields:{company:{visible:form.kind === 'business'}}})",
    version: "1",
  },
  values: { company: "Acme", kind: "business" },
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, reject, resolve };
}

test("only the latest revision can enable submission, even when cancellation is ignored", async () => {
  const first = deferred<QuickJsPresentation>();
  const second = deferred<QuickJsPresentation>();
  const signals: Array<AbortSignal | undefined> = [];
  const controller = createQuickJsController({
    evaluate: (_request, options?: QuickJsOptions) => {
      signals.push(options?.signal);
      return signals.length === 1 ? first.promise : second.promise;
    },
  });
  const old = controller.update(request);
  const latestRequest = { ...request, values: { ...request.values, kind: "personal" } };
  const latest = controller.update(latestRequest);
  expect(signals[0]?.aborted).toBe(true);
  let calls = 0;
  await expect(
    controller.submit(latestRequest, () => {
      calls += 1;
    })
  ).rejects.toThrow("not ready");
  second.resolve({ company: { visible: false } });
  await latest;
  first.resolve({ company: { visible: true } });
  await old;
  expect(controller.getSnapshot().presentation).toEqual({ company: { visible: false } });
  await expect(
    controller.submit(request, () => {
      calls += 1;
    })
  ).rejects.toThrow("changed");
  await controller.submit(latestRequest, (values) => {
    calls += 1;
    expect(values).toEqual(latestRequest.values);
  });
  expect(calls).toBe(1);
  controller.dispose();
});

test("submission is blocked if a synchronous subscriber changes values during notification", async () => {
  const controller = createQuickJsController({ evaluate: () => Promise.resolve({}) });
  await controller.update(request);
  controller.subscribe(() => {
    if (controller.getSnapshot().submitting && controller.getSnapshot().status === "ready") {
      controller.invalidate();
    }
  });
  let called = false;
  await expect(
    controller.submit(request, () => {
      called = true;
    })
  ).rejects.toThrow("changed");
  expect(called).toBe(false);
  controller.dispose();
});

test("failures retain accepted presentation, block submission, and recover only after retry", async () => {
  const outcomes = [
    () => Promise.resolve({ company: { visible: false } }),
    () => Promise.reject(new Error("private source and values")),
    () => Promise.resolve({ company: { visible: false } }),
  ];
  const controller = createQuickJsController({
    evaluate: () => {
      const next = outcomes.shift();
      if (!next) {
        throw new Error("Unexpected evaluation");
      }
      return next();
    },
  });
  await controller.update(request);
  await controller.update(request);
  expect(controller.getSnapshot()).toMatchObject({ presentation: { company: { visible: false } }, status: "error" });
  expect(controller.getSnapshot().error).not.toContain("private");
  await expect(controller.submit(request, () => undefined)).rejects.toThrow("not ready");
  await controller.update(request);
  expect(controller.getSnapshot().status).toBe("ready");
  controller.dispose();
});

test("invalidation blocks streaming gaps; disposal aborts work and ignores late failures", async () => {
  const pending = deferred<QuickJsPresentation>();
  let signal: AbortSignal | undefined;
  const controller = createQuickJsController({
    evaluate: (_request, options) => {
      signal = options?.signal;
      return pending.promise;
    },
  });
  let notifications = 0;
  const unsubscribe = controller.subscribe(() => {
    notifications += 1;
  });
  const running = controller.update(request);
  controller.invalidate();
  expect(signal?.aborted).toBe(true);
  await expect(controller.submit(request, () => undefined)).rejects.toThrow("not ready");
  controller.dispose();
  const before = notifications;
  pending.reject(new Error("obsolete"));
  await running;
  expect(notifications).toBe(before);
  expect(controller.getSnapshot().status).toBe("disposed");
  await expect(controller.update(request)).rejects.toThrow("disposed");
  unsubscribe();
});

test("concurrent submissions are rejected and action failure does not leave a permanent lock", async () => {
  const action = deferred<void>();
  const controller = createQuickJsController({ evaluate: () => Promise.resolve({}) });
  await controller.update(request);
  const first = controller.submit(request, () => action.promise);
  await controller.update(request);
  await expect(controller.submit(request, () => undefined)).rejects.toThrow("not ready");
  action.reject(new Error("tool unavailable"));
  await expect(first).rejects.toThrow("tool unavailable");
  expect(controller.getSnapshot().submitting).toBe(false);
  await controller.submit(request, () => undefined);
  controller.dispose();
});

test("schema and rule revisions clear obsolete policies; malformed input fails closed", async () => {
  const controller = createQuickJsController({ evaluate: () => Promise.resolve({ company: { visible: false } }) });
  await controller.update(request);
  const changed = { ...request, fields: ["kind"], rule: { ...request.rule, version: "2" } };
  await controller.update({ ...changed, values: { kind: "business" } });
  expect(controller.getSnapshot()).toMatchObject({ presentation: {}, status: "error" });
  await expect(controller.submit(request, () => undefined)).rejects.toThrow("not ready");
  await controller.update({ ...request, rule: { ...request.rule, version: "" } });
  expect(controller.getSnapshot().status).toBe("error");
  controller.dispose();
});

test("external mutation cannot alter the accepted snapshot or presentation", async () => {
  const controller = createQuickJsController({ evaluate: () => Promise.resolve({ company: { visible: false } }) });
  const mutable = structuredClone(request);
  await controller.update(mutable);
  mutable.values["company"] = "Changed";
  expect(Object.isFrozen(controller.getSnapshot())).toBe(true);
  expect(Object.isFrozen(controller.getSnapshot().presentation["company"])).toBe(true);
  await expect(controller.submit(mutable, () => undefined)).rejects.toThrow("changed");
  await controller.submit(request, (values) => {
    expect(values["company"]).toBe("Acme");
    values["company"] = "local";
  });
  await controller.submit(request, (values) => {
    expect(values["company"]).toBe("Acme");
  });
  controller.dispose();
});

test("disposal from a subscription cannot start another worker", async () => {
  let evaluations = 0;
  const controller = createQuickJsController({
    evaluate: () => {
      evaluations += 1;
      return Promise.resolve({});
    },
  });
  controller.subscribe(() => {
    if (controller.getSnapshot().status === "pending") {
      controller.dispose();
    }
  });
  await controller.update(request);
  expect(evaluations).toBe(0);
  expect(controller.getSnapshot().status).toBe("disposed");
});

test("A to B to A does not reuse the first A while the final revision is pending", async () => {
  const first = deferred<QuickJsPresentation>();
  const middle = deferred<QuickJsPresentation>();
  const final = deferred<QuickJsPresentation>();
  const jobs = [first, middle, final];
  const controller = createQuickJsController({
    evaluate: () => {
      const job = jobs.shift();
      if (!job) {
        throw new Error("Unexpected evaluation");
      }
      return job.promise;
    },
  });
  const a = controller.update(request);
  const b = controller.update({ ...request, values: { ...request.values, kind: "personal" } });
  const backToA = controller.update(request);
  first.resolve({ company: { visible: true } });
  await a;
  expect(controller.getSnapshot().status).toBe("pending");
  await expect(controller.submit(request, () => undefined)).rejects.toThrow("not ready");
  final.resolve({ company: { visible: true } });
  await backToA;
  middle.reject(new Error("obsolete B"));
  await b;
  expect(controller.getSnapshot()).toMatchObject({
    error: null,
    presentation: { company: { visible: true } },
    status: "ready",
  });
  controller.dispose();
});
