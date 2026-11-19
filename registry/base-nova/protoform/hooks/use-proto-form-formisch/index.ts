'use client';

import type { DescMessage, MessageShape, MessageValidType } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';
import {
  type FormConfig,
  type FormStore,
  getDeepErrorEntries,
  getInput,
  type RequiredPath,
  setErrors,
  useForm,
} from '@formisch/react';
import { useCallback, useMemo } from 'react';
import {
  type GenericSchema,
  type GenericSchemaAsync,
  type InferOutput,
  type IssuePathItem,
  pipeAsync,
  rawTransformAsync,
} from 'valibot';
import {
  createUpdateMask,
  dirtyFieldsFromValues,
} from '@/registry/base-nova/protoform/lib/protobuf-provider/field-mask';
import {
  extractConnectErrorContext,
  extractFieldViolations,
  type FieldViolation,
} from '@/registry/base-nova/protoform/lib/protobuf-provider/format-error';
import {
  formValuesToProto,
  type NormalizedProtoIssue,
  type ProtoFormOptions,
  validateFormValuesAgainstProtoSchema,
} from '@/registry/base-nova/protoform/lib/protobuf-provider/hook-runtime';
import { humanizeServerFieldError } from '@/registry/base-nova/protoform/lib/protobuf-provider/humanize-validation-error';
import { protoPathToFormPath } from '@/registry/base-nova/protoform/lib/protobuf-provider/proto-error-path';
import { createDescriptorAwareStandardSchema } from '@/registry/base-nova/protoform/lib/protobuf-provider/validation-schema';

type FormValues = Record<string, unknown>;
type InputSchema = GenericSchema<FormValues, FormValues> | GenericSchemaAsync<FormValues, FormValues>;

export type FormischProtoFormOptions<Schema extends InputSchema, Desc extends DescMessage> = FormConfig<Schema> & {
  protoOptions?: ProtoFormOptions | undefined;
  sourceMessage?: MessageShape<Desc> | undefined;
};

function issuePath(values: FormValues, path: NormalizedProtoIssue['path']) {
  let input: unknown = values;
  const items: IssuePathItem[] = [];
  for (const key of path) {
    if (typeof input !== 'object' || input === null || !Object.hasOwn(input, key)) {
      return;
    }
    const value: unknown = Reflect.get(input, key);
    items.push({ input, key, origin: 'value', type: 'unknown', value });
    input = value;
  }
  const [first, ...rest] = items;
  const segments: [IssuePathItem, ...IssuePathItem[]] | undefined = first ? [first, ...rest] : undefined;
  return segments;
}

export function createFormischProtoSchema<Desc extends DescMessage, Schema extends InputSchema>(
  desc: Desc,
  schema: Schema,
  options: ProtoFormOptions = {},
  source?: MessageShape<Desc>
) {
  const messageSchema = createDescriptorAwareStandardSchema(desc, options);

  return pipeAsync(
    schema,
    rawTransformAsync<InferOutput<Schema>, MessageValidType<Desc>>(async ({ dataset, addIssue, NEVER }) => {
      const result = await validateFormValuesAgainstProtoSchema(desc, dataset.value, messageSchema, options, source);
      if (result.issues) {
        for (const issue of result.issues) {
          addIssue({ message: issue.message, path: issuePath(dataset.value, issue.path) });
        }
        return NEVER;
      }
      return result.value;
    })
  );
}

function hasInputPath(values: FormValues, path: RequiredPath) {
  let value: unknown = values;
  for (const key of path) {
    if (typeof value !== 'object' || value === null || !Object.hasOwn(value, key)) {
      return false;
    }
    value = Reflect.get(value, key);
  }
  return true;
}

const ARRAY_INDEX = /^\d+$/u;

function writeServerFieldError(form: FormStore, path: RequiredPath, message: string) {
  const previous = getDeepErrorEntries(form).find(
    (entry) => entry.path.length === path.length && entry.path.every((key, index) => key === path[index])
  )?.errors;
  if (previous?.includes(message)) {
    return true;
  }

  try {
    Reflect.apply(setErrors, undefined, [form, { errors: [...(previous ?? []), message], path }]);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('No field store found at path')) {
      return false;
    }
    throw error;
  }
}

function applyServerErrors(form: FormStore, desc: DescMessage, error: unknown) {
  const context = extractConnectErrorContext(error);
  const input = getInput(form);
  const violations = error instanceof ConnectError ? extractFieldViolations(error) : [];
  const unmapped: FieldViolation[] = [];
  for (const violation of violations) {
    const [first, ...rest] = protoPathToFormPath(desc, violation.field)?.split('.') ?? [];
    if (!first) {
      unmapped.push(violation);
      continue;
    }
    const path: RequiredPath = [first, ...rest.map((key) => (ARRAY_INDEX.test(key) ? Number(key) : key))];
    if (
      !(hasInputPath(input, path) && writeServerFieldError(form, path, humanizeServerFieldError(violation.description)))
    ) {
      unmapped.push(violation);
    }
  }
  return { context, handled: unmapped.length < violations.length, unmapped };
}

function useProtoUpdateMask(form: FormStore, desc: DescMessage) {
  const initialValues = useMemo(() => getInput(form), [form]);
  return useCallback(() => {
    const values = getInput(form);
    return createUpdateMask(desc, dirtyFieldsFromValues(values, initialValues), values, initialValues);
  }, [desc, form, initialValues]);
}

export function useProtoForm<Desc extends DescMessage, Schema extends InputSchema>(
  desc: Desc,
  { protoOptions, schema, sourceMessage, ...config }: FormischProtoFormOptions<Schema, Desc>
) {
  const composedSchema = useMemo(
    () => createFormischProtoSchema(desc, schema, protoOptions, sourceMessage),
    [desc, schema, protoOptions, sourceMessage]
  );
  const form = useForm<typeof composedSchema>({ ...config, schema: composedSchema });
  const updateMask = useProtoUpdateMask(form, desc);

  return Object.assign(form, {
    createMessage: (values: FormValues) => formValuesToProto(desc, values, sourceMessage, protoOptions),
    createUpdateMask: updateMask,
    setServerErrors: (error: unknown) => applyServerErrors(form, desc, error),
  });
}
