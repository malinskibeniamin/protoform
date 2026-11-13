'use client';

import {
  Accordion as SDKAccordion,
  AccordionHeader as SDKAccordionHeader,
  AccordionItem as SDKAccordionItem,
  AccordionPanel as SDKAccordionPanel,
  AccordionTrigger as SDKAccordionTrigger,
} from '@ui-sdk/react/accordion';

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
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
        cn('not-last:border-b not-last:border-border', typeof className === 'function' ? className(state) : className)
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
        cn('overflow-hidden pb-2.5 text-sm', typeof className === 'function' ? className(state) : className)
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

function AccordionTrigger({
  children,
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKAccordionTrigger>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  const renderChildren = typeof children === 'function' ? children : () => children;
  return (
    <SDKAccordionTrigger
      {...definedProps(props)}
      className={(state) =>
        cn(
          'group/accordion-trigger relative flex w-full flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    >
      {(state) => (
        <>
          {renderChildren(state)}
          <ChevronDownIcon
            aria-hidden="true"
            className="ml-auto size-4 shrink-0 text-muted-foreground group-aria-expanded/accordion-trigger:hidden"
          />
          <ChevronUpIcon
            aria-hidden="true"
            className="ml-auto hidden size-4 shrink-0 text-muted-foreground group-aria-expanded/accordion-trigger:block"
          />
        </>
      )}
    </SDKAccordionTrigger>
  );
}

export { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger };
