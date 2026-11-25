import { installGlobals } from '@miaskiewicz/turbo-dom/install';

const nodeFetch = globalThis.fetch;
installGlobals(globalThis);
globalThis.fetch = nodeFetch;

Object.defineProperty(Element.prototype, 'animate', {
  configurable: true,
  value: undefined,
});

await import('./rstest.shared.setup');
