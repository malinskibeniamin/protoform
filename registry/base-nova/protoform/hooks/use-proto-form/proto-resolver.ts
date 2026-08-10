import type {
  DescMessage,
  MessageShape,
  MessageValidType,
} from "@bufbuild/protobuf";
import { toNestErrors, validateFieldsNatively } from "@hookform/resolvers";
import type { FormValues } from "../../lib/core/index.js";
import {
  humanizeValidationError,
  isGenericValidationMessage,
  type ProtoFormOptions,
  PROTO_FORM_ROOT_ERROR_KEY,
  validateFormValuesAgainstProtoSchema,
} from "../../lib/protobuf-provider/index.js";
import { createDescriptorAwareStandardSchema } from "../../lib/protobuf-provider/validation-schema.js";
import type { Resolver } from "react-hook-form";

export function createProtoResolver<Desc extends DescMessage>(
  desc: Desc,
  options: ProtoFormOptions = {},
  source?: MessageShape<Desc>
): Resolver<FormValues, unknown, MessageValidType<Desc>> {
  const standardSchema = createDescriptorAwareStandardSchema(desc, options);

  return async (values, _context, resolverOptions) => {
    const validationResult = await validateFormValuesAgainstProtoSchema(
      desc,
      values,
      standardSchema,
      options,
      source
    );

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
    const rawErrors: Record<string, { message: string; isGeneric: boolean }> =
      {};
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
    const rootMessages = validationResult.issues
      .filter((issue) => issue.path.length === 0)
      .map((issue) => humanizeValidationError(issue.message));

    if (rootMessages.length > 0) {
      // Object.assign keeps the intersection type: react-hook-form's
      // FieldErrors "root" slot for index-signature form types cannot be
      // satisfied by an annotated object literal.
      return {
        errors: Object.assign({}, nestedErrors, {
          root: {
            message: rootMessages.join("\n"),
            type: "validation",
          },
          [PROTO_FORM_ROOT_ERROR_KEY]: {
            message: rootMessages[0],
            type: "validation",
          },
        }),
        values: {},
      };
    }

    return {
      errors: nestedErrors,
      values: {},
    };
  };
}
