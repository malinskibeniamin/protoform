"use client";

import { Check } from "lucide-react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { formatProtoformMessage, type ProtoformMessageFormatter } from "../../lib/core/messages";

import { useAutoFormRuntimeContext } from "./context";
import type { ParsedField } from "./core-types";
import { FormDepthProvider, useFormDepth } from "./layout-context";
import { getStepConfigurationError } from "./step-configuration";
import type { AutoFormStep, AutoFormStepperOrientation } from "./types";

function getStepState(isCurrent: boolean, isComplete: boolean): "complete" | "current" | "upcoming" {
  if (isCurrent) {
    return "current";
  }
  return isComplete ? "complete" : "upcoming";
}

function getStepStatusLabel(
  formatMessage: ProtoformMessageFormatter | undefined,
  isCurrent: boolean,
  isComplete: boolean
): string {
  if (isCurrent) {
    return formatProtoformMessage(formatMessage, "auto_form.step_current", {}, "current step");
  }
  return isComplete
    ? formatProtoformMessage(formatMessage, "auto_form.step_complete", {}, "completed")
    : formatProtoformMessage(formatMessage, "auto_form.step_upcoming", {}, "upcoming step");
}

function fieldStep(field: ParsedField, firstStepId: string, stepIds: Set<string>): string {
  const configuredStep = field.hints?.step;
  return configuredStep && stepIds.has(configuredStep) ? configuredStep : firstStepId;
}

export function fieldsForStep(fields: ParsedField[], steps: AutoFormStep[], stepId: string): ParsedField[] {
  const firstStepId = steps[0]?.id;
  if (!firstStepId) {
    return fields;
  }
  const stepIds = new Set(steps.map((step) => step.id));
  return fields.filter((field) => fieldStep(field, firstStepId, stepIds) === stepId);
}

export function initialStepIndex(steps: AutoFormStep[], defaultStep: string | undefined): number {
  const index = defaultStep ? steps.findIndex((step) => step.id === defaultStep) : 0;
  return Math.max(index, 0);
}

export function validateSteps(steps: AutoFormStep[], defaultStep?: string): void {
  const error = getStepConfigurationError(steps, defaultStep);
  if (error) {
    throw new Error(error);
  }
}

function StepMarker({ index, isComplete, isCurrent }: { index: number; isComplete: boolean; isCurrent: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={
        isCurrent || isComplete
          ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-xs"
          : "flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-background font-semibold text-muted-foreground text-xs"
      }
      data-slot="step-marker"
    >
      {isComplete ? <Check className="size-4" /> : index + 1}
    </span>
  );
}

export function AutoFormStepIndicator({
  steps,
  currentIndex,
  orientation,
}: {
  steps: AutoFormStep[];
  currentIndex: number;
  orientation: AutoFormStepperOrientation;
}) {
  const { formatMessage } = useAutoFormRuntimeContext();
  const progressParams = { current: currentIndex + 1, total: steps.length };

  return (
    <nav
      aria-label={formatProtoformMessage(formatMessage, "auto_form.form_progress", {}, "Form progress")}
      className="@container space-y-3"
      data-orientation={orientation}
    >
      <Text aria-live="polite" className="text-muted-foreground" variant="small">
        {formatProtoformMessage(
          formatMessage,
          "auto_form.step_progress",
          progressParams,
          `Step ${progressParams.current} of ${progressParams.total}`
        )}
      </Text>
      <ol
        className={orientation === "vertical" ? "flex flex-col" : "grid gap-0"}
        data-layout={orientation === "horizontal" ? "adaptive-horizontal" : undefined}
        style={
          orientation === "horizontal" ? { gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` } : undefined
        }
      >
        {steps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isComplete = index < currentIndex;

          if (orientation === "vertical") {
            return (
              <li
                aria-current={isCurrent ? "step" : undefined}
                className="flex min-w-0 gap-3"
                data-state={getStepState(isCurrent, isComplete)}
                key={step.id}
              >
                <span className="sr-only">
                  {step.title}, {getStepStatusLabel(formatMessage, isCurrent, isComplete)}
                </span>
                <span aria-hidden="true" className="flex flex-col items-center">
                  <StepMarker index={index} isComplete={isComplete} isCurrent={isCurrent} />
                  {index < steps.length - 1 ? (
                    <span
                      className={isComplete ? "min-h-5 w-px flex-1 bg-primary" : "min-h-5 w-px flex-1 bg-border"}
                      data-orientation="vertical"
                      data-testid="step-connector"
                    />
                  ) : null}
                </span>
                <span
                  aria-hidden="true"
                  className={
                    isCurrent
                      ? "min-w-0 pt-1 pb-5 font-semibold text-sm"
                      : "min-w-0 pt-1 pb-5 text-muted-foreground text-sm"
                  }
                  data-slot="step-label"
                >
                  {step.title}
                </span>
              </li>
            );
          }

          return (
            <li
              aria-current={isCurrent ? "step" : undefined}
              className="flex min-w-0 items-start"
              data-state={getStepState(isCurrent, isComplete)}
              key={step.id}
            >
              <span className="sr-only">
                {step.title}, {getStepStatusLabel(formatMessage, isCurrent, isComplete)}
              </span>
              <span className="flex @min-[30rem]:w-16 @min-[64rem]:w-auto min-w-0 shrink-0 @min-[64rem]:flex-row flex-col items-center @min-[64rem]:gap-2 gap-1.5">
                <StepMarker index={index} isComplete={isComplete} isCurrent={isCurrent} />
                <span
                  aria-hidden="true"
                  className={
                    isCurrent
                      ? "@min-[30rem]:block hidden @min-[64rem]:w-auto w-full @min-[64rem]:max-w-32 truncate @min-[64rem]:text-left text-center font-semibold @min-[64rem]:text-sm text-xs"
                      : "@min-[30rem]:block hidden @min-[64rem]:w-auto w-full @min-[64rem]:max-w-32 truncate @min-[64rem]:text-left text-center @min-[64rem]:text-sm text-muted-foreground text-xs"
                  }
                  data-slot="step-label"
                >
                  {step.title}
                </span>
              </span>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={
                    isComplete ? "mt-3.5 h-px min-w-0 flex-1 bg-primary" : "mt-3.5 h-px min-w-0 flex-1 bg-border"
                  }
                  data-orientation="horizontal"
                  data-testid="step-connector"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function AutoFormStepPanel({
  children,
  currentIndex,
  onBack,
  onContinue,
  isAdvancing,
  orientation,
  step,
  steps,
  submit,
}: {
  children: React.ReactNode;
  currentIndex: number;
  onBack: () => void;
  onContinue: () => void | Promise<void>;
  isAdvancing: boolean;
  orientation: AutoFormStepperOrientation;
  step: AutoFormStep;
  steps: AutoFormStep[];
  submit: React.ReactNode;
}) {
  const isLastStep = currentIndex === steps.length - 1;
  const depth = useFormDepth();
  const { formatMessage } = useAutoFormRuntimeContext();

  return (
    <div className="space-y-6">
      <div
        className={
          orientation === "vertical"
            ? "grid items-start gap-6 md:grid-cols-[minmax(10rem,0.26fr)_minmax(0,1fr)] md:gap-8"
            : "space-y-6"
        }
        data-layout={`stepper-${orientation}`}
      >
        <AutoFormStepIndicator currentIndex={currentIndex} orientation={orientation} steps={steps} />
        <section
          aria-labelledby={`autoform-step-${step.id}`}
          className="grid items-start gap-6 border-border/60 border-y py-7 sm:grid-cols-[minmax(10rem,0.34fr)_minmax(0,1fr)] sm:gap-x-8"
          data-layout="split"
        >
          <header className="space-y-1">
            <Heading id={`autoform-step-${step.id}`} level={3}>
              {step.title}
            </Heading>
            {step.description ? (
              <Text className="text-muted-foreground" variant="small">
                {step.description}
              </Text>
            ) : null}
          </header>
          <FormDepthProvider depth={depth + 1}>
            <div className="min-w-0">{children}</div>
          </FormDepthProvider>
        </section>
      </div>
      <div
        className="sticky bottom-0 z-10 -mx-2 flex flex-wrap items-center justify-between gap-3 border-border/60 border-t bg-background/95 px-2 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/85"
        data-slot="auto-form-actions"
      >
        {currentIndex > 0 ? (
          <Button onClick={onBack} type="button" variant="outline">
            {formatProtoformMessage(formatMessage, "auto_form.back", {}, "Back")}
          </Button>
        ) : (
          <span />
        )}
        {isLastStep ? (
          submit
        ) : (
          <Button disabled={isAdvancing} onClick={onContinue} type="button">
            {isAdvancing
              ? formatProtoformMessage(formatMessage, "auto_form.checking", {}, "Checking…")
              : formatProtoformMessage(formatMessage, "auto_form.continue", {}, "Continue")}
          </Button>
        )}
      </div>
    </div>
  );
}
