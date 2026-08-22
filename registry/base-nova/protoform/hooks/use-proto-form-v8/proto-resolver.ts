import type { DescMessage, MessageShape, MessageValidType } from "@bufbuild/protobuf";
import { type FieldError, type FieldErrors, get, type Resolver, type ResolverOptions, set } from "react-hook-form-v8";
import type { FormValues } from "../../lib/core/index.js";
import {
  humanizeValidationError,
  isGenericValidationMessage,
  PROTO_FORM_ROOT_ERROR_KEY,
  type ProtoFormOptions,
  validateFormValuesAgainstProtoSchema,
} from "../../lib/protobuf-provider/index.js";
import { createDescriptorAwareStandardSchema } from "../../lib/protobuf-provider/validation-schema.js";

function validateFieldNatively(ref: HTMLInputElement, path: string, errors: Record<string, FieldError>) {
  if (!("reportValidity" in ref)) {
    return;
  }
  const error = get(errors, path) as FieldError | undefined;
  ref.setCustomValidity(error?.message ?? "");
  ref.reportValidity();
}

function validateFieldsNatively(errors: Record<string, FieldError>, options: ResolverOptions<FormValues>) {
  for (const [path, field] of Object.entries(options.fields)) {
    if (field?.ref && "reportValidity" in field.ref) {
      validateFieldNatively(field.ref as HTMLInputElement, path, errors);
      continue;
    }
    for (const ref of field?.refs ?? []) {
      validateFieldNatively(ref, path, errors);
    }
  }
}

function isFieldArrayRoot(names: string[], path: string): boolean {
  const escapedPath = path.replace(/[[\]]/gu, "").replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return names.some((name) => name.replace(/[[\]]/gu, "").match(`^${escapedPath}\\.\\d+`));
}

function toNestErrors(
  flatErrors: Record<string, FieldError>,
  options: ResolverOptions<FormValues>
): FieldErrors<FormValues> {
  if (options.shouldUseNativeValidation) {
    validateFieldsNatively(flatErrors, options);
  }
  const nestedErrors: FieldErrors<FormValues> = {};
  for (const path of Object.keys(flatErrors)) {
    const field = get(options.fields, path) as ResolverOptions<FormValues>["fields"][string] | undefined;
    const error = Object.assign(flatErrors[path] ?? {}, {
      ref: field?.refs?.[0] ?? field?.ref,
    });
    if (isFieldArrayRoot(options.names ?? Object.keys(flatErrors), path)) {
      const fieldArrayError = { ...(get(nestedErrors, path) ?? {}) };
      set(fieldArrayError, "root", error);
      set(nestedErrors, path, fieldArrayError);
    } else {
      set(nestedErrors, path, error);
    }
  }
  return nestedErrors;
}

export function createProtoResolver<Desc extends DescMessage>(
  desc: Desc,
  options: ProtoFormOptions = {},
  source?: MessageShape<Desc>
): Resolver<FormValues, unknown, MessageValidType<Desc>> {
  const standardSchema = createDescriptorAwareStandardSchema(desc, options);

  return async (values, _context, resolverOptions) => {
    const validationResult = await validateFormValuesAgainstProtoSchema(desc, values, standardSchema, options, source);

    if (!validationResult.issues) {
      if (resolverOptions.shouldUseNativeValidation) {
        validateFieldsNatively({}, resolverOptions);
      }
      return {
        errors: {},
        values: validationResult.value,
      };
    }

    // Flatten errors, preferring custom CEL messages over generic constraint messages.
    // When a field has both (e.g., `required = true` -> "value is required" AND
    // a CEL -> "Server URL is required."), keep the custom one.
    // Then humanize whatever remains as a safety net.
    const rawErrors: Record<string, { message: string; isGeneric: boolean }> = {};
    for (const issue of validationResult.issues) {
      if (issue.path.length === 0) {
        continue;
      }
      const path = issue.path.join(".");
      const generic = isGenericValidationMessage(issue.message);
      const existing = rawErrors[path];
      if (!existing) {
        rawErrors[path] = { isGeneric: generic, message: issue.message };
      } else if (existing.isGeneric && !generic) {
        // Replace generic message with custom CEL message
        rawErrors[path] = { isGeneric: false, message: issue.message };
      }
    }

    const flatErrors: Record<string, { message: string; type: string }> = {};
    for (const [path, entry] of Object.entries(rawErrors)) {
      flatErrors[path] = {
        message: humanizeValidationError(entry.message),
        type: "validation",
      };
    }

    const nestedErrors = toNestErrors(flatErrors, resolverOptions);
    const rootMessages: string[] = [];
    for (const issue of validationResult.issues) {
      if (issue.path.length === 0) {
        rootMessages.push(humanizeValidationError(issue.message));
      }
    }

    const [rootMessage] = rootMessages;
    if (rootMessage) {
      // Object.assign keeps the intersection type: react-hook-form's
      // FieldErrors "root" slot for index-signature form types cannot be
      // satisfied by an annotated object literal.
      const errors = Object.assign(nestedErrors, {
        root: {
          message: rootMessages.join("\n"),
          type: "validation",
        },
        [PROTO_FORM_ROOT_ERROR_KEY]: {
          message: rootMessage,
          type: "validation",
        },
      });
      return {
        errors,
        values: {},
      };
    }

    return {
      errors: nestedErrors,
      values: {},
    };
  };
}
