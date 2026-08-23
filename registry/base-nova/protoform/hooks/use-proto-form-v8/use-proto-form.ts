import { create, type DescMessage, isMessage, type MessageInitShape, type MessageShape } from "@bufbuild/protobuf";
import type { FieldMask } from "@bufbuild/protobuf/wkt";
import { ConnectError } from "@connectrpc/connect";
import { useState } from "react";
import {
  type FieldPath,
  type Path,
  type SetValueConfig,
  type UseFormProps,
  type UseFormReturn,
  useForm,
} from "react-hook-form-v8";
import {
  type ConnectErrorContext,
  createUpdateMask as createDirtyUpdateMask,
  extractConnectErrorContext,
  extractFieldViolations,
  formValuesToProto,
  humanizeServerFieldError,
  type ProtoConversionOptions,
  type ProtoFormOptions,
} from "../../lib/protobuf-provider/index.js";

import { protoPathToFormPath } from "./proto-error-path.js";
import type { FlattenProtoOneofs } from "./proto-paths.js";
import { createProtoResolver } from "./proto-resolver.js";

export type { ConnectErrorContext } from "../../lib/protobuf-provider/index.js";

/** MessageShape with proto oneofs flattened so react-hook-form Path<T> works. */
type FormShape<Desc extends DescMessage> = FlattenProtoOneofs<MessageShape<Desc>>;

/** Extract nested error shape for a given path (e.g. oneof error drilling). */
type NestedErrors<T> = {
  [K in keyof T]?: T[K] extends object ? NestedErrors<T[K]> & { message?: string } : { message?: string };
};

export interface UseProtoFormOptions<Desc extends DescMessage> extends Omit<UseFormProps<FormShape<Desc>>, "resolver"> {
  /** Per-field repeated-string conversion overrides keyed by descriptor path. */
  emptyRepeatedStringPolicies?: ProtoConversionOptions["emptyRepeatedStringPolicies"];
  /** Translates Protoform-owned validation copy. */
  formatMessage?: ProtoFormOptions["formatMessage"];
  /**
   * Strip a leading server-path prefix before mapping server-side field
   * violations onto the form (e.g. `'notification'` when the RPC wraps the
   * message in `CreateNotificationRequest { notification: Notification }`).
   */
  serverPathPrefix?: string;
  /**
   * Strip any of several leading server-path prefixes before mapping
   * violations. Prefixes are checked in order after `serverPathPrefix`.
   */
  serverPathPrefixes?: readonly string[];
}

export type UseProtoFormReturn<Desc extends DescMessage> = UseFormReturn<FormShape<Desc>> & {
  /** Build a fully-typed protobuf message from current or provided form values. */
  createMessage: (values?: FormShape<Desc>) => MessageShape<Desc>;
  /** Build an AIP-safe FieldMask from the fields changed since the last reset. */
  createUpdateMask: () => FieldMask;
  /**
   * Set a oneof field value without casts. Marks the field dirty by default so
   * switching branches is visible to `dirtyFields`-driven FieldMask builders.
   * @example form.setOneofValue('delivery', 'webhook', create(WebhookDeliverySchema, { signingSecretRef: '' }));
   */
  setOneofValue: (path: string, oneofCase: string, value: unknown, options?: SetValueConfig) => void;
  /** Drill nested errors by form path (e.g. `'delivery.value'`) without casts. */
  getNestedErrors: <T = Record<string, { message?: string }>>(path: string) => NestedErrors<T> | undefined;
  /**
   * Map a `ConnectError` with `BadRequest.FieldViolation` details onto the form
   * by walking the proto descriptor. Snake_case field paths are converted to
   * camelCase; oneof branches flatten under `{oneofLocalName}.value`.
   *
   * Also extracts every other `google.rpc.*` detail (LocalizedMessage, Help,
   * ErrorInfo, RequestInfo, RetryInfo, DebugInfo, PreconditionFailure,
   * QuotaFailure, ResourceInfo) into `form.serverErrorContext` so the summary
   * can surface top-level message, help links, request ID, etc.
   *
   * Returns `unmapped` so the caller can fall back to a toast for field
   * violations the form can't surface, plus the full `context` for convenience.
   */
  setServerErrors: (error: unknown) => {
    context: ConnectErrorContext;
    handled: boolean;
    unmapped: { field: string; description: string }[];
  };
  /** Current backend error context (set by `setServerErrors`). Undefined when no recent error. */
  serverErrorContext: ConnectErrorContext | undefined;
  /** Clear `serverErrorContext`. Call when the user starts a new submit attempt. */
  clearServerErrorContext: () => void;
};

/**
 * Creates a react-hook-form instance with proto-driven validation.
 *
 * - Validation rules come from `buf.validate` annotations via `@bufbuild/protovalidate`.
 * - Oneofs are type-flattened so `register('config.value.apiKey')` works without casts.
 * - Default `mode: 'onChange'`.
 *
 * Caller handles submit / loading / summary. The hook derives update masks,
 * while `setServerErrors` turns backend `BadRequest.FieldViolation` details
 * into per-field form errors using descriptor metadata only.
 *
 * @example
 * ```tsx
 * const form = useProtoForm(NotificationSchema, {
 *   defaultValues: create(NotificationSchema, { displayName, enabled: true }),
 *   serverPathPrefix: 'notification',
 * });
 *
 * const onSubmit = async () => {
 *   try {
 *     const message = form.createMessage();
 *     await mutation.mutateAsync(
 *       create(CreateNotificationRequestSchema, { notification: message })
 *     );
 *     navigate(...);
 *   } catch (error) {
 *     const { handled, unmapped } = form.setServerErrors(error);
 *     if (!handled || unmapped.length > 0) toast.add({ title: "Request failed", type: "error" });
 *   }
 * };
 * ```
 */
export function useProtoForm<Desc extends DescMessage>(
  schema: Desc,
  options?: UseProtoFormOptions<Desc>
): UseProtoFormReturn<Desc> {
  const {
    emptyRepeatedStringPolicies,
    formatMessage,
    serverPathPrefix,
    serverPathPrefixes = [],
    mode = "onChange",
    ...rest
  } = options ?? {};
  const conversionOptions: ProtoFormOptions = {
    emptyRepeatedStringPolicies,
    formatMessage,
  };
  const pathPrefixes = serverPathPrefix ? [serverPathPrefix, ...serverPathPrefixes] : serverPathPrefixes;
  const sourceMessage = isMessage(rest.defaultValues, schema) ? rest.defaultValues : undefined;

  const form = useForm({
    ...rest,
    mode,
    resolver: createProtoResolver(schema, conversionOptions, sourceMessage),
  } as unknown as UseFormProps<FormShape<Desc>>) as UseFormReturn<FormShape<Desc>>;
  // Read during render so react-hook-form subscribes this hook to error updates.
  const { defaultValues: initialValues, dirtyFields, errors: formErrors } = form.formState;
  const createMessage = (values?: FormShape<Desc>): MessageShape<Desc> => {
    const raw = values ?? form.getValues();
    return formValuesToProto(schema, raw as Record<string, unknown>, sourceMessage, conversionOptions);
  };

  const createUpdateMask = (): FieldMask => createDirtyUpdateMask(schema, dirtyFields, form.getValues(), initialValues);

  const setOneofValue = (path: string, oneofCase: string, value: unknown, setValueOptions?: SetValueConfig) => {
    const current = form.getValues(path as Path<FormShape<Desc>>);
    const isOneof = current === undefined || current === null || (typeof current === "object" && "case" in current);
    if (!isOneof) {
      throw new Error(
        `setOneofValue("${path}"): target is not a oneof field. ` +
          "Expected { case, value } shape. Use setValue() for regular fields."
      );
    }
    const prev = current as { case?: string; value?: unknown } | undefined;
    if (prev?.case && prev.case !== oneofCase) {
      form.setValue(path as Path<FormShape<Desc>>, { case: "", value: {} } as never);
    }
    // `shouldDirty: true` default: switching a branch is a meaningful edit.
    form.setValue(path as Path<FormShape<Desc>>, { case: oneofCase, value } as never, {
      shouldDirty: true,
      shouldValidate: true,
      ...setValueOptions,
    });
  };

  const getNestedErrors = <T = Record<string, { message?: string }>>(path: string): NestedErrors<T> | undefined => {
    const segments = path.split(".");
    let current: unknown = formErrors;
    for (const segment of segments) {
      if (current === undefined || current === null) {
        return;
      }
      current = (current as Record<string, unknown>)[segment];
    }
    return current as NestedErrors<T> | undefined;
  };

  const [serverErrorContext, setServerErrorContext] = useState<ConnectErrorContext | undefined>(undefined);
  const clearServerErrorContext = () => setServerErrorContext(undefined);

  const setServerErrors = (error: unknown) => {
    const context = extractConnectErrorContext(error);
    setServerErrorContext(context);

    if (!(error instanceof ConnectError)) {
      return {
        context,
        handled: false,
        unmapped: [] as { field: string; description: string }[],
      };
    }
    const unmapped: { field: string; description: string }[] = [];
    let handled = false;
    for (const violation of extractFieldViolations(error)) {
      const bare = stripPrefix(violation.field, pathPrefixes);
      const formPath = protoPathToFormPath(schema, bare);
      if (!formPath) {
        unmapped.push(violation);
        continue;
      }
      form.setError(
        formPath as FieldPath<FormShape<Desc>>,
        {
          message: humanizeServerFieldError(violation.description),
          type: "server",
        },
        handled ? undefined : { shouldFocus: true }
      );
      handled = true;
    }
    return { context, handled, unmapped };
  };

  return Object.assign(form, {
    clearServerErrorContext,
    createMessage,
    createUpdateMask,
    getNestedErrors,
    serverErrorContext,
    setOneofValue,
    setServerErrors,
  });
}

/**
 * Type-safe default values helper. Wraps `create()` and returns the value typed
 * as `FormShape<Desc>` so `defaultValues` compiles cleanly.
 */
export function useProtoFormDefaults<Desc extends DescMessage>(
  schema: Desc,
  init?: MessageInitShape<Desc>
): FormShape<Desc> {
  return create(schema, init ?? ({} as MessageInitShape<Desc>)) as unknown as FormShape<Desc>;
}

function stripPrefix(field: string, prefixes: readonly string[]): string {
  for (const prefix of prefixes) {
    if (!prefix) {
      continue;
    }
    const withDot = `${prefix}.`;
    if (field.startsWith(withDot)) {
      return field.slice(withDot.length);
    }
  }
  return field;
}
