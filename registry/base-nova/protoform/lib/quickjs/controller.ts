import { evaluateQuickJsInWorker, type QuickJsOptions } from "./client";
import {
  parseQuickJsPresentation,
  parseQuickJsRequest,
  type QuickJsPresentation,
  type QuickJsRequest,
} from "./contract";

/** Select from a host-owned reviewed catalog. Metadata is not a security approval mechanism. */
export interface ReviewedQuickJsRequest {
  fields: string[];
  rule: { id: string; version: string; source: string };
  values: QuickJsRequest["values"];
}

export interface QuickJsControllerState {
  error: string | null;
  presentation: QuickJsPresentation;
  status: "idle" | "pending" | "ready" | "error" | "disposed";
  submitting: boolean;
}

interface ControllerOptions extends Omit<QuickJsOptions, "signal"> {
  /** Trusted evaluator override for tests or alternative worker transports. */
  evaluate?: typeof evaluateQuickJsInWorker;
}

function prepare(request: ReviewedQuickJsRequest) {
  const { id, version } = request.rule;
  if (!(id.trim() && version.trim()) || id.length > 128 || version.length > 128) {
    throw new Error("Expected a reviewed rule ID and version");
  }
  const snapshot = parseQuickJsRequest({ ...request, source: request.rule.source });
  snapshot.fields.sort((a, b) => a.localeCompare(b));
  const identity = JSON.stringify([id, version, snapshot.source, snapshot.fields]);
  const key = JSON.stringify([identity, Object.entries(snapshot.values).sort(([a], [b]) => a.localeCompare(b))]);
  return { identity, key, snapshot };
}

/** Framework-independent store; update synchronously from every input/rule/schema change. */
export function createQuickJsController(options: ControllerOptions = {}) {
  const { evaluate = evaluateQuickJsInWorker, ...workerOptions } = options;
  const listeners = new Set<() => void>();
  let state: QuickJsControllerState = Object.freeze({
    error: null,
    presentation: Object.freeze({}),
    status: "idle",
    submitting: false,
  });
  let revision = 0;
  let active: AbortController | undefined;
  let accepted: ReturnType<typeof prepare> | undefined;
  let identity: string | undefined;
  let submitting = false;

  function stateIsLive() {
    return state.status !== "disposed";
  }

  function publish(next: QuickJsControllerState) {
    state = Object.freeze(next);
    for (const listener of listeners) {
      listener();
    }
  }

  function invalidate() {
    if (state.status === "disposed") {
      return;
    }
    revision += 1;
    active?.abort();
    active = undefined;
    accepted = undefined;
    publish({ ...state, error: null, status: "idle" });
  }

  function resetPresentation(prepared: ReturnType<typeof prepare>) {
    if (prepared.identity !== identity) {
      ({ identity } = prepared);
      publish({ ...state, presentation: Object.freeze({}) });
    }
  }

  async function update(request: ReviewedQuickJsRequest): Promise<void> {
    if (state.status === "disposed") {
      throw new Error("QuickJS controller disposed");
    }
    revision += 1;
    const current = revision;
    active?.abort();
    accepted = undefined;
    const abort = new AbortController();
    active = abort;
    // Invalidate readiness before parsing or calling any asynchronous code.
    publish({ ...state, error: null, status: "pending" });
    if (current !== revision) {
      return;
    }
    let prepared: ReturnType<typeof prepare>;
    let presentation: QuickJsPresentation;
    try {
      prepared = prepare(request);
      resetPresentation(prepared);
      if (current !== revision) {
        return;
      }
      presentation = parseQuickJsPresentation(
        await evaluate(prepared.snapshot, {
          signal: abort.signal,
          ...workerOptions,
        }),
        prepared.snapshot.fields
      );
    } catch {
      if (current === revision) {
        active = undefined;
        publish({ ...state, error: "Could not evaluate form rules. Retry before submitting.", status: "error" });
      }
      return;
    }
    if (current !== revision) {
      return;
    }
    for (const policy of Object.values(presentation)) {
      Object.freeze(policy);
    }
    accepted = prepared;
    active = undefined;
    publish({ ...state, error: null, presentation: Object.freeze(presentation), status: "ready" });
  }

  /** Call after schema validation, passing the exact current snapshot. Never pass unprojected secrets. */
  async function submit<T>(
    request: ReviewedQuickJsRequest,
    action: (values: QuickJsRequest["values"]) => T | Promise<T>
  ): Promise<T> {
    if (state.status !== "ready" || !accepted || submitting) {
      throw new Error("Form rules are not ready for submission");
    }
    if (prepare(request).key !== accepted.key) {
      throw new Error("Form inputs or rules changed before submission");
    }
    const values = { ...accepted.snapshot.values };
    const current = revision;
    submitting = true;
    try {
      publish({ ...state, submitting: true });
      if (current !== revision) {
        throw new Error("Form inputs or rules changed before submission");
      }
      return await action(values);
    } finally {
      submitting = false;
      if (stateIsLive()) {
        publish({ ...state, submitting: false });
      }
    }
  }

  function dispose() {
    if (state.status === "disposed") {
      return;
    }
    revision += 1;
    active?.abort();
    active = undefined;
    accepted = undefined;
    publish({ ...state, error: null, status: "disposed", submitting: false });
    listeners.clear();
  }

  return {
    dispose,
    getSnapshot: () => state,
    invalidate,
    submit,
    subscribe(listener: () => void) {
      if (state.status === "disposed") {
        return () => undefined;
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    update,
  };
}
