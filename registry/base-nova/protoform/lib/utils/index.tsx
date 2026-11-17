import { cva } from 'class-variance-authority';
import { type ClassValue, clsx } from 'clsx';
import type React from 'react';
import { twMerge } from 'tailwind-merge';

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
  if (typeof child === 'string') {
    return <Wrapper className={className}>{child}</Wrapper>;
  }
  return child;
}

export interface SharedProps {
  testId?: string | undefined;
}

export interface PortalRootProps {
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  open?: boolean | undefined;
}

export type ModalRootProps = PortalRootProps & {
  modal?: boolean | undefined;
};

export interface FocusScopeContentProps {
  onCloseAutoFocus?: ((event: Event) => void) | undefined;
  onOpenAutoFocus?: ((event: Event) => void) | undefined;
}

export type PortalContentProps = FocusScopeContentProps & {
  container?: HTMLElement | undefined;
};

export type FixedPositionContentProps = PortalContentProps & {
  showOverlay?: boolean;
};

export type SemanticVariant = 'success' | 'info' | 'warning' | 'error' | 'disabled';
export type DotSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
export interface StackableProps {
  stacked?: boolean;
}

export const dotColorVariants = cva('', {
  defaultVariants: {
    variant: 'info',
  },
  variants: {
    variant: {
      disabled: 'bg-muted',
      error: 'bg-destructive',
      info: 'bg-primary',
      success: 'bg-primary',
      warning: 'bg-primary',
    },
  },
});

export const dotStackedVariants = cva('!border-background', {
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      lg: 'border-2',
      md: 'border-2',
      sm: 'border',
      xs: 'border-2',
      xxs: 'border',
    },
  },
});
