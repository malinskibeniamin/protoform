'use client';

import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible';
import { AnimatePresence, type HTMLMotionProps, motion, type Transition } from 'motion/react';
import React from 'react';

import { asChildToRender, asChildTrigger, splitMotionProps } from '@/registry/base-nova/protoform/lib/base-ui-compat';
import { cn, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

const DEFAULT_TRANSITION = { damping: 22, stiffness: 150, type: 'spring' } satisfies Transition;

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

type CollapsibleContentProps = React.ComponentProps<typeof CollapsiblePrimitive.Panel> &
  Omit<HTMLMotionProps<'div'>, keyof React.ComponentProps<typeof CollapsiblePrimitive.Panel>> & {
    transition?: Transition;
  };

function CollapsibleContent({
  className,
  children,
  render,
  keepMounted = false,
  transition = DEFAULT_TRANSITION,
  ...props
}: CollapsibleContentProps) {
  const { isOpen } = useCollapsible();
  const separated = splitMotionProps(props);

  return (
    <AnimatePresence>
      {isOpen || keepMounted === true ? (
        <CollapsiblePrimitive.Panel
          className={className}
          data-slot="collapsible-content"
          keepMounted
          render={render}
          {...separated.native}
        >
          <motion.div
            animate={{ height: 'auto', opacity: 1, overflow: 'hidden' }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
            layout
            transition={transition}
            {...separated.motion}
          >
            {children}
          </motion.div>
        </CollapsiblePrimitive.Panel>
      ) : null}
    </AnimatePresence>
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
