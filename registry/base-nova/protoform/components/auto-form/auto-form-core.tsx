'use client';

import {
  createUpdateMask,
  formValuesToProto,
  preserveProtoMessageSource,
} from '../../lib/protobuf-provider';
import React from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/registry/base-nova/protoform/components/alert';
import { TooltipProvider } from '@/registry/base-nova/protoform/components/tooltip';
import { Heading, Text } from '@/registry/base-nova/protoform/components/typography';

import type { SchemaValidation } from './core-types';
import type { AutoFormEngine } from './engine';
import {
  ArrayElementWrapper,
  ArrayWrapper,
  ErrorMessage,
  FieldWrapper,
  Form,
  ObjectWrapper,
  SubmitButton,
} from './field-wrapper';
import { AutoFormFieldComponentRegistry } from './fields';
import { deriveSimpleFields } from './helpers';
import { AutoFormModeShell } from './mode-shell';
import {
  getProtoMessageUiConfig,
  isProtoMessageDescriptor,
  isProtoProvider,
  PROTO_FORM_ROOT_ERROR_KEY,
  resolveProtoSourceMessage,
} from './proto';
import { AutoFormFields } from './renderers';
import { AutoFormRuntimeProvider } from './runtime-provider';
import {
  mergeFieldOverrides,
  normalizeProtoInitialValues,
  protoConversionOptionsFromFieldConfig,
  resolveSchema,
} from './schema';
import { AutoFormStepPanel, fieldsForStep, initialStepIndex, validateSteps } from './stepper';
import { buildAutoFormTestId, resolveAutoFormTestIdPrefix } from './test-ids';
import type {
  AutoFormMode,
  AutoFormProps,
  AutoFormRevalidationMode,
  AutoFormStepperConfig,
  AutoFormSubmitContext,
  AutoFormValidationMode,
  ResolvedSchema,
} from './types';
import { normalizeModes, resolveInitialMode } from './utils/modes';

const noopOnSubmit = async () => undefined;

const ShadcnUIComponents = {
  Form,
  FieldWrapper,
  ErrorMessage,
  SubmitButton,
  ObjectWrapper,
  ArrayWrapper,
  ArrayElementWrapper,
};

export const ShadcnAutoFormFieldComponents = AutoFormFieldComponentRegistry;

export type AutoFormEngineRender = (props: {
  children: (engine: AutoFormEngine) => React.ReactNode;
  defaultValues: Record<string, unknown>;
  validateSchema: (
    values: Record<string, unknown>,
    signal: AbortSignal
  ) => Promise<SchemaValidation>;
  values?: Record<string, unknown>;
}) => React.ReactNode;

export type AutoFormCoreProps<
  T extends Record<string, unknown>,
  TNativeForm,
  TCustomFieldType extends string = never,
> = Omit<
  AutoFormProps<T, TNativeForm, never, never, TCustomFieldType>,
  'formOptions' | 'resolver'
> & {
  renderEngine: AutoFormEngineRender;
};

function renderModeContent({
  fields,
  testIdPrefix,
  withSubmit,
  children,
  SubmitButtonComponent,
  stepper,
  currentStepIndex,
  onStepBack,
  onStepContinue,
  isAdvancing,
  isSubmitting,
}: {
  fields: ReturnType<typeof mergeFieldOverrides>;
  testIdPrefix: string;
  withSubmit: boolean;
  children: React.ReactNode;
  SubmitButtonComponent: React.ComponentType<{
    children: React.ReactNode;
    disabled?: boolean;
    testId?: string;
  }>;
  stepper?: AutoFormStepperConfig;
  currentStepIndex: number;
  onStepBack: () => void;
  onStepContinue: (fields: ReturnType<typeof mergeFieldOverrides>) => void | Promise<void>;
  isAdvancing: boolean;
  isSubmitting: boolean;
}) {
  if (stepper) {
    const step = stepper.steps[currentStepIndex];
    if (!step) {
      return null;
    }
    const stepFields = fieldsForStep(fields, stepper.steps, step.id);
    return (
      <AutoFormStepPanel
        currentIndex={currentStepIndex}
        isAdvancing={isAdvancing}
        onBack={onStepBack}
        onContinue={() => onStepContinue(stepFields)}
        orientation={stepper.orientation ?? 'horizontal'}
        step={step}
        steps={stepper.steps}
        submit={
          withSubmit ? (
            <SubmitButtonComponent
              disabled={isSubmitting}
              testId={buildAutoFormTestId(testIdPrefix, 'submit')}
            >
              {isSubmitting ? 'Submitting…' : 'Submit'}
            </SubmitButtonComponent>
          ) : null
        }
      >
        <AutoFormFields fields={stepFields}>{children}</AutoFormFields>
      </AutoFormStepPanel>
    );
  }

  return (
    <>
      <AutoFormFields fields={fields}>{children}</AutoFormFields>
      {withSubmit ? (
        <div
          className="flex items-center justify-end border-border/60 border-t pt-5"
          data-slot="auto-form-actions"
        >
          <SubmitButtonComponent disabled={isSubmitting} testId={buildAutoFormTestId(testIdPrefix, 'submit')}>
            {isSubmitting ? 'Submitting…' : 'Submit'}
          </SubmitButtonComponent>
        </div>
      ) : null}
    </>
  );
}

type AutoFormContentProps<
  T extends Record<string, unknown>,
  TNativeForm,
  TCustomFieldType extends string,
> = Omit<
  AutoFormCoreProps<T, TNativeForm, TCustomFieldType>,
  'defaultValues' | 'renderEngine' | 'schema' | 'values'
> & {
  engine: AutoFormEngine;
  resolvedSchema: ResolvedSchema;
};

function AutoFormContent<
  T extends Record<string, unknown>,
  TNativeForm,
  TCustomFieldType extends string,
>({
  engine,
  resolvedSchema,
  testId,
  onSubmit = noopOnSubmit,
  children,
  uiComponents,
  formComponents,
  withSubmit = false,
  onFormInit,
  formProps = {},
  fieldConfig: fieldConfigOverrides,
  modes,
  defaultMode,
  showSummary = false,
  renderSummary,
  fieldRegistry,
  dataProviders,
  deprecatedFields = 'show',
  classifyField,
  payloadSchema,
  payloadBuilder,
  payloadParser,
  onFieldChange,
  renderRootHeader,
  rootHeader = 'auto',
  stepper,
  validationMode = 'submit',
  revalidationMode = 'change',
}: AutoFormContentProps<T, TNativeForm, TCustomFieldType>) {
  const testIdPrefix = resolveAutoFormTestIdPrefix(testId);
  const submitController = React.useRef<AbortController | undefined>(undefined);
  const validationController = React.useRef<AbortController | undefined>(undefined);
  const initializedForm = React.useRef<unknown>(undefined);
  const advancedFields = mergeFieldOverrides(resolvedSchema.parsedSchema.fields, fieldConfigOverrides);
  const simpleFields = deriveSimpleFields(advancedFields, classifyField);
  const protoMessageUi = resolvedSchema.protoDesc ? getProtoMessageUiConfig(resolvedSchema.protoDesc) : undefined;
  const rootHeaderMetadata = {
    description: protoMessageUi?.description,
    title: protoMessageUi?.title,
  };
  const mergedUiComponents = { ...ShadcnUIComponents, ...uiComponents };
  const mergedFormComponents = { ...ShadcnAutoFormFieldComponents, ...formComponents };
  const conversionOptions = protoConversionOptionsFromFieldConfig(fieldConfigOverrides);
  const availableModes = normalizeModes(modes);
  const preferredMode = resolveInitialMode(availableModes, defaultMode);
  const [mode, setMode] = React.useState<AutoFormMode>(preferredMode);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(() =>
    stepper ? initialStepIndex(stepper.steps, stepper.defaultStep) : 0
  );
  const previousStepIndex = React.useRef(currentStepIndex);
  const [isAdvancing, setIsAdvancing] = React.useState(false);
  const previousDefaultMode = React.useRef(defaultMode);
  const previousLifecycleValues = React.useRef(engine.values);
  const hasSubmitted = React.useRef(false);

  if (stepper) {
    validateSteps(stepper.steps);
  }

  React.useEffect(() => {
    if (initializedForm.current !== engine.nativeForm) {
      initializedForm.current = engine.nativeForm;
      onFormInit?.(engine.nativeForm as TNativeForm);
    }
  }, [engine.nativeForm, onFormInit]);

  React.useEffect(function abortAsyncWorkOnUnmount() {
    return () => {
      submitController.current?.abort();
      validationController.current?.abort();
    };
  }, []);

  React.useEffect(() => {
    if (!availableModes.includes(mode)) {
      setMode(preferredMode);
      previousDefaultMode.current = defaultMode;
      return;
    }

    if (previousDefaultMode.current !== defaultMode) {
      previousDefaultMode.current = defaultMode;
      if (defaultMode && availableModes.includes(defaultMode)) {
        setMode(defaultMode);
      }
    }
  }, [availableModes, defaultMode, mode, preferredMode]);

  async function validateWithProvider(
    submittedValues: Record<string, unknown>,
    signal: AbortSignal
  ): Promise<SchemaValidation> {
    try {
      return await Promise.resolve(resolvedSchema.provider.validateSchema(submittedValues, { signal }));
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            path: [],
            message: error instanceof Error ? error.message : 'Failed to validate form values.',
          },
        ],
      };
    }
  }

  function activeValidationMode(): AutoFormValidationMode | AutoFormRevalidationMode {
    return hasSubmitted.current ? revalidationMode : validationMode;
  }

  async function runLifecycleValidation(valuesToValidate: Record<string, unknown>) {
    if (engine.validatesSchema) {
      return;
    }
    const controller = beginValidation();
    const result = await validateWithProvider(valuesToValidate, controller.signal);
    if (controller.signal.aborted) {
      return;
    }
    engine.setValidationErrors(result.success ? [] : result.errors);
  }

  React.useEffect(() => {
    if (previousLifecycleValues.current === engine.values) {
      return;
    }
    previousLifecycleValues.current = engine.values;
    if (activeValidationMode() === 'change') {
      void runLifecycleValidation(engine.values);
    }
  }, [engine.values, revalidationMode, validationMode]);

  function routeToFirstStepError() {
    if (!stepper) {
      return;
    }
    const targetStepIndex = stepper.steps.findIndex((step) =>
      fieldsForStep(advancedFields, stepper.steps, step.id).some((field) =>
        engine.getFieldInvalid(field.key)
      )
    );
    if (targetStepIndex < 0) {
      return;
    }
    if (targetStepIndex !== currentStepIndex) {
      setCurrentStepIndex(targetStepIndex);
      return;
    }
    const firstErrorField = fieldsForStep(
      advancedFields,
      stepper.steps,
      stepper.steps[targetStepIndex]?.id ?? ''
    ).find((field) => engine.getFieldInvalid(field.key));
    if (firstErrorField) {
      engine.focus(firstErrorField.key);
    }
  }

  function beginSubmit() {
    submitController.current?.abort();
    validationController.current?.abort();
    const controller = new AbortController();
    submitController.current = controller;
    return controller;
  }

  function beginValidation() {
    validationController.current?.abort();
    const controller = new AbortController();
    validationController.current = controller;
    return controller;
  }

  function getSubmitContext(signal: AbortSignal): AutoFormSubmitContext {
    return {
      form: engine,
      signal,
      updateMask: resolvedSchema.protoDesc
        ? createUpdateMask(
            resolvedSchema.protoDesc,
            engine.dirtyFields,
            engine.getValues(),
            engine.defaultValues
          )
        : undefined,
    };
  }

  async function submitValidatedValues(values: T, controller: AbortController) {
    try {
      const context = getSubmitContext(controller.signal);
      await engine.runNativeSubmit?.();
      if (controller.signal.aborted) {
        return;
      }
      const validatedProtoMessage = resolvedSchema.protoDesc
        ? resolveProtoSourceMessage(resolvedSchema.protoDesc, values)
        : undefined;
      const submittedValues = resolvedSchema.protoDesc
        ? validatedProtoMessage
          ? preserveProtoMessageSource(
              resolvedSchema.protoDesc,
              validatedProtoMessage,
              resolvedSchema.protoSource as never
            )
          : formValuesToProto(
              resolvedSchema.protoDesc,
              values,
              resolvedSchema.protoSource as never,
              conversionOptions
            )
        : values;
      await onSubmit(submittedValues as T, engine.nativeForm as TNativeForm, context);
      if (!controller.signal.aborted) {
        routeToFirstStepError();
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        engine.setRootError(error instanceof Error ? error.message : 'Submission failed.');
      }
    }
  }

  async function handleSubmit(submittedValues: Record<string, unknown>) {
    hasSubmitted.current = true;
    const controller = beginSubmit();
    engine.clearErrors(['root', PROTO_FORM_ROOT_ERROR_KEY]);

    if (engine.validatesSchema) {
      await submitValidatedValues(submittedValues as T, controller);
      return;
    }

    const validationResult = await validateWithProvider(submittedValues, controller.signal);
    if (controller.signal.aborted) {
      return;
    }
    if (!validationResult.success) {
      engine.setValidationErrors(validationResult.errors);
      routeToFirstStepError();
      return;
    }
    await submitValidatedValues(validationResult.data as T, controller);
  }

  function handleStepBack() {
    validationController.current?.abort();
    setIsAdvancing(false);
    setCurrentStepIndex((index) => Math.max(0, index - 1));
  }

  async function handleStepContinue(stepFields: ReturnType<typeof mergeFieldOverrides>) {
    if (!stepper || isAdvancing) {
      return;
    }
    setIsAdvancing(true);
    const controller = beginValidation();
    const fieldNames = stepFields.map((field) => field.key);
    engine.clearErrors([...fieldNames, 'root', PROTO_FORM_ROOT_ERROR_KEY]);

    try {
      const nativeValid = await engine.trigger(engine.validatesSchema ? undefined : fieldNames);
      if (controller.signal.aborted) {
        return;
      }

      if (engine.validatesSchema) {
        if (nativeValid) {
          setCurrentStepIndex((index) => Math.min(stepper.steps.length - 1, index + 1));
        } else {
          const firstInvalid = fieldNames.find(engine.getFieldInvalid);
          if (firstInvalid) {
            engine.focus(firstInvalid);
          }
        }
        return;
      }

      const validationResult = await validateWithProvider(engine.getValues(), controller.signal);
      if (controller.signal.aborted) {
        return;
      }
      const currentFields = new Set(fieldNames);
      const currentErrors = validationResult.success
        ? []
        : validationResult.errors.filter((error) => {
            const root = error.path[0];
            return error.path.length === 0 || (typeof root === 'string' && currentFields.has(root));
          });
      if (currentErrors.length > 0) {
        engine.setValidationErrors(currentErrors);
        const firstFieldError = currentErrors.find((error) => error.path.length > 0);
        if (firstFieldError) {
          engine.focus(firstFieldError.path.join('.'));
        }
        return;
      }
      if (nativeValid) {
        setCurrentStepIndex((index) => Math.min(stepper.steps.length - 1, index + 1));
      }
    } finally {
      if (validationController.current === controller && !controller.signal.aborted) {
        setIsAdvancing(false);
      }
    }
  }

  React.useEffect(() => {
    if (!stepper) {
      return;
    }
    const fieldErrorKeys = Object.keys(engine.errors);
    if (fieldErrorKeys.length === 0) {
      return;
    }
    const targetStepIndex = stepper.steps.findIndex((step) => {
      const stepFieldKeys = new Set(
        fieldsForStep(advancedFields, stepper.steps, step.id).map((field) => field.key)
      );
      return fieldErrorKeys.some((key) => stepFieldKeys.has(key));
    });
    if (targetStepIndex >= 0 && targetStepIndex !== currentStepIndex) {
      setCurrentStepIndex(targetStepIndex);
    }
  }, [advancedFields, currentStepIndex, engine.errors, stepper]);

  React.useEffect(() => {
    if (!stepper || previousStepIndex.current === currentStepIndex) {
      return;
    }
    previousStepIndex.current = currentStepIndex;
    const step = stepper.steps[currentStepIndex];
    const firstField = step ? fieldsForStep(advancedFields, stepper.steps, step.id)[0] : undefined;
    if (firstField) {
      engine.focus(firstField.key);
    }
  }, [advancedFields, currentStepIndex, engine, stepper]);

  function renderFormForMode(targetMode: Exclude<AutoFormMode, 'json'>) {
    return renderModeContent({
      fields: targetMode === 'simple' ? simpleFields : advancedFields,
      testIdPrefix,
      withSubmit,
      children,
      SubmitButtonComponent: mergedUiComponents.SubmitButton as React.ComponentType<{
        children: React.ReactNode;
        disabled?: boolean;
        testId?: string;
      }>,
      isAdvancing,
      isSubmitting: engine.isSubmitting,
      stepper,
      currentStepIndex,
      onStepBack: handleStepBack,
      onStepContinue: handleStepContinue,
    });
  }

  const formOnBlurCapture =
    typeof Reflect.get(formProps, 'onBlurCapture') === 'function'
      ? (Reflect.get(formProps, 'onBlurCapture') as React.FocusEventHandler<HTMLFormElement>)
      : undefined;

  return (
    <TooltipProvider delayDuration={150} skipDelayDuration={0}>
      <AutoFormRuntimeProvider<TNativeForm>
        advancedFields={advancedFields}
        conversionOptions={conversionOptions}
        dataProviders={dataProviders}
        deprecatedFields={deprecatedFields}
        fieldRegistry={fieldRegistry}
        formComponents={mergedFormComponents}
        mode={mode}
        onFieldChange={onFieldChange}
        payloadBuilder={payloadBuilder}
        payloadParser={payloadParser}
        payloadSchema={payloadSchema}
        renderContent={(bag) => (
          <mergedUiComponents.Form
            {...formProps}
            onBlurCapture={(event) => {
              formOnBlurCapture?.(event);
              if (activeValidationMode() === 'blur') {
                void runLifecycleValidation(engine.getValues());
              }
            }}
            onSubmit={engine.handleSubmit(handleSubmit)}
            testId={testIdPrefix}
          >
            {engine.rootError ? (
              <Alert variant="destructive">
                <AlertTitle>Form validation failed</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap">{engine.rootError}</AlertDescription>
              </Alert>
            ) : null}

            {rootHeader === 'hidden' ? null : renderRootHeader ? (
              renderRootHeader(rootHeaderMetadata)
            ) : protoMessageUi?.title || protoMessageUi?.description ? (
              <header
                className="space-y-1 border-border/60 border-b pb-4"
                data-testid={`${testIdPrefix}-root-header`}
              >
                {protoMessageUi.title ? <Heading level={2}>{protoMessageUi.title}</Heading> : null}
                {protoMessageUi.description ? (
                  <Text className="text-muted-foreground" variant="small">
                    {protoMessageUi.description}
                  </Text>
                ) : null}
              </header>
            ) : null}

            <AutoFormModeShell
              bestEffort={bag.payloadState.bestEffort}
              jsonEditorError={bag.jsonEditorError}
              jsonText={bag.jsonEditorText}
              mode={mode}
              modes={availableModes}
              onFormatJson={bag.handleFormatJson}
              onJsonTextChange={bag.handleJsonTextChange}
              onModeChange={setMode}
              onResetJson={bag.handleResetJson}
              payload={bag.payloadState.payload}
              renderFormMode={renderFormForMode}
              renderSummary={renderSummary}
              showSummary={showSummary && (!stepper || currentStepIndex === stepper.steps.length - 1)}
              summaryContext={bag.summaryContext}
              testIdPrefix={testIdPrefix}
            />
          </mergedUiComponents.Form>
        )}
        resolvedSchema={resolvedSchema}
        simpleFields={simpleFields}
        testIdPrefix={testIdPrefix}
        uiComponents={mergedUiComponents}
      >
        {null}
      </AutoFormRuntimeProvider>
    </TooltipProvider>
  );
}

function AutoFormCoreInner<
  T extends Record<string, unknown>,
  TNativeForm,
  TCustomFieldType extends string,
>({
  schema,
  defaultValues,
  values,
  renderEngine,
  ...props
}: AutoFormCoreProps<T, TNativeForm, TCustomFieldType>) {
  const conversionOptions = protoConversionOptionsFromFieldConfig(props.fieldConfig);
  const protoDescriptor = isProtoMessageDescriptor(schema)
    ? schema
    : isProtoProvider(schema)
      ? schema.getMessageDescriptor()
      : undefined;
  const protoSource = protoDescriptor
    ? resolveProtoSourceMessage(protoDescriptor, values, defaultValues)
    : undefined;
  const resolvedSchema = resolveSchema(schema, conversionOptions, protoSource);
  const providerDefaults = resolvedSchema.provider.getDefaultValues();
  const initialDefaultValues =
    resolvedSchema.isProto && resolvedSchema.protoDesc
      ? {
          ...providerDefaults,
          ...(normalizeProtoInitialValues(resolvedSchema.protoDesc, defaultValues) ?? {}),
        }
      : { ...providerDefaults, ...(defaultValues ?? {}) };
  const controlledValues = values
    ? resolvedSchema.isProto && resolvedSchema.protoDesc
      ? normalizeProtoInitialValues(resolvedSchema.protoDesc, values)
      : values
    : undefined;

  return renderEngine({
    defaultValues: initialDefaultValues,
    validateSchema: async (submittedValues, signal) => {
      try {
        return await Promise.resolve(
          resolvedSchema.provider.validateSchema(submittedValues, { signal })
        );
      } catch (error) {
        return {
          success: false,
          errors: [
            {
              path: [],
              message:
                error instanceof Error
                  ? error.message
                  : 'Failed to validate form values.',
            },
          ],
        };
      }
    },
    values: controlledValues,
    children: (engine) => (
      <AutoFormContent<T, TNativeForm, TCustomFieldType>
        {...props}
        engine={engine}
        resolvedSchema={resolvedSchema}
      />
    ),
  });
}

type AutoFormErrorBoundaryState = { error: Error | null };

class AutoFormErrorBoundary extends React.Component<{ children: React.ReactNode }, AutoFormErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): AutoFormErrorBoundaryState {
    return { error };
  }

  override render() {
    if (this.state.error) {
      return (
        <Alert variant="destructive">
          <AlertTitle>AutoForm failed to render</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap">{this.state.error.message}</AlertDescription>
        </Alert>
      );
    }
    return this.props.children;
  }
}

export function AutoFormCore<
  T extends Record<string, unknown>,
  TNativeForm,
  TCustomFieldType extends string = never,
>(
  props: AutoFormCoreProps<T, TNativeForm, TCustomFieldType>
) {
  const schemaRef = React.useRef(props.schema);
  const [schemaKey, setSchemaKey] = React.useState(0);
  if (schemaRef.current !== props.schema) {
    schemaRef.current = props.schema;
    setSchemaKey((key) => key + 1);
  }
  return (
    <AutoFormErrorBoundary key={schemaKey}>
      <AutoFormCoreInner {...props} />
    </AutoFormErrorBoundary>
  );
}
