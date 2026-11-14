'use client';

import { createContext, type ReactNode, useContext } from 'react';
import { createPortal } from 'react-dom';

export const PopupContainer = createContext<Element | DocumentFragment | null>(null);

export function usePopupContainer(container: Element | DocumentFragment | null | undefined) {
  const inherited = useContext(PopupContainer);
  return container === undefined ? inherited : container;
}

export function PopupPortal({
  container,
  children,
}: {
  container: Element | DocumentFragment | null;
  children: ReactNode;
}) {
  if (container === null || typeof document === 'undefined') {
    return children;
  }
  return createPortal(children, container);
}
