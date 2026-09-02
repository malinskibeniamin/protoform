import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function DeleteSubmitButton({
  disabled,
  testId,
}: {
  children: ReactNode;
  disabled?: boolean | undefined;
  testId?: string | undefined;
}) {
  return (
    <Button disabled={disabled} testId={testId} type="submit" variant="destructive">
      {disabled ? "Deleting…" : "Delete book"}
    </Button>
  );
}
