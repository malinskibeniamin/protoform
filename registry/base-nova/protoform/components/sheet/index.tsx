'use client';
import { DrawerClose as SDKDrawerClose } from '@ui-sdk/react/drawer';
import { XIcon } from 'lucide-react';
import type React from 'react';
import { buttonVariants } from '@/components/ui/button/index';
import { Drawer, DrawerContent } from '@/components/ui/drawer/index';
import { cn } from '@/registry/base-nova/protoform/lib/utils';
export function Sheet({ side = 'right', ...props }: React.ComponentProps<typeof Drawer>) {
  return <Drawer side={side} {...props} />;
}
export {
  DrawerBackdrop as SheetOverlay,
  DrawerClose as SheetClose,
  DrawerDescription as SheetDescription,
  DrawerTitle as SheetTitle,
  DrawerTrigger as SheetTrigger,
} from '@/components/ui/drawer/index';

export function SheetContent({
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DrawerContent> & { showCloseButton?: boolean }) {
  const renderChildren = typeof children === 'function' ? children : () => children;
  return (
    <DrawerContent {...props}>
      {(state) => (
        <>
          {renderChildren(state)}
          {showCloseButton === true ? (
            <SDKDrawerClose
              aria-label="Close"
              className={cn(buttonVariants({ size: 'icon-sm', variant: 'ghost' }), 'absolute top-3 right-3')}
            >
              <XIcon aria-hidden="true" />
            </SDKDrawerClose>
          ) : null}
        </>
      )}
    </DrawerContent>
  );
}
export function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div {...props} className={cn('flex shrink-0 flex-col gap-0.5 p-4', className)} data-slot="sheet-header" />;
}
export function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div {...props} className={cn('mt-auto flex shrink-0 flex-col gap-2 p-4', className)} data-slot="sheet-footer" />
  );
}
