import { Storage } from 'happy-dom';
import { fetch as nodeFetch } from 'undici';
import { ResizeObserverMock } from './rstest.shared.setup';

if (typeof window !== 'undefined') {
  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true,
    value: undefined,
  });
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: nodeFetch,
  });
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: new Storage(),
  });
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: new Storage(),
  });
}

globalThis.ResizeObserver ??= ResizeObserverMock;
globalThis.matchMedia = (query: string): MediaQueryList => ({
  addEventListener: () => undefined,
  addListener: () => undefined,
  dispatchEvent: () => false,
  matches: false,
  media: query,
  onchange: null,
  removeEventListener: () => undefined,
  removeListener: () => undefined,
});
globalThis.scrollTo = () => undefined;
if (typeof Element !== 'undefined' && typeof Reflect.get(Element.prototype, 'scrollIntoView') !== 'function') {
  Element.prototype.scrollIntoView = () => undefined;
}
