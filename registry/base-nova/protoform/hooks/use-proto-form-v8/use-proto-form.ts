import { create, type DescMessage, isMessage, type MessageInitShape, type MessageShape } from '@bufbuild/protobuf';
import type { FieldMask } from '@bufbuild/protobuf/wkt';
import { ConnectError } from '@connectrpc/connect';
import { useRef, useState } from 'react';
import {
  type FieldPath,
  get as getFormValue,
  type Path,
  type SetValueConfig,
  type UseFormProps,
  type UseFormReturn,
  useForm,
} from 'react-hook-form-v8';
import { createUpdateMask as createDirtyUpdateMask } from '@/registry/base-nova/protoform/lib/protobuf-provider/field-mask.js';
import type { ProtoFormShape } from '@/registry/base-nova/protoform/lib/protobuf-provider/form-values.js';
import {
  type ConnectErrorContext,
  extractConnectErrorContext,
  extractFieldViolations,
} from '@/registry/base-nova/protoform/lib/protobuf-provider/format-error.js';
import {
  formValuesToProto,
  type ProtoConversionOptions,
  type ProtoFormOptions,
  protoToFormValues,
} from '@/registry/base-nova/protoform/lib/protobuf-provider/hook-runtime.js';
import { humanizeServerFieldError } from '@/registry/base-nova/protoform/lib/protobuf-provider/humanize-validation-error.js';

import { protoPathToFormPath } from './proto-error-path.js';
import { createProtoResolver } from './proto-resolver.js';

export type { ConnectErrorContext } from '@/registry/base-nova/protoform/lib/protobuf-provider/format-error.js';

type NestedErrors<T> = {
  [K in keyof T]?: T[K] extends object ? NestedErrors<T[K]> & { message?: string } : { message?: string };
};

export interface UseProtoFormOptions<Desc extends DescMessage>
  extends Omit<UseFormProps<ProtoFormShape<Desc>>, 'resolver' | 'defaultValues'> {
  defaultValues?:
    | UseFormProps<ProtoFormShape<Desc>>['defaultValues']
    | MessageShape<Desc>
    | (() => Promise<MessageShape<Desc>>);
  emptyRepeatedStringPolicies?: ProtoConversionOptions['emptyRepeatedStringPolicies'];
  formatMessage?: ProtoFormOptions['formatMessage'];
  serverPathPrefix?: string;
  serverPathPrefixes?: readonly string[];
}

export type UseProtoFormReturn<Desc extends DescMessage> = Omit<UseFormReturn<ProtoFormShape<Desc>>, 'reset'> & {
  reset: (
    values?: Parameters<UseFormReturn<ProtoFormShape<Desc>>['reset']>[0] | MessageShape<Desc>,
    options?: Parameters<UseFormReturn<ProtoFormShape<Desc>>['reset']>[1]
  ) => void;
  createMessage: (values?: ProtoFormShape<Desc>) => MessageShape<Desc>;
  createUpdateMask: () => FieldMask;
  setOneofValue: (path: string, oneofCase: string, value: unknown, options?: SetValueConfig) => void;
  getNestedErrors: <T = Record<string, { message?: string }>>(path: string) => NestedErrors<T> | undefined;
  setServerErrors: (error: unknown) => {
    context: ConnectErrorContext;
    handled: boolean;
    unmapped: { field: string; description: string }[];
  };
  serverErrorContext: ConnectErrorContext | undefined;
  clearServerErrorContext: () => void;
};

export function useProtoForm<Desc extends DescMessage>(
  schema: Desc,
  options?: UseProtoFormOptions<Desc>
): UseProtoFormReturn<Desc> {
  const {
    emptyRepeatedStringPolicies,
    formatMessage,
    serverPathPrefix,
    serverPathPrefixes = [],
    mode = 'onChange',
    ...rest
  } = options ?? {};
  const conversionOptions: ProtoFormOptions = {
    emptyRepeatedStringPolicies,
    formatMessage,
  };
  const pathPrefixes =
    serverPathPrefix !== undefined && serverPathPrefix !== ''
      ? [serverPathPrefix, ...serverPathPrefixes]
      : serverPathPrefixes;
  const sourceMessage = useRef(isMessage(rest.defaultValues, schema) ? rest.defaultValues : undefined);
  const normalizeValues = (values: unknown) =>
    isMessage(values, schema) ? protoToFormValues(schema, values) : (values as ProtoFormShape<Desc>);
  const suppliedDefaults = rest.defaultValues;
  const normalizedDefaults = suppliedDefaults === undefined ? undefined : normalizeValues(suppliedDefaults);
  const defaultValues =
    typeof suppliedDefaults === 'function'
      ? async () => {
          const values = await suppliedDefaults();
          if (isMessage(values, schema)) {
            sourceMessage.current = values;
          }
          return normalizeValues(values);
        }
      : normalizedDefaults;

  const resolver = createProtoResolver(schema, conversionOptions);
  const resolveValues: typeof resolver = (values, context, resolverOptions) =>
    resolver(values, context, resolverOptions, sourceMessage.current);
  const form = useForm({
    ...rest,
    defaultValues,
    mode,
    resolver: resolveValues,
  } as unknown as UseFormProps<ProtoFormShape<Desc>>) as UseFormReturn<ProtoFormShape<Desc>>;
  const { defaultValues: initialValues, dirtyFields, errors: formErrors } = form.formState;
  const reset: UseProtoFormReturn<Desc>['reset'] = (values, keepStateOptions) => {
    const next = typeof values === 'function' ? values(form.getValues()) : values;
    if (isMessage(next, schema)) {
      sourceMessage.current = next;
    }
    form.reset(next === undefined ? undefined : normalizeValues(next), keepStateOptions);
  };
  const resetField: typeof form.resetField = (name, resetFieldOptions) => {
    form.resetField(name, resetFieldOptions);
    restoreDefaultSection(form, name, resetFieldOptions);
  };
  const createMessage = (values?: ProtoFormShape<Desc>): MessageShape<Desc> => {
    const raw = values ?? form.getValues();
    return formValuesToProto(schema, raw, sourceMessage.current, conversionOptions);
  };

  const createUpdateMask = (): FieldMask => createDirtyUpdateMask(schema, dirtyFields, form.getValues(), initialValues);

  const setOneofValue = (path: string, oneofCase: string, value: unknown, setValueOptions?: SetValueConfig) => {
    const current = form.getValues(path as Path<ProtoFormShape<Desc>>);
    const isOneof = current === undefined || current === null || (typeof current === 'object' && 'case' in current);
    if (!isOneof) {
      throw new Error(
        `setOneofValue("${path}"): target is not a oneof field. ` +
          'Expected { case, value } shape. Use setValue() for regular fields.'
      );
    }
    const prev = current as { case?: string; value?: unknown } | undefined;
    if (prev?.case !== undefined && prev?.case !== '' && prev.case !== oneofCase) {
      form.setValue(path as Path<ProtoFormShape<Desc>>, { case: '', value: {} } as never);
    }
    form.setValue(path as Path<ProtoFormShape<Desc>>, { case: oneofCase, value } as never, {
      shouldDirty: true,
      shouldValidate: true,
      ...setValueOptions,
    });
  };

  const getNestedErrors = <T = Record<string, { message?: string }>>(path: string): NestedErrors<T> | undefined => {
    const segments = path.split('.');
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
    const fieldMessages = new Map<string, string[]>();
    for (const violation of extractFieldViolations(error)) {
      const bare = stripPrefix(violation.field, pathPrefixes);
      const formPath = protoPathToFormPath(schema, bare);
      if (!(formPath !== null && formPath !== '')) {
        unmapped.push(violation);
        continue;
      }
      fieldMessages.set(formPath, [
        ...(fieldMessages.get(formPath) ?? []),
        humanizeServerFieldError(violation.description),
      ]);
    }
    for (const [path, messages] of fieldMessages) {
      form.setError(
        path as FieldPath<ProtoFormShape<Desc>>,
        {
          message: messages[0] ?? '',
          type: 'server',
          types: Object.fromEntries(messages.map((message, index) => [String(index), message])),
        },
        handled ? undefined : { shouldFocus: true }
      );
      handled = true;
    }
    return { context, handled, unmapped };
  };

  return {
    ...form,
    reset,
    resetField,
    clearServerErrorContext,
    createMessage,
    createUpdateMask,
    getNestedErrors,
    serverErrorContext,
    setOneofValue,
    setServerErrors,
  };
}

export function useProtoFormDefaults<Desc extends DescMessage>(
  schema: Desc,
  init?: MessageInitShape<Desc>
): MessageShape<Desc> {
  return create(schema, init ?? ({} as MessageInitShape<Desc>));
}

function restoreDefaultSection<Desc extends DescMessage>(
  form: UseFormReturn<ProtoFormShape<Desc>>,
  name: FieldPath<ProtoFormShape<Desc>>,
  options: Parameters<UseFormReturn<ProtoFormShape<Desc>>['resetField']>[1]
): void {
  if (options?.defaultValue !== undefined) {
    return;
  }
  form.setValue(name, getFormValue(form.formState.defaultValues, name), { shouldDirty: !options?.keepDirty });
  if (!options?.keepError) {
    form.clearErrors(name);
  }
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
