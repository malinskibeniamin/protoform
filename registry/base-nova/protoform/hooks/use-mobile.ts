'use client';

import { useSyncExternalStore } from 'react';

const MOBILE_QUERY = '(max-width: 767px)';

function subscribeToViewport(onChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function getIsMobile() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getServerIsMobile() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(subscribeToViewport, getIsMobile, getServerIsMobile);
}
