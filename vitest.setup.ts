import "./vitest.shared.setup";
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
