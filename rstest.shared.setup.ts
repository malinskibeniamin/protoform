import { expect } from '@rstest/core';

const { default: defaultMatchers, ...namedMatchers } = await import('@testing-library/jest-dom/matchers');
expect.extend(defaultMatchers ?? namedMatchers);

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
