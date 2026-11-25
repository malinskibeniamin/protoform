'use client';

import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible';
import React from 'react';

import { asChildToRender, asChildTrigger } from '@/registry/base-nova/protoform/lib/base-ui-compat';
import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

interface CollapsibleContextType {
  isOpen: boolean;
}

const CollapsibleContext = React.createContext<boolean | undefined>(undefined);

const useCollapsible = (): CollapsibleContextType => {
  const context = React.useContext(CollapsibleContext);
  if (context === undefined) {
    throw new Error('useCollapsible must be used within a Collapsible');
  }
  return { isOpen: context };
};

type CollapsibleProps = React.ComponentProps<typeof CollapsiblePrimitive.Root> &
  SharedProps & {
    asChild?: boolean;
  };

function Collapsible({ children, testId, asChild, onOpenChange, open, defaultOpen, ...props }: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const isOpen = open ?? uncontrolledOpen;

  const handleOpenChange: NonNullable<CollapsiblePrimitive.Root.Props['onOpenChange']> = (nextOpen, details) => {
    onOpenChange?.(nextOpen, details);
    if (details.isCanceled) {
      return;
    }
    if (open === undefined) {
      setUncontrolledOpen(nextOpen);
    }
  };

  return (
    <CollapsibleContext.Provider value={isOpen}>
      <CollapsiblePrimitive.Root
        data-slot="collapsible"
        data-testid={testId}
        {...props}
        defaultOpen={defaultOpen}
        open={open}
        {...asChildToRender({ asChild, children })}
        onOpenChange={handleOpenChange}
      />
    </CollapsibleContext.Provider>
  );
}

type CollapsibleTriggerProps = React.ComponentProps<typeof CollapsiblePrimitive.Trigger> & {
  asChild?: boolean;
};

function CollapsibleTrigger({ className, ...props }: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger
      className={(state) => cn('cursor-pointer', typeof className === 'function' ? className(state) : className)}
      data-slot="collapsible-trigger"
      {...asChildTrigger(props)}
    />
  );
}

type CollapsibleContentProps = React.ComponentProps<typeof CollapsiblePrimitive.Panel>;

function CollapsibleContent({ className, children, render, keepMounted = false, ...props }: CollapsibleContentProps) {
  return (
    <CollapsiblePrimitive.Panel
      className={(state) =>
        cn(
          'h-(--collapsible-panel-height) overflow-hidden transition-all duration-200 ease-out data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:opacity-0 motion-reduce:transition-none',
          typeof className === 'function' ? className(state) : className
        )
      }
      data-slot="collapsible-content"
      keepMounted={keepMounted}
      render={render}
      {...props}
    >
      {children}
    </CollapsiblePrimitive.Panel>
  );
}

export {
  Collapsible,
  CollapsibleContent,
  type CollapsibleContentProps,
  type CollapsibleContextType,
  type CollapsibleProps,
  CollapsibleTrigger,
  type CollapsibleTriggerProps,
  useCollapsible,
};
