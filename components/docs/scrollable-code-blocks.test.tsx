import { describe, expect } from "@rstest/core";

import { syncScrollableCodeBlocks } from "./scrollable-code-blocks";

function setDimensions(
  element: HTMLElement,
  dimensions: {
    clientHeight: number;
    clientWidth: number;
    scrollHeight: number;
    scrollWidth: number;
  }
) {
  for (const [property, value] of Object.entries(dimensions)) {
    Object.defineProperty(element, property, { configurable: true, value });
  }
}

describe("syncScrollableCodeBlocks", () => {
  test("adds keyboard access only while a code block overflows", () => {
    const root = document.createElement("div");
    root.className = "prose";
    root.innerHTML = "<pre><code>long line</code></pre>";
    const code = root.querySelector("code");
    expect(code).not.toBeNull();
    if (!code) {
      return;
    }

    setDimensions(code, {
      clientHeight: 20,
      clientWidth: 100,
      scrollHeight: 20,
      scrollWidth: 160,
    });
    syncScrollableCodeBlocks(root);
    expect(code).toHaveAttribute("tabindex", "0");

    setDimensions(code, {
      clientHeight: 20,
      clientWidth: 160,
      scrollHeight: 20,
      scrollWidth: 160,
    });
    syncScrollableCodeBlocks(root);
    expect(code).not.toHaveAttribute("tabindex");
  });

  test("preserves an author-provided tab stop", () => {
    const root = document.createElement("div");
    root.className = "prose";
    root.innerHTML = '<pre><code tabindex="0">short line</code></pre>';
    const code = root.querySelector("code");
    expect(code).not.toBeNull();
    if (!code) {
      return;
    }

    setDimensions(code, {
      clientHeight: 20,
      clientWidth: 160,
      scrollHeight: 20,
      scrollWidth: 160,
    });
    syncScrollableCodeBlocks(root);
    expect(code).toHaveAttribute("tabindex", "0");
  });
});
