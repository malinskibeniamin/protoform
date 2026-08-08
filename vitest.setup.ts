import "@testing-library/jest-dom/vitest";
import { Storage } from "happy-dom";

if (typeof window !== "undefined") {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: new Storage(),
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: new Storage(),
  });
}

class ResizeObserverMock implements ResizeObserver {
  observe() {
    // The simulated DOM has no layout engine.
  }
  unobserve() {
    // The simulated DOM has no layout engine.
  }
  disconnect() {
    // The simulated DOM has no layout engine.
  }
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
