import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import type React from "react";

import { renderWithDataState } from "@/registry/base-nova/protoform/lib/base-ui-compat";
import { cn, type SharedProps } from "@/registry/base-nova/protoform/lib/utils";

type SwitchProps = Omit<React.ComponentProps<typeof SwitchPrimitive.Root>, "onCheckedChange"> &
  SharedProps & {
    onCheckedChange?: (checked: boolean) => void;
    size?: "default" | "sm";
  };

function Switch(allProps: SwitchProps) {
  const { className, size = "default", testId, onCheckedChange, ...props } = allProps;
  const handleCheckedChange = onCheckedChange ? (next: boolean) => onCheckedChange(next) : undefined;

  // Radix parity: when consumers explicitly pass `checked` (controlled mode) but
  // their source-of-truth starts as `undefined` (e.g. react-hook-form
  // `field.value`), Base UI's `useControlled` warns on the undefined → boolean
  // transition. Radix tolerated this silently. Normalize undefined → false only
  // when `checked` was explicitly passed — uncontrolled mode via `defaultChecked`
  // (without `checked`) keeps working unchanged.
  const hasCheckedProp = "checked" in allProps;
  const checkedOverride = hasCheckedProp && allProps.checked === undefined ? { checked: false } : undefined;

  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent outline-none transition-all after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=sm]:h-[14px] data-[size=default]:w-[32px] data-[size=sm]:w-[24px] data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      data-size={size}
      data-slot="switch"
      data-testid={testId}
      nativeButton
      onCheckedChange={handleCheckedChange}
      render={renderWithDataState("button")}
      {...props}
      {...checkedOverride}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-background ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground"
        )}
        data-slot="switch-thumb"
        render={renderWithDataState("span")}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
