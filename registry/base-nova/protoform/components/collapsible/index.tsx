"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { AnimatePresence, type HTMLMotionProps, motion, type Transition } from "motion/react";
import React from "react";

import { asChildToRender, asChildTrigger, narrowOpenChange } from "@/registry/base-nova/protoform/lib/base-ui-compat";
import { cn, type SharedProps } from "@/registry/base-nova/protoform/lib/utils";

interface CollapsibleContextType {
  isOpen: boolean;
}

const CollapsibleContext = React.createContext<CollapsibleContextType | undefined>(undefined);

const useCollapsible = (): CollapsibleContextType => {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error("useCollapsible must be used within a Collapsible");
  }
  return context;
};

type CollapsibleProps = Omit<React.ComponentProps<typeof CollapsiblePrimitive.Root>, "onOpenChange"> &
  SharedProps & {
    asChild?: boolean;
    onOpenChange?: (open: boolean) => void;
  };

function Collapsible({ children, testId, asChild, onOpenChange, open, defaultOpen, ...props }: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const isOpen = open ?? uncontrolledOpen;
  const contextValue = React.useMemo(() => ({ isOpen }), [isOpen]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (open === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  return (
    <CollapsibleContext.Provider value={contextValue}>
      <CollapsiblePrimitive.Root
        data-slot="collapsible"
        data-testid={testId}
        {...props}
        defaultOpen={defaultOpen}
        open={open}
        {...asChildToRender({ asChild, children })}
        onOpenChange={narrowOpenChange(handleOpenChange)}
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
      className={cn("cursor-pointer", className)}
      data-slot="collapsible-trigger"
      {...asChildTrigger(props)}
    />
  );
}

type CollapsibleContentProps = React.ComponentProps<typeof CollapsiblePrimitive.Panel> &
  HTMLMotionProps<"div"> & {
    transition?: Transition;
  };

function CollapsibleContent({
  className,
  children,
  transition = { damping: 22, stiffness: 150, type: "spring" },
  ...props
}: CollapsibleContentProps) {
  const { isOpen } = useCollapsible();

  return (
    <AnimatePresence>
      {isOpen ? (
        <CollapsiblePrimitive.Panel
          keepMounted
          render={
            <motion.div
              animate={{ height: "auto", opacity: 1, overflow: "hidden" }}
              className={className}
              data-slot="collapsible-content"
              exit={{ height: 0, opacity: 0, overflow: "hidden" }}
              initial={{ height: 0, opacity: 0, overflow: "hidden" }}
              key="collapsible-content"
              layout
              transition={transition}
            >
              {children}
            </motion.div>
          }
          {...props}
        />
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
