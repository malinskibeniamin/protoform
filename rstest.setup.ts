import './rstest.shared.setup';
import { Storage } from 'happy-dom';
import { fetch as nodeFetch } from 'undici';

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

class ResizeObserverMock implements ResizeObserver {
  observe = (): void => undefined;
  unobserve = (): void => undefined;
  disconnect = (): void => undefined;
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
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView ??= () => undefined;
}
