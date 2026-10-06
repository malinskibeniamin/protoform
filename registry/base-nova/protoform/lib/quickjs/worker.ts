import { evaluateQuickJs } from './evaluator';

globalThis.onmessage = async (event: MessageEvent<unknown>) => {
  try {
    const presentation = await evaluateQuickJs(event.data);
    globalThis.postMessage({ ok: true, presentation });
  } catch {
    globalThis.postMessage({ ok: false });
  }
};
