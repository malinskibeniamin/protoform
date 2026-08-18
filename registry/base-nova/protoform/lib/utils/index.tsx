import { cva } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import type React from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function wrapStringChild(
  child: React.ReactNode,
  Wrapper: React.ComponentType<{
    children: React.ReactNode;
    className?: string | undefined;
  }>,
  className?: string
): React.ReactNode {
  if (typeof child === "string") {
    return <Wrapper className={className}>{child}</Wrapper>;
  }
  return child;
}

export interface SharedProps {
  testId?: string | undefined;
}

// =============================================================================
// Portal Component Common Types
// =============================================================================
// These types provide a single source of truth for portal component props
// that need to be exposed for visual regression testing.

/**
 * Common props for portal root components that support controlled open state.
 * Components: Dialog, Popover, Sheet, Drawer, etc.
 */
export interface PortalRootProps {
  /** Uncontrolled default open state */
  defaultOpen?: boolean | undefined;
  /** Callback when open state changes */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Controlled open state */
  open?: boolean | undefined;
}

/**
 * Extended root props for modal components that need non-modal mode.
 * Components: Dialog, Sheet, Drawer, DropdownMenu
 */
export type ModalRootProps = PortalRootProps & {
  /** When false, prevents body pointer-events:none and focus trapping */
  modal?: boolean | undefined;
};

/**
 * Common props for portal content components that use FocusScope.
 * These props control auto-focus behavior when content opens/closes.
 */
export interface FocusScopeContentProps {
  /**
   * @deprecated Radix-compat shim. Base UI primitives do not expose an
   * `onCloseAutoFocus` hook; handle close-focus in a `ref` callback or
   * `onOpenChange` handler instead. Scheduled for removal in a future major.
   */
  onCloseAutoFocus?: ((event: Event) => void) | undefined;
  /**
   * @deprecated Radix-compat shim. Base UI primitives do not expose an
   * `onOpenAutoFocus` hook; the callback is ignored at runtime and will emit
   * a dev-mode warning. Use `initialFocus` on the underlying Base UI `Popup`
   * (or equivalent) instead. Scheduled for removal in a future major.
   */
  onOpenAutoFocus?: ((event: Event) => void) | undefined;
}

/**
 * Common props for portal content components.
 * Combines container prop with focus scope props.
 */
export type PortalContentProps = FocusScopeContentProps & {
  /** Container element for inline rendering (no portal to body) */
  container?: HTMLElement | undefined;
};

/**
 * Extended content props for fixed-position modal components.
 * Components: Dialog, Sheet, Drawer, Credenza, AlertDialog
 */
export type FixedPositionContentProps = PortalContentProps & {
  /** When false, hides the overlay/backdrop */
  showOverlay?: boolean;
};

// =============================================================================
// Indicator Component Common Types
// =============================================================================
// Shared types for StatusDot, CountDot, and StatusBadge components.

export type SemanticVariant = "success" | "info" | "warning" | "error" | "disabled";
export type DotSize = "xxs" | "xs" | "sm" | "md" | "lg";
export interface StackableProps {
  stacked?: boolean;
}

// =============================================================================
// Shared Dot Component Styles
// =============================================================================
// Common CVAs used by StatusDot, CountDot, and related indicator components.

export const dotColorVariants = cva("", {
  defaultVariants: {
    variant: "info",
  },
  variants: {
    variant: {
      disabled: "bg-surface-strong-hover",
      error: "bg-background-error-strong",
      info: "bg-background-informative-strong",
      success: "bg-background-success-strong",
      warning: "bg-background-warning-strong",
    },
  },
});

export const dotStackedVariants = cva("!border-background", {
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      lg: "border-2",
      md: "border-[1.5px]",
      sm: "border",
      xs: "border-[2px]",
      xxs: "border-[1px]",
    },
  },
});
