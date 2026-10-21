import { evaluateQuickJs } from './evaluator';

globalThis.addEventListener('message', (event: MessageEvent<unknown>) => {
  evaluateQuickJs(event.data)
    .then((presentation) => {
      globalThis.postMessage({ ok: true, presentation }, { transfer: [] });
    })
    .catch(() => {
      globalThis.postMessage({ ok: false }, { transfer: [] });
    });
});
