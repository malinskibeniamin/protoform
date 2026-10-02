'use client';

import React from 'react';

const useLayoutEffect = globalThis.document ? React.useLayoutEffect : () => undefined;

export { useLayoutEffect };
