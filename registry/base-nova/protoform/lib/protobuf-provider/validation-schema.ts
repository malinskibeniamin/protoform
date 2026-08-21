import {
  createRegistry,
  type DescMessage,
  isMessage,
  type MessageShape,
  type MessageValidType,
} from "@bufbuild/protobuf";
import { usedTypes } from "@bufbuild/protobuf/reflect";
import { createValidator, RuntimeError, type ValidatorOptions, type Violation } from "@bufbuild/protovalidate";
import type { StandardSchemaV1 } from "../core/index.js";

function violationToIssue(violation: Violation): StandardSchemaV1.Issue {
  const path: PropertyKey[] = [];

  for (const segment of violation.field) {
    switch (segment.kind) {
      case "field":
        if (segment.oneof) {
          path.push(segment.oneof.localName, "value");
        } else {
          path.push(segment.localName);
        }
        break;
      case "oneof":
        path.push(segment.localName);
        break;
      case "list_sub":
        path.push(segment.index);
        break;
      case "map_sub":
        path.push(
          typeof segment.key === "string" || typeof segment.key === "number" ? segment.key : String(segment.key)
        );
        break;
      case "extension":
        path.push(`[${segment.typeName}]`);
        break;
      default:
        throw new TypeError(`Unsupported violation path segment: ${String(segment satisfies never)}`);
    }
  }

  return path.length > 0 ? { message: violation.message, path } : { message: violation.message };
}

export function createDescriptorAwareStandardSchema<Desc extends DescMessage>(
  desc: Desc,
  options?: ValidatorOptions
): StandardSchemaV1<MessageShape<Desc>, MessageValidType<Desc>> {
  const registry = createRegistry(desc, ...usedTypes(desc), ...(options?.registry ? [options.registry] : []));
  const validator = createValidator({ ...options, registry });

  return {
    "~standard": {
      validate: (value) => {
        if (typeof value !== "object" || value === null) {
          return { issues: [{ message: "Expected an object" }] };
        }
        if (!isMessage(value, desc)) {
          return { issues: [{ message: "Expected a protobuf message" }] };
        }

        const result = validator.validate(desc, value);
        switch (result.kind) {
          case "valid":
            return { value: result.message };
          case "invalid":
            return { issues: result.violations.map(violationToIssue) };
          case "error":
            if (result.error instanceof RuntimeError) {
              // Runtime failures are schema defects, not user input errors. Fail
              // open so form adapters never surface CEL internals to end users.
              return {
                value: result.message as MessageValidType<Desc>,
              };
            }
            return { issues: [{ message: result.error.message }] };
          default:
            return result satisfies never;
        }
      },
      vendor: "protoform",
      version: 1,
    },
  };
}
