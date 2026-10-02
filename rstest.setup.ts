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
