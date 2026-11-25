'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import React from 'react';

import { usePortalContainer } from '@/registry/base-nova/protoform/hooks/use-portal-container';
import { asChildTrigger, Slot, useMirroredOpen } from '@/registry/base-nova/protoform/lib/base-ui-compat';
import { cn, type PortalContentProps, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

interface PopoverContextType {
  isOpen: boolean;
}

const PopoverContext = React.createContext<PopoverContextType | undefined>(undefined);

const usePopover = (): PopoverContextType => {
  const context = React.useContext(PopoverContext);
  if (context === undefined) {
    throw new Error('usePopover must be used within a Popover');
  }
  return context;
};

interface PopoverAnchorContextType {
  anchorRef: React.RefObject<Element | null>;
  hasAnchor: boolean;
  setHasAnchor: (hasAnchor: boolean) => void;
}

const PopoverAnchorContext = React.createContext<PopoverAnchorContextType | undefined>(undefined);

type PopoverProps = React.ComponentProps<typeof PopoverPrimitive.Root> & SharedProps & { delayDuration?: number };

function Popover({ children, testId, onOpenChange, ...props }: PopoverProps) {
  const { isOpen, handleOpenChange } = useMirroredOpen(props.open, props.defaultOpen, onOpenChange);
  const anchorRef = React.useRef<Element | null>(null);
  const [hasAnchor, setHasAnchor] = React.useState(false);

  const anchorCtx = React.useMemo<PopoverAnchorContextType>(
    () => ({ anchorRef, hasAnchor, setHasAnchor }),
    [hasAnchor]
  );
  const popoverContextValue = React.useMemo(() => ({ isOpen }), [isOpen]);

  return (
    <PopoverContext.Provider value={popoverContextValue}>
      <PopoverAnchorContext.Provider value={anchorCtx}>
        <PopoverPrimitive.Root data-slot="popover" data-testid={testId} {...props} onOpenChange={handleOpenChange}>
          {children}
        </PopoverPrimitive.Root>
      </PopoverAnchorContext.Provider>
    </PopoverContext.Provider>
  );
}

type PopoverTriggerProps = React.ComponentProps<typeof PopoverPrimitive.Trigger> &
  SharedProps & {
    asChild?: boolean;
  };

function PopoverTrigger({ className, testId, ...props }: PopoverTriggerProps) {
  return (
    <PopoverPrimitive.Trigger
      className={(state) => cn('cursor-pointer', typeof className === 'function' ? className(state) : className)}
      data-slot="popover-trigger"
      data-testid={testId}
      {...asChildTrigger(props)}
    />
  );
}

type PopoverContentProps = React.ComponentProps<typeof PopoverPrimitive.Popup> &
  SharedProps &
  Pick<PortalContentProps, 'container' | 'onOpenAutoFocus'> &
  Pick<PopoverPrimitive.Positioner.Props, 'side' | 'align' | 'sideOffset' | 'alignOffset'>;

function PopoverContent(contentProps: PopoverContentProps) {
  const {
    className,
    align = 'center',
    side = 'bottom',
    sideOffset = 4,
    alignOffset,
    render,
    children,
    testId,
    container,
    ...props
  } = contentProps;
  Reflect.deleteProperty(props, 'onOpenAutoFocus');
  const portalContainer = usePortalContainer();
  const anchorCtx = React.useContext(PopoverAnchorContext);

  return (
    <PopoverPrimitive.Portal container={container ?? portalContainer} data-slot="popover-portal">
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        {...(anchorCtx?.hasAnchor && anchorCtx.anchorRef.current ? { anchor: anchorCtx.anchorRef } : {})}
        className="z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <PopoverPrimitive.Popup
          {...props}
          className={(state) =>
            cn(
              'w-72 origin-(--transform-origin) rounded-lg border !border-input bg-popover p-4 text-popover-foreground shadow-md outline-none data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 motion-reduce:data-closed:animate-none motion-reduce:data-open:animate-none',
              typeof className === 'function' ? className(state) : className
            )
          }
          data-slot="popover-content"
          data-testid={testId}
          render={render}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

interface PopoverAnchorProps {
  asChild?: boolean;
  children?: React.ReactNode;
  render?: React.ReactElement;
}

function PopoverAnchor({ asChild, children, render }: PopoverAnchorProps) {
  'use no memo';

  const ctx = React.useContext(PopoverAnchorContext);

  const setRef = React.useCallback(
    (node: Element | null) => {
      if (ctx !== undefined) {
        ctx.anchorRef.current = node;
        ctx.setHasAnchor(Boolean(node));
      }
    },
    [ctx]
  );

  const renderedChild = render && children !== undefined ? React.cloneElement(render, undefined, children) : render;
  const child = renderedChild ?? (asChild === true && React.isValidElement(children) ? children : undefined);

  if (child) {
    return (
      <Slot data-slot="popover-anchor" ref={setRef}>
        {child}
      </Slot>
    );
  }

  return (
    <div data-slot="popover-anchor" ref={setRef}>
      {children}
    </div>
  );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-0.5 text-sm', className)} data-slot="popover-header" {...props} />;
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      className={(state) => cn('font-medium', typeof className === 'function' ? className(state) : className)}
      data-slot="popover-title"
      {...props}
    />
  );
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      className={(state) => cn('text-muted-foreground', typeof className === 'function' ? className(state) : className)}
      data-slot="popover-description"
      {...props}
    />
  );
}

export {
  Popover,
  PopoverAnchor,
  type PopoverAnchorProps,
  PopoverContent,
  type PopoverContentProps,
  type PopoverContextType,
  PopoverDescription,
  PopoverHeader,
  type PopoverProps,
  PopoverTitle,
  PopoverTrigger,
  type PopoverTriggerProps,
  usePopover,
};
