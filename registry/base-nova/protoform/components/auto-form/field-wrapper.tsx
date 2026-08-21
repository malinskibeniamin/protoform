"use client";

import { AlertCircle, ChevronDown, CircleHelp, ExternalLink, PlusIcon, TrashIcon } from "lucide-react";
import React from "react";
import { cn, type SharedProps } from "../../lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../alert";
import { Button } from "../button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "../field";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import { Heading, Text } from "../typography";
import { useAutoFormRuntimeContext } from "./context";
import type { ArrayElementWrapperProps, ArrayWrapperProps, FieldWrapperProps, ObjectWrapperProps } from "./core-types";
import { formSpacing } from "./form-spacing";
import { getFieldDescriptionText, getFieldDocsUrl, getFieldHelpText, getFieldUiConfig } from "./helpers";
import { FormDepthProvider, headingLevelForDepth, useFormDepth } from "./layout-context";
import { getAutoFormFieldTestId } from "./test-ids";

const REGEX_ERROR_PATTERN = /regex pattern\s*`([^`]+)`/;

export const Form = React.forwardRef<HTMLFormElement, React.ComponentProps<"form"> & SharedProps>(
  ({ children, testId, ...props }, ref) => (
    <form className={formSpacing.form} data-testid={testId} ref={ref} {...props}>
      <FormDepthProvider depth={0}>{children}</FormDepthProvider>
    </form>
  )
);
Form.displayName = "Form";

export const ArrayElementWrapper: React.FC<
  ArrayElementWrapperProps & {
    testId?: string;
    removeButtonTestId?: string;
  }
> = ({ children, onRemove, removeButtonTestId, testId }) => (
  <div
    className="relative rounded-xl border border-border/70 bg-card p-5 text-card-foreground shadow-xs"
    data-testid={testId}
  >
    <Button
      aria-label="Remove item"
      className="absolute top-3 right-3"
      onClick={onRemove}
      size="icon-sm"
      testId={removeButtonTestId}
      type="button"
      variant="ghost"
    >
      <TrashIcon className="h-4 w-4" />
    </Button>
    <div className="pr-8">{children}</div>
  </div>
);

export const ArrayWrapper: React.FC<
  ArrayWrapperProps & {
    addButtonTestId?: string;
    testId?: string;
  }
> = ({ label, children, onAddItem, addButtonTestId, testId }) => (
  <div className={formSpacing.field} data-testid={testId}>
    {children}
    <Button onClick={onAddItem} size="sm" testId={addButtonTestId} type="button" variant="outline">
      <PlusIcon className="h-4 w-4" />
      {label ? `Add ${label}` : "Add item"}
    </Button>
  </div>
);

export const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>AutoForm error</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
);

function augmentError(
  error: FieldWrapperProps["error"],
  field: FieldWrapperProps["field"]
): FieldWrapperProps["error"] {
  if (!(typeof error === "string" && REGEX_ERROR_PATTERN.test(error))) {
    return error;
  }
  const uiConfig = getFieldUiConfig(field);
  if (uiConfig.example) {
    return `${error}\nExample: ${uiConfig.example}`;
  }
  return error;
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({ label, children, id, field, error: rawError }) => {
  const depth = useFormDepth();
  const { testIdPrefix } = useAutoFormRuntimeContext();
  const isCompact = Boolean((field.fieldConfig?.customData as Record<string, unknown> | undefined)?.["compactRow"]);
  const tooltipText = isCompact ? "" : getFieldHelpText(field);
  const helpText = isCompact ? undefined : getFieldDescriptionText(field);
  const docsUrl = isCompact ? undefined : getFieldDocsUrl(field);
  const error = augmentError(rawError, field);
  const isDisabled = Boolean(field.fieldConfig?.inputProps?.["disabled"]);
  const hasVisibleLabel = !(typeof label === "string" && label.trim().length === 0);
  const fallbackLabel =
    typeof field.fieldConfig?.label === "string" && field.fieldConfig.label.trim().length > 0
      ? field.fieldConfig.label
      : field.key;
  const helpLabel = typeof label === "string" && label.trim().length > 0 ? label : fallbackLabel;
  const displayedLabel: React.ReactNode = hasVisibleLabel ? label : fallbackLabel;
  const fieldTestId = getAutoFormFieldTestId(testIdPrefix, id);
  const isSplit = depth === 0 && !isCompact;
  let fieldFeedback: React.ReactNode = null;
  if (error) {
    fieldFeedback = <FieldError testId={getAutoFormFieldTestId(testIdPrefix, id, "error")}>{error}</FieldError>;
  } else if ((helpText || docsUrl) && !isCompact) {
    fieldFeedback = (
      <FieldDescription testId={getAutoFormFieldTestId(testIdPrefix, id, "description")}>
        {helpText ? <span>{helpText}</span> : null}
        {docsUrl ? (
          <>
            {helpText ? " " : null}
            <a
              className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
              data-testid={getAutoFormFieldTestId(testIdPrefix, id, "docs-link")}
              href={docsUrl}
              rel="noreferrer"
              target="_blank"
            >
              View {helpLabel} documentation
              <ExternalLink aria-hidden className="h-3 w-3" />
            </a>
          </>
        ) : null}
      </FieldDescription>
    );
  }

  // Match the non-AutoForm usage pattern in managed-create-form.tsx:
  // `<Field>` with label / control / description / error as *direct*
  // siblings, so the Field component's native `gap-3` drives the
  // label → input → description → error rhythm. The previous
  // `<Field gap-2><FieldContent gap-2>` nesting produced a cramped
  // 8px label/input gap and misaligned the internal rhythm from every
  // manually-constructed form in the app — users could spot the
  // AutoForm at a glance from the tighter stack alone.
  return (
    <Field
      className={
        isSplit ? "grid items-start gap-x-8 gap-y-2 sm:grid-cols-[minmax(10rem,0.34fr)_minmax(0,1fr)]" : undefined
      }
      data-disabled={isDisabled}
      data-invalid={Boolean(error)}
      data-layout={isSplit ? "split" : "stacked"}
      testId={fieldTestId}
    >
      {isCompact ? null : (
        <div className={cn("flex min-w-0 items-center gap-2", isSplit && "sm:pt-2")}>
          <FieldLabel className={hasVisibleLabel ? "items-center gap-2" : "sr-only"} htmlFor={id}>
            <Text as="span" variant="labelStrongSmall">
              {displayedLabel}
            </Text>
            {field.required ? (
              <Text as="span" className="text-destructive" variant="small">
                *
              </Text>
            ) : null}
          </FieldLabel>
          {tooltipText ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label={`Help for ${helpLabel}`}
                  className="rounded-full text-muted-foreground shadow-none hover:text-foreground"
                  data-testid={getAutoFormFieldTestId(testIdPrefix, id, "help")}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <CircleHelp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                className="max-w-sm text-pretty text-xs"
                role="tooltip"
                testId={getAutoFormFieldTestId(testIdPrefix, id, "help-content")}
              >
                {tooltipText}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      )}
      <FieldContent className="min-w-0 gap-2">
        {children}
        {fieldFeedback}
      </FieldContent>
    </Field>
  );
};

export const ObjectWrapper: React.FC<
  ObjectWrapperProps & {
    testId?: string | undefined;
    hasError?: boolean | undefined;
  }
> = ({ label, children, field, testId, hasError }) => {
  const depth = useFormDepth();
  const headingLevel = headingLevelForDepth(depth);
  const helpText = getFieldDescriptionText(field);
  const hasVisibleLabel = !(typeof label === "string" && label.trim().length === 0);
  const customData = (field.fieldConfig?.customData ?? {}) as Record<string, unknown>;
  const isCollapsible = Boolean(customData["collapsible"]);
  // Divider under a section header. Defaults to true for parity with the
  // historical ObjectWrapper behavior. Consumers can opt out by setting
  // `customData.showDivider = false` — same escape hatch as FormSection's
  // `divider` prop so both entry points agree on when a rule renders.
  const showDivider = customData["showDivider"] !== false && hasVisibleLabel;
  const isSplit = depth === 0 && hasVisibleLabel && !isCollapsible;
  const [isOpen, setIsOpen] = React.useState(false);

  // Auto-expand when section has validation errors
  React.useEffect(() => {
    if (hasError && !isOpen) {
      setIsOpen(true);
    }
  }, [hasError, isOpen]);

  if (isCollapsible && hasVisibleLabel) {
    return (
      <Collapsible onOpenChange={setIsOpen} open={isOpen}>
        <section className={formSpacing.field} data-testid={testId}>
          <CollapsibleTrigger asChild>
            <button
              className={
                showDivider
                  ? `flex w-full items-center justify-between text-left ${formSpacing.sectionDivider}`
                  : "flex w-full items-center justify-between text-left"
              }
              type="button"
            >
              <div className={formSpacing.sectionHeader}>
                <div className="flex items-center gap-2">
                  <Heading className="font-medium" level={headingLevel}>
                    {label}
                  </Heading>
                  {field.required ? (
                    <Text as="span" className="text-destructive" variant="small">
                      *
                    </Text>
                  ) : null}
                </div>
                {helpText ? (
                  <Text className="text-muted-foreground" variant="small">
                    {helpText}
                  </Text>
                ) : null}
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <FormDepthProvider depth={depth + 1}>
              <div className={formSpacing.field}>{children}</div>
            </FormDepthProvider>
          </CollapsibleContent>
        </section>
      </Collapsible>
    );
  }

  return (
    <section
      className={
        isSplit
          ? "grid items-start gap-6 sm:grid-cols-[minmax(10rem,0.34fr)_minmax(0,1fr)] sm:gap-x-8"
          : formSpacing.field
      }
      data-layout={isSplit ? "split" : "stacked"}
      data-testid={testId}
    >
      {hasVisibleLabel ? (
        <div
          className={
            showDivider
              ? `${formSpacing.sectionHeader} ${formSpacing.sectionDivider} ${isSplit ? "sm:border-b-0 sm:pb-0" : ""}`
              : formSpacing.sectionHeader
          }
        >
          <div className="flex items-center gap-2">
            <Heading className="font-medium" level={headingLevel}>
              {label}
            </Heading>
            {field.required ? (
              <Text as="span" className="text-destructive" variant="small">
                *
              </Text>
            ) : null}
          </div>
          {helpText ? (
            <Text className="text-muted-foreground" variant="small">
              {helpText}
            </Text>
          ) : null}
        </div>
      ) : null}
      <FormDepthProvider depth={depth + 1}>
        <div className={cn("min-w-0", formSpacing.field)}>{children}</div>
      </FormDepthProvider>
    </section>
  );
};

export const SubmitButton: React.FC<{
  children: React.ReactNode;
  disabled?: boolean | undefined;
  testId?: string | undefined;
}> = ({ children, disabled, testId }) => (
  <Button disabled={disabled} testId={testId} type="submit">
    {children}
  </Button>
);
