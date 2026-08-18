"use client";

import React from "react";

/**
 * Taken from Radix UI
 * On the server, React emits a warning when calling `useLayoutEffect`.
 * This is because neither `useLayoutEffect` nor `useEffect` run on the server.
 * We use this safe version which suppresses the warning by replacing it with a noop on the server.
 *
 * Isomorphic layout effect helper for protoform components.
 * @see https://reactjs.org/docs/hooks-reference.html#uselayouteffect
 */
const useLayoutEffect = globalThis.document
  ? React.useLayoutEffect
  : () => {
      // Server-side no-op
    };

export { useLayoutEffect };
