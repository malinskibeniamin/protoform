"use client";

import { type DescMessage, isMessage, type MessageShape, type MessageValidType } from "@bufbuild/protobuf";
import type { FieldMask } from "@bufbuild/protobuf/wkt";
import {
  type DeepKeys,
  type DefaultReactFormComponentMap,
  type FieldUpdateOptions,
  type FormOptions,
  type FormValidators,
  type ReactFormApi,
  type StandardSchemaV1,
  type ToFormErrorTypes,
  useForm,
} from "@tanstack/react-form-v2";
import {
  createUpdateMask as createDirtyUpdateMask,
  createProtoFormSchema,
  dirtyFieldsFromValues,
  formValuesToProto,
  type ProtoConversionOptions,
} from "../../lib/protobuf-provider";

type FormValues = Record<string, unknown>;

interface ProtoFormValidator<Values extends FormValues, Desc extends DescMessage> {
  run: StandardSchemaV1<Values, MessageValidType<Desc>>;
  triggers: [];
}

type ProtoFormValidators<
  Values extends FormValues,
  Desc extends DescMessage,
  TValidators extends FormValidators<Values>,
> = readonly [...TValidators, ProtoFormValidator<Values, Desc>];

export type UseProtoFormOptions<
  Values extends FormValues,
  Desc extends DescMessage,
  TValidators extends FormValidators<Values>,
  TSubmitReturn,
> = Omit<
  FormOptions<Values, ProtoFormValidators<Values, Desc, TValidators>, TSubmitReturn, DefaultReactFormComponentMap>,
  "validators"
> & {
  emptyRepeatedStringPolicies?: ProtoConversionOptions["emptyRepeatedStringPolicies"];
  validators?: TValidators;
};

export type UseProtoFormReturn<
  Values extends FormValues,
  Desc extends DescMessage,
  TValidators extends FormValidators<Values>,
  TSubmitReturn,
> = ReactFormApi<
  Values,
  ToFormErrorTypes<ProtoFormValidators<Values, Desc, TValidators>, TSubmitReturn>,
  DefaultReactFormComponentMap
> & {
  createMessage: (values?: Values) => MessageShape<Desc>;
  createUpdateMask: () => FieldMask;
  setOneofValue: <TPath extends DeepKeys<Values>>(
    path: TPath,
    oneofCase: string,
    value: unknown,
    options?: FieldUpdateOptions
  ) => void;
};

function appendProtoValidator<
  Values extends FormValues,
  Desc extends DescMessage,
  TValidators extends FormValidators<Values>,
>(
  validators: TValidators | undefined,
  validator: ProtoFormValidator<Values, Desc>
): ProtoFormValidators<Values, Desc, TValidators> {
  return [...(validators ?? []), validator] as ProtoFormValidators<Values, Desc, TValidators>;
}

export function useProtoForm<
  Desc extends DescMessage,
  Values extends FormValues,
  const TValidators extends FormValidators<Values> = [],
  TSubmitReturn = unknown,
>(
  schema: Desc,
  options: UseProtoFormOptions<Values, Desc, TValidators, TSubmitReturn>
): UseProtoFormReturn<Values, Desc, TValidators, TSubmitReturn> {
  const { emptyRepeatedStringPolicies, validators, ...nativeOptions } = options;
  const conversionOptions: ProtoConversionOptions = {
    emptyRepeatedStringPolicies,
  };
  const protoValidator: ProtoFormValidator<Values, Desc> = {
    run: createProtoFormSchema<Values, Desc>(schema, conversionOptions),
    triggers: [],
  };
  const composedOptions: FormOptions<
    Values,
    ProtoFormValidators<Values, Desc, TValidators>,
    TSubmitReturn,
    DefaultReactFormComponentMap
  > = {
    ...nativeOptions,
    validators: appendProtoValidator(validators, protoValidator),
  };
  const form = useForm(composedOptions);
  const sourceMessage = isMessage(options.defaultValues, schema) ? options.defaultValues : undefined;

  const setOneofValue = <TPath extends DeepKeys<Values>>(
    path: TPath,
    oneofCase: string,
    value: unknown,
    updateOptions?: FieldUpdateOptions
  ) => {
    const current = form.getFieldValue(path);
    const isOneof = current === undefined || current === null || (typeof current === "object" && "case" in current);
    if (!isOneof) {
      throw new Error(
        `setOneofValue("${path}"): target is not a oneof field. Expected { case, value } shape. Use setFieldValue() for regular fields.`
      );
    }
    const previousCase = typeof current === "object" && current !== null ? Reflect.get(current, "case") : undefined;
    if (typeof previousCase === "string" && previousCase !== oneofCase) {
      Reflect.apply(form.setFieldValue, form, [path, { case: undefined, value: undefined }, updateOptions]);
    }
    Reflect.apply(form.setFieldValue, form, [path, { case: oneofCase, value }, updateOptions]);
  };

  return Object.assign(form, {
    createMessage: (values?: Values) =>
      formValuesToProto(schema, values ?? form.state.values, sourceMessage, conversionOptions),
    createUpdateMask: () =>
      createDirtyUpdateMask(
        schema,
        dirtyFieldsFromValues(form.state.values, form.defaultValues),
        form.state.values,
        form.defaultValues
      ),
    setOneofValue,
  });
}
