'use client';

import { Menubar as SDKMenubar } from '@ui-sdk/react/menubar';

import type React from 'react';
import { stateClassName } from '@/components/ui/shared/state-class-name';
import { definedProps, type UIProps } from '@/registry/base-nova/protoform/lib/sdk-props';
import type { SharedProps } from '@/registry/base-nova/protoform/lib/utils/index';

function Menubar({
  className,
  testId,
  variant,
  size,
  ...props
}: UIProps<React.ComponentProps<typeof SDKMenubar>> &
  SharedProps & { variant?: string | undefined; size?: string | undefined }) {
  return (
    <SDKMenubar
      {...definedProps(props)}
      className={stateClassName('flex items-center gap-1 rounded-md border border-border p-1', className)}
      data-size={size}
      data-testid={testId ?? props['data-testid']}
      data-variant={variant}
    />
  );
}

export {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuContextTrigger,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemIcon,
  MenuItemIndicator,
  MenuItems,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from '@/components/ui/sdk/dropdown-menu/index';
export { Menubar };
