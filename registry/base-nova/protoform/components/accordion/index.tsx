'use client';

import {
  Accordion as SDKAccordion,
  AccordionHeader as SDKAccordionHeader,
  AccordionItem as SDKAccordionItem,
  AccordionPanel as SDKAccordionPanel,
  AccordionTrigger as SDKAccordionTrigger,
} from '@ui-sdk/react/accordion';

import type React from 'react';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

const Accordion = SDKAccordion;

function AccordionHeader({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKAccordionHeader>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKAccordionHeader
      {...definedProps(props)}
      className={(state) => cn('flex', typeof className === 'function' ? className(state) : className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function AccordionItem({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKAccordionItem>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKAccordionItem
      {...definedProps(props)}
      className={(state) =>
        cn('border-b border-border', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function AccordionPanel({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKAccordionPanel>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKAccordionPanel
      {...definedProps(props)}
      className={(state) =>
        cn('overflow-hidden pb-4 text-sm', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function AccordionTrigger({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKAccordionTrigger>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKAccordionTrigger
      {...definedProps(props)}
      className={(state) =>
        cn(
          'flex flex-1 items-center justify-between py-4 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger };
