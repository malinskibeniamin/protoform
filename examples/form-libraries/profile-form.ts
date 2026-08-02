import { ConnectError } from "@connectrpc/connect";
import { protoPathToFormPath } from "@/registry/base-nova/protoform/hooks/use-proto-form";
import {
  createProtoFormSchema,
  extractFieldViolations,
} from "@/registry/base-nova/protoform/lib/protobuf-provider";

import { SubmitBasicFormRequestSchema } from "../gen/protoform/examples/v1/forms_pb.js";

export interface BasicFormValues {
  displayName: string;
  email: string;
}

export interface ProfileServerErrors {
  displayName: string[];
  email: string[];
  root: string[];
}

export const initialProfileValues: BasicFormValues = {
  displayName: "",
  email: "",
};

export const profileSchema = createProtoFormSchema<
  BasicFormValues,
  typeof SubmitBasicFormRequestSchema
>(SubmitBasicFormRequestSchema);

function emptyServerErrors(): ProfileServerErrors {
  return { displayName: [], email: [], root: [] };
}

export function mapProfileServerErrors(error: unknown): ProfileServerErrors {
  const errors = emptyServerErrors();
  if (!(error instanceof ConnectError)) {
    errors.root.push(
      error instanceof Error ? error.message : "The request could not be sent."
    );
    return errors;
  }

  const violations = extractFieldViolations(error);
  if (violations.length === 0) {
    errors.root.push(error.rawMessage || "The request could not be completed.");
    return errors;
  }

  for (const violation of violations) {
    const message = violation.description || "Invalid value.";
    const path = protoPathToFormPath(
      SubmitBasicFormRequestSchema,
      violation.field
    );
    if (path === "displayName" || path === "email") {
      errors[path].push(message);
    } else {
      errors.root.push(`${violation.field}: ${message}`);
    }
  }
  return errors;
}

export function joinErrorMessages(messages: readonly string[]) {
  return messages.length > 0 ? messages.join("\n") : undefined;
}

export function splitErrorMessages(error: unknown) {
  return typeof error === "string"
    ? error
        .split("\n")
        .filter(Boolean)
        .map((message) => ({ message }))
    : [];
}

export function firstServerErrorField(
  errors: ProfileServerErrors
): keyof BasicFormValues | undefined {
  if (errors.displayName.length > 0) {
    return "displayName";
  }
  if (errors.email.length > 0) {
    return "email";
  }
  return;
}
