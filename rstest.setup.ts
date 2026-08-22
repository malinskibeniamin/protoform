import "./rstest.shared.setup";
import { Storage } from "happy-dom";
import { fetch as nodeFetch } from "undici";

if (typeof window !== "undefined") {
  // Happy DOM's fetch drops the headers that ConnectRPC requires.
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: nodeFetch,
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: new Storage(),
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: new Storage(),
  });
}
