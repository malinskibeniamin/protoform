"use client";

import type { DescMessage } from "@bufbuild/protobuf";
import React from "react";
import type { ProtoConversionOptions } from "../../lib/protobuf-provider";

import { AutoFormContext, type AutoFormContextValue } from "./context";
import type {
  AutoFormFieldComponents,
  AutoFormUIComponents,
  ParsedField,
  ParsedSchema,
  SchemaProvider,
} from "./core-types";
import type { DataProviderRegistry } from "./data-providers";
import { type AutoFormEngine, useAutoFormEngine } from "./engine";
import { getFieldUiConfig, isRecord, isValidationSuccess } from "./helpers";
import { protoFormValuesToPayload, protoPayloadToFormValues } from "./proto";
import type { FieldTypeRegistry } from "./registry";
import type {
  AutoFormMode,
  AutoFormPayloadBuilderContext,
  AutoFormSummaryContext,
  AutoFormUiRule,
  DeprecatedFieldPolicy,
} from "./types";
import { evaluateUiRules } from "./ui-rules";
import { isPromiseLike, safeStringify } from "./utils/serialization";

interface PayloadBag<TNativeForm> {
  handleFormatJson: () => void;
  handleJsonTextChange: (value: string) => void;
  handleResetJson: () => void;
  jsonEditorError: string | undefined;
  jsonEditorText: string;
  payloadState: { bestEffort: boolean; payload: unknown };
  payloadText: string;
  summaryContext: AutoFormSummaryContext<TNativeForm>;
}

interface AutoFormRuntimeProviderProps<TNativeForm> {
  advancedFields: ParsedField[];
  children: React.ReactNode;
  conversionOptions?: ProtoConversionOptions | undefined;
  dataProviders?: DataProviderRegistry | undefined;
  deprecatedFields: DeprecatedFieldPolicy;
  fieldRegistry?: FieldTypeRegistry<string> | undefined;
  formComponents: AutoFormFieldComponents;
  mode: AutoFormMode;
  onFieldChange?: ((fieldPath: string, value: unknown, form: TNativeForm) => void | Promise<void>) | undefined;
  payloadBuilder?:
    | ((values: Record<string, unknown>, context: AutoFormPayloadBuilderContext<TNativeForm>) => unknown)
    | undefined;
  payloadParser?:
    | ((
        payload: unknown,
        context: AutoFormPayloadBuilderContext<TNativeForm>
      ) => Record<string, unknown> | undefined | Promise<Record<string, unknown> | undefined>)
    | undefined;
  payloadSchema?:
    | {
        safeParse: (data: unknown) => {
          success: boolean;
          error?: { issues: Array<{ path: unknown[]; message: string }> };
        };
      }
    | undefined;
  renderContent: (bag: PayloadBag<TNativeForm>) => React.ReactNode;
  resolvedSchema: {
    provider: SchemaProvider<Record<string, unknown>>;
    parsedSchema: ParsedSchema;
    isProto: boolean;
    protoDesc?: DescMessage | undefined;
    resolver?: unknown | undefined;
  };
  simpleFields: ParsedField[];
  testIdPrefix: string;
  uiComponents: AutoFormUIComponents;
}

//  -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1-
// AutoFormPayloadController — leaf component that owns payload/JSON state.
// Uses useDeferredValue so expensive payload computation (SchemaProvider
// validation, proto conversion, payloadBuilder) doesn't block typing on large forms.
//  -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1-

function AutoFormPayloadController<TNativeForm>({
  watchedValues,
  methods,
  resolvedSchema,
  mode,
  simpleFields,
  advancedFields,
  payloadBuilder,
  payloadParser,
  payloadSchema,
  renderContent,
  conversionOptions,
}: {
  watchedValues: Record<string, unknown>;
  methods: AutoFormEngine;
  resolvedSchema: AutoFormRuntimeProviderProps<TNativeForm>["resolvedSchema"];
  mode: AutoFormMode;
  simpleFields: ParsedField[];
  advancedFields: ParsedField[];
  payloadBuilder: AutoFormRuntimeProviderProps<TNativeForm>["payloadBuilder"];
  payloadParser: AutoFormRuntimeProviderProps<TNativeForm>["payloadParser"];
  payloadSchema: AutoFormRuntimeProviderProps<TNativeForm>["payloadSchema"];
  conversionOptions: AutoFormRuntimeProviderProps<TNativeForm>["conversionOptions"];
  renderContent: AutoFormRuntimeProviderProps<TNativeForm>["renderContent"];
}) {
  const deferredValues = React.useDeferredValue(watchedValues);
  const payloadValidationController = React.useMemo(() => new AbortController(), []);

  React.useEffect(
    function abortPayloadValidation() {
      return () => payloadValidationController.abort();
    },
    [payloadValidationController]
  );

  const payloadContextBase = React.useMemo(
    () => ({
      advancedFields,
      autoForm: methods,
      form: methods.nativeForm as TNativeForm,
      isProto: resolvedSchema.isProto,
      mode,
      protoDesc: resolvedSchema.protoDesc,
      schema: resolvedSchema.parsedSchema,
      simpleFields,
    }),
    [
      advancedFields,
      methods,
      mode,
      resolvedSchema.isProto,
      resolvedSchema.parsedSchema,
      resolvedSchema.protoDesc,
      simpleFields,
    ]
  );

  const payloadState = React.useMemo(() => {
    let validationSuccess = false;
    let validatedData: unknown;
    let bestEffort = false;

    try {
      const validationResult = resolvedSchema.provider.validateSchema(deferredValues as never, {
        signal: payloadValidationController.signal,
      });
      if (isPromiseLike(validationResult)) {
        // Payload preview is best-effort; the engine's awaited validation path
        // owns user-visible errors. Observe rejection here to avoid leaking it.
        Promise.resolve(validationResult).catch(() => undefined);
        bestEffort = true;
      } else if (isValidationSuccess(validationResult)) {
        validationSuccess = true;
        validatedData = validationResult.data;
      } else {
        bestEffort = true;
      }
    } catch {
      bestEffort = true;
    }

    let payload: unknown;

    if (payloadBuilder) {
      try {
        payload = payloadBuilder(deferredValues, payloadContextBase as AutoFormPayloadBuilderContext<TNativeForm>);
      } catch {
        bestEffort = true;
      }
    }

    if (payload === undefined) {
      if (resolvedSchema.isProto && resolvedSchema.protoDesc) {
        payload = protoFormValuesToPayload(resolvedSchema.protoDesc, deferredValues, conversionOptions);
        bestEffort ||= !validationSuccess;
      } else if (validationSuccess) {
        payload = validatedData;
      } else {
        payload = deferredValues;
        bestEffort = true;
      }
    }

    if (payloadSchema && payload !== undefined) {
      const validation = payloadSchema.safeParse(payload);
      if (!validation.success) {
        bestEffort = true;
      }
    }

    return { bestEffort, payload };
  }, [
    deferredValues,
    conversionOptions,
    payloadBuilder,
    payloadContextBase,
    payloadSchema,
    payloadValidationController.signal,
    resolvedSchema.isProto,
    resolvedSchema.protoDesc,
    resolvedSchema.provider,
  ]);

  const payloadText = React.useMemo(() => safeStringify(payloadState.payload), [payloadState.payload]);
  const [jsonEditorText, setJsonEditorText] = React.useState(payloadText);
  const [jsonEditorError, setJsonEditorError] = React.useState<string>();

  React.useEffect(() => {
    if (!jsonEditorError) {
      setJsonEditorText(payloadText);
    }
  }, [jsonEditorError, payloadText]);

  const applySeqRef = React.useRef(0);

  const applyPayloadToForm = React.useCallback(
    async (incoming: unknown) => {
      applySeqRef.current += 1;
      const seq = applySeqRef.current;
      try {
        let nextValues: Record<string, unknown> | undefined;

        if (payloadParser) {
          const parsed = payloadParser(incoming, payloadContextBase as AutoFormPayloadBuilderContext<TNativeForm>);
          nextValues = isPromiseLike(parsed) ? await parsed : parsed;
        } else if (resolvedSchema.isProto && resolvedSchema.protoDesc) {
          nextValues = protoPayloadToFormValues(resolvedSchema.protoDesc, incoming);
        } else if (isRecord(incoming)) {
          nextValues = incoming;
        }

        if (applySeqRef.current !== seq) {
          return;
        }

        if (!nextValues) {
          setJsonEditorError("AutoForm could not map this JSON payload back into the form.");
          return;
        }

        methods.reset(nextValues, { keepDefaultValues: true });
        setJsonEditorError(undefined);
      } catch (error) {
        if (applySeqRef.current !== seq) {
          return;
        }
        setJsonEditorError(error instanceof Error ? error.message : "AutoForm could not apply this payload.");
      }
    },
    [methods, payloadContextBase, payloadParser, resolvedSchema.isProto, resolvedSchema.protoDesc]
  );

  const handleJsonTextChange = React.useCallback(
    (value: string) => {
      setJsonEditorText(value);
      try {
        const parsed = JSON.parse(value);
        setJsonEditorError(undefined);
        applyPayloadToForm(parsed).catch((error: unknown) => {
          setJsonEditorError(error instanceof Error ? error.message : "AutoForm could not apply this payload.");
        });
      } catch (error) {
        setJsonEditorError(error instanceof Error ? error.message : "Invalid JSON");
      }
    },
    [applyPayloadToForm]
  );

  const handleResetJson = React.useCallback(() => {
    setJsonEditorError(undefined);
    setJsonEditorText(payloadText);
  }, [payloadText]);

  const handleFormatJson = React.useCallback(() => {
    try {
      const parsed = JSON.parse(jsonEditorText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonEditorText(formatted);
      setJsonEditorError(undefined);
      applyPayloadToForm(parsed).catch((error: unknown) => {
        setJsonEditorError(error instanceof Error ? error.message : "AutoForm could not apply this payload.");
      });
    } catch (error) {
      setJsonEditorError(error instanceof Error ? error.message : "Invalid JSON");
    }
  }, [applyPayloadToForm, jsonEditorText]);

  const summaryContext = React.useMemo<AutoFormSummaryContext<TNativeForm>>(
    () => ({
      ...(payloadContextBase as AutoFormPayloadBuilderContext<TNativeForm>),
      bestEffort: payloadState.bestEffort,
      payload: payloadState.payload,
    }),
    [payloadContextBase, payloadState.bestEffort, payloadState.payload]
  );

  return (
    <>
      {renderContent({
        handleFormatJson,
        handleJsonTextChange,
        handleResetJson,
        jsonEditorError,
        jsonEditorText,
        payloadState,
        payloadText,
        summaryContext,
      })}
    </>
  );
}

//  -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1-
// AutoFormRuntimeProvider — provides the AutoFormContext with live form values.
// Payload computation is delegated to the AutoFormPayloadController child.
//  -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1 -= 1-

export function AutoFormRuntimeProvider<TNativeForm>({
  children: _children,
  uiComponents,
  formComponents,
  testIdPrefix,
  fieldRegistry,
  conversionOptions,
  dataProviders,
  deprecatedFields,
  resolvedSchema,
  mode,
  simpleFields,
  advancedFields,
  payloadBuilder,
  payloadParser,
  payloadSchema,
  renderContent,
  onFieldChange,
}: AutoFormRuntimeProviderProps<TNativeForm>) {
  const methods = useAutoFormEngine();
  const watchedValues = methods.values;

  const prevValuesRef = React.useRef<Record<string, unknown>>(watchedValues);

  React.useEffect(() => {
    // Note: only fires for root-level field keys. Nested changes (e.g. address.city)
    // fire as onFieldChange("address", ...) when the parent object reference changes.
    if (!onFieldChange) {
      return;
    }
    const prev = prevValuesRef.current;
    for (const key of Object.keys(watchedValues)) {
      if (watchedValues[key] !== prev[key]) {
        Promise.resolve()
          .then(() => onFieldChange(key, watchedValues[key], methods.nativeForm as TNativeForm))
          .catch((error: unknown) => {
            methods.setRootError(error instanceof Error ? error.message : "Field change handler failed.");
          });
      }
    }
    prevValuesRef.current = { ...watchedValues };
  }, [watchedValues, onFieldChange, methods]);

  const contextValue = React.useMemo<AutoFormContextValue>(
    () => ({
      dataProviders,
      deprecatedFields,
      evaluateRules: (rules: AutoFormUiRule[] | undefined, fieldValue?: unknown) =>
        evaluateUiRules(rules, { form: watchedValues, thisValue: fieldValue }),
      fieldRegistry,
      formComponents,
      formValues: watchedValues,
      getFieldUiConfig,
      testIdPrefix,
      uiComponents,
    }),
    [dataProviders, deprecatedFields, fieldRegistry, formComponents, uiComponents, testIdPrefix, watchedValues]
  );

  return (
    <AutoFormContext.Provider value={contextValue}>
      <AutoFormPayloadController<TNativeForm>
        advancedFields={advancedFields}
        conversionOptions={conversionOptions}
        methods={methods}
        mode={mode}
        payloadBuilder={payloadBuilder}
        payloadParser={payloadParser}
        payloadSchema={payloadSchema}
        renderContent={renderContent}
        resolvedSchema={resolvedSchema}
        simpleFields={simpleFields}
        watchedValues={watchedValues}
      />
    </AutoFormContext.Provider>
  );
}
