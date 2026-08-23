"use client";

import type React from "react";

interface AutoFormSlotProps {
  /** Render this slot after the field with this key */
  after?: string;
  /** Render this slot before the field with this key */
  before?: string;
  children: React.ReactNode;
}

function AutoFormSlot({ children }: AutoFormSlotProps) {
  // AutoFormSlot is a marker component — its props are read by AutoFormFields
  // to determine placement. It never renders itself directly.
  return children;
}

// Sentinel to identify AutoFormSlot elements in children
AutoFormSlot.displayName = "AutoFormSlot";

export { AutoFormSlot, type AutoFormSlotProps };
