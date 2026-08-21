import type { DescMessage } from "@bufbuild/protobuf";
import { ConnectError } from "@connectrpc/connect";
import type { UseFormReturn } from "react-hook-form";
import { protoPathToFormPath } from "@/registry/base-nova/protoform/hooks/use-proto-form";
import { extractFieldViolations } from "@/registry/base-nova/protoform/lib/protobuf-provider";

export function applyServerFieldErrors<T extends Record<string, unknown>>(
  error: unknown,
  schema: DescMessage,
  form: UseFormReturn<Record<string, unknown>, unknown, T>
): boolean {
  if (!(error instanceof ConnectError)) {
    return false;
  }

  const violations = extractFieldViolations(error);
  if (violations.length === 0) {
    return false;
  }

  const unmapped: string[] = [];
  let focused = false;
  for (const violation of violations) {
    const path = protoPathToFormPath(schema, violation.field);
    if (!path) {
      unmapped.push(`${violation.field}: ${violation.description || "Invalid value."}`);
      continue;
    }
    form.setError(
      path,
      { message: violation.description || "Invalid value.", type: "server" },
      focused ? undefined : { shouldFocus: true }
    );
    focused = true;
  }

  if (unmapped.length > 0) {
    form.setError("root", {
      message: unmapped.join("\n"),
      type: "server",
    });
  }

  return true;
}
