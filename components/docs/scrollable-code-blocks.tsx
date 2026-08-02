"use client";

import React from "react";

const CODE_BLOCK_SELECTOR = ".prose pre > code";
const MANAGED_ATTRIBUTE = "data-keyboard-scrollable";

function isScrollable(element: HTMLElement): boolean {
  return (
    element.scrollWidth > element.clientWidth ||
    element.scrollHeight > element.clientHeight
  );
}

export function syncScrollableCodeBlocks(root: ParentNode = document): void {
  for (const code of root.querySelectorAll<HTMLElement>(CODE_BLOCK_SELECTOR)) {
    if (isScrollable(code)) {
      if (code.tabIndex < 0) {
        code.tabIndex = 0;
        code.setAttribute(MANAGED_ATTRIBUTE, "");
      }
      continue;
    }

    if (code.hasAttribute(MANAGED_ATTRIBUTE)) {
      code.removeAttribute("tabindex");
      code.removeAttribute(MANAGED_ATTRIBUTE);
    }
  }
}

export function ScrollableCodeBlocks() {
  React.useEffect(function keepScrollableCodeBlocksFocusable() {
    function syncCodeBlocks() {
      syncScrollableCodeBlocks();
    }

    syncCodeBlocks();

    const mutationObserver = new MutationObserver(syncCodeBlocks);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const resizeObserver = new ResizeObserver(syncCodeBlocks);
    resizeObserver.observe(document.documentElement);

    document.addEventListener("astro:page-load", syncCodeBlocks);

    return function stopTrackingCodeBlocks() {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("astro:page-load", syncCodeBlocks);
      for (const code of document.querySelectorAll<HTMLElement>(
        `[${MANAGED_ATTRIBUTE}]`
      )) {
        code.removeAttribute("tabindex");
        code.removeAttribute(MANAGED_ATTRIBUTE);
      }
    };
  }, []);

  return null;
}
