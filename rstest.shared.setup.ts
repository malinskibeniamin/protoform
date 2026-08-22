import { expect } from "@rstest/core";

const { default: defaultMatchers, ...namedMatchers } = await import("@testing-library/jest-dom/matchers");
expect.extend(defaultMatchers ?? namedMatchers);

class ResizeObserverMock implements ResizeObserver {
  observe = (): void => {
    // The simulated DOM has no layout engine.
  };
  unobserve = (): void => {
    // The simulated DOM has no layout engine.
  };
  disconnect = (): void => {
    // The simulated DOM has no layout engine.
  };
}

globalThis.ResizeObserver ??= ResizeObserverMock;
globalThis.matchMedia = (query: string): MediaQueryList => ({
  addEventListener() {
    // Media-query changes are outside the simulated DOM's layout model.
  },
  addListener() {
    // Deprecated listener retained for libraries that still call it.
  },
  dispatchEvent: () => false,
  matches: false,
  media: query,
  onchange: null,
  removeEventListener() {
    // Media-query changes are outside the simulated DOM's layout model.
  },
  removeListener() {
    // Deprecated listener retained for libraries that still call it.
  },
});
globalThis.scrollTo = () => {
  // The simulated DOM has no layout engine.
};
if (typeof Element !== "undefined") {
  Element.prototype.scrollIntoView ??= function scrollIntoView() {
    // The simulated DOM has no layout engine.
  };
}
