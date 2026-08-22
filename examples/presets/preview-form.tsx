import type { ComponentProps } from "react";
import { cn } from "@/registry/base-nova/protoform/lib/utils";

interface PreviewFormProps
  extends Pick<ComponentProps<"form">, "children" | "className" | "onBlurCapture" | "onSubmit"> {
  testId?: string;
}

export function PreviewForm({ children, className, onBlurCapture, onSubmit, testId }: PreviewFormProps) {
  return (
    <form
      className={cn(
        "space-y-4 [&_[data-slot=auto-form-actions]]:mt-2 [&_[data-slot=auto-form-field-row]]:py-3 [&_[data-slot=auto-form-field-row]]:first:pt-0 [&_[data-slot=auto-form-fields]]:grid [&_[data-slot=auto-form-fields]]:gap-x-5 [&_[data-slot=auto-form-fields]]:divide-y-0 sm:[&_[data-slot=auto-form-fields]]:grid-cols-2",
        className
      )}
      data-testid={testId}
      onBlurCapture={onBlurCapture}
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
}
