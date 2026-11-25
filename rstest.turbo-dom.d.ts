declare module '@miaskiewicz/turbo-dom/install' {
  export function installGlobals(
    target: typeof globalThis,
    options?: { html?: string; url?: string }
  ): {
    teardown: () => void;
  };
}
