'use client';

import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import React from 'react';

import { usePortalContainer } from '@/registry/base-nova/protoform/hooks/use-portal-container';
import { asChildToRender, useMirroredOpen } from '@/registry/base-nova/protoform/lib/base-ui-compat';
import { cn, type PortalContentProps, type SharedProps } from '@/registry/base-nova/protoform/lib/utils';

interface TooltipContextType {
  isOpen: boolean;
}

const TooltipContext = React.createContext<TooltipContextType | undefined>(undefined);

const useTooltip = (): TooltipContextType => {
  const context = React.useContext(TooltipContext);
  if (context === undefined) {
    throw new Error('useTooltip must be used within a Tooltip');
  }
  return context;
};

type TooltipProviderProps = React.ComponentProps<typeof TooltipPrimitive.Provider> & {
  delayDuration?: number;
  skipDelayDuration?: number;
};

function TooltipProvider({ delayDuration, skipDelayDuration, ...props }: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider
      closeDelay={0}
      delay={delayDuration ?? 150}
      timeout={skipDelayDuration ?? 0}
      {...props}
    />
  );
}

type TooltipProps = React.ComponentProps<typeof TooltipPrimitive.Root> & SharedProps & { delayDuration?: number };

function Tooltip({ testId, onOpenChange, delayDuration: _delayDuration, ...props }: TooltipProps) {
  const { isOpen, handleOpenChange } = useMirroredOpen(props.open, props.defaultOpen, onOpenChange);
  const contextValue = React.useMemo(() => ({ isOpen }), [isOpen]);

  return (
    <TooltipContext.Provider value={contextValue}>
      <TooltipPrimitive.Root data-slot="tooltip" data-testid={testId} {...props} onOpenChange={handleOpenChange} />
    </TooltipContext.Provider>
  );
}

type TooltipTriggerProps = React.ComponentProps<typeof TooltipPrimitive.Trigger> &
  SharedProps & {
    asChild?: boolean;
  };

function TooltipTrigger({ testId, ...props }: TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" data-testid={testId} {...asChildToRender(props)} />;
}

type TooltipContentProps = React.ComponentProps<typeof TooltipPrimitive.Popup> &
  SharedProps &
  Pick<PortalContentProps, 'container' | 'onOpenAutoFocus'> &
  Pick<TooltipPrimitive.Positioner.Props, 'side' | 'align' | 'sideOffset' | 'alignOffset'> & {
    variant?: 'default' | 'detail';
    arrow?: boolean;
  };

function TooltipContent(contentProps: TooltipContentProps) {
  const {
    className,
    variant = 'default',
    side = 'top',
    align = 'center',
    sideOffset = 4,
    alignOffset,
    render,
    arrow = true,
    children,
    testId,
    container,
    ...props
  } = contentProps;
  Reflect.deleteProperty(props, 'onOpenAutoFocus');
  const portalContainer = usePortalContainer();

  return (
    <TooltipPrimitive.Portal container={container ?? portalContainer} data-slot="tooltip-portal">
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <TooltipPrimitive.Popup
          {...props}
          className={(state) =>
            cn(
              'relative w-fit origin-(--transform-origin) rounded-md bg-primary px-3 py-1.5 text-sm text-balance text-primary-foreground shadow-md data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 motion-reduce:data-closed:animate-none motion-reduce:data-open:animate-none',
              variant === 'detail' &&
                'bg-tooltip-detail py-2 text-tooltip-detail-foreground shadow-xl data-closed:animate-none data-open:animate-none',
              typeof className === 'function' ? className(state) : className
            )
          }
          data-slot="tooltip-content"
          data-testid={testId}
          render={render}
        >
          {children}
          {arrow === true ? (
            <TooltipPrimitive.Arrow
              className="z-50 size-2.5 rotate-45 rounded-xs bg-primary fill-primary data-[side=bottom]:top-0 data-[side=bottom]:-translate-y-1/2 data-[side=left]:right-0 data-[side=left]:translate-x-1/2 data-[side=right]:left-0 data-[side=right]:-translate-x-1/2 data-[side=top]:bottom-0 data-[side=top]:translate-y-1/2"
              data-slot="tooltip-content-arrow"
            />
          ) : null}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export {
  Tooltip,
  TooltipContent,
  type TooltipContentProps,
  type TooltipContextType,
  type TooltipProps,
  TooltipProvider,
  type TooltipProviderProps,
  TooltipTrigger,
  type TooltipTriggerProps,
  useTooltip,
};
