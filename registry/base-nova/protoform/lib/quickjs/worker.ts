import { evaluateQuickJs } from "./evaluator";

// This module is a worker entrypoint, never imported by the application directly.
globalThis.onmessage = async (event: MessageEvent<unknown>) => {
  try {
    const presentation = await evaluateQuickJs(event.data);
    globalThis.postMessage({ ok: true, presentation });
  } catch {
    // Do not send guest exceptions, stack traces, or input data back to the host.
    globalThis.postMessage({ ok: false });
  }
};
