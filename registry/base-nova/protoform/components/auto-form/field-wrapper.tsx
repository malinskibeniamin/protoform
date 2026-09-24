"use client";

import { AlertCircle, ChevronDown, CircleHelp, ExternalLink, PlusIcon, TrashIcon } from "lucide-react";
import React from "react";
import { cn, type SharedProps } from "@/registry/base-nova/protoform/lib/utils/index";
import { useAutoFormRuntimeContext } from "./context";
import type { ArrayElementWrapperProps, ArrayWrapperProps, FieldWrapperProps, ObjectWrapperProps } from "./core-types";
import { formSpacing } from "./form-spacing";
import { getFieldDescriptionText, getFieldDocsUrl, getFieldHelpText, getFieldUiConfig } from "./helpers";
import { FormDepthProvider, headingLevelForDepth, useFormDepth } from "./layout-context";
import { getAutoFormFieldTestId } from "./test-ids";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  AutoFormErrorDescriptionContext,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  Heading,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui-components";

const REGEX_ERROR_PATTERN = /regex pattern\s*`([^`]+)`/u;

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
    removeButtonAriaLabel?: string;
    testId?: string;
    removeButtonTestId?: string;
  }
> = ({ children, onRemove, removeButtonAriaLabel = "Remove item", removeButtonTestId, testId }) => (
  <div
    className="relative rounded-xl border border-border/70 bg-card p-5 text-card-foreground shadow-xs"
    data-testid={testId}
  >
    <Button
      aria-label={removeButtonAriaLabel}
      className="absolute top-3 right-3"
      onClick={onRemove}
      size="icon-sm"
      testId={removeButtonTestId}
      type="button"
      variant="ghost"
    >
      <TrashIcon className="size-4" />
    </Button>
    <div className="pr-8">{children}</div>
  </div>
);

export const ArrayWrapper: React.FC<
  ArrayWrapperProps & {
    addButtonLabel?: string;
    addButtonTestId?: string;
    testId?: string;
  }
> = ({ label, children, onAddItem, addButtonLabel, addButtonTestId, testId }) => (
  <div className={formSpacing.field} data-testid={testId}>
    {children}
    <Button onClick={onAddItem} size="sm" testId={addButtonTestId} type="button" variant="outline">
      <PlusIcon className="size-4" />
      {addButtonLabel ?? (label ? `Add ${label}` : "Add item")}
    </Button>
  </div>
);

export const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <Alert variant="destructive">
    <AlertCircle className="size-4" />
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

function FieldFeedback({
  field,
  error,
  errorId,
  id,
  helpLabel,
  isCompact,
  testIdPrefix,
}: {
  field: FieldWrapperProps["field"];
  error: FieldWrapperProps["error"];
  errorId: string;
  id: string;
  helpLabel: string;
  isCompact: boolean;
  testIdPrefix: ReturnType<typeof useAutoFormRuntimeContext>["testIdPrefix"];
}) {
  const helpText = isCompact ? undefined : getFieldDescriptionText(field);
  const docsUrl = isCompact ? undefined : getFieldDocsUrl(field);
  if (error) {
    // Keep the consumer FieldError's own ID intact for controls using its Field context.
    return (
      <div id={errorId}>
        <FieldError testId={getAutoFormFieldTestId(testIdPrefix, id, "error")}>{error}</FieldError>
      </div>
    );
  }
  if ((helpText || docsUrl) && !isCompact) {
    return (
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
              <ExternalLink aria-hidden className="size-3" />
            </a>
          </>
        ) : null}
      </FieldDescription>
    );
  }

  return null;
}

function getWrapperLabels(field: FieldWrapperProps["field"], label: FieldWrapperProps["label"]) {
  const hasVisibleLabel = !(typeof label === "string" && label.trim().length === 0);
  const fallbackLabel =
    typeof field.fieldConfig?.label === "string" && field.fieldConfig.label.trim().length > 0
      ? field.fieldConfig.label
      : field.key;
  const helpLabel = typeof label === "string" && label.trim().length > 0 ? label : fallbackLabel;
  const displayedLabel: React.ReactNode = hasVisibleLabel ? label : fallbackLabel;
  return { hasVisibleLabel, helpLabel, displayedLabel };
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({ label, children, id, field, error: rawError }) => {
  const depth = useFormDepth();
  const { testIdPrefix } = useAutoFormRuntimeContext();
  const isCompact = Boolean((field.fieldConfig?.customData as Record<string, unknown> | undefined)?.["compactRow"]);
  const tooltipText = isCompact ? "" : getFieldHelpText(field);
  const error = augmentError(rawError, field);
  const errorId = React.useId();
  const isDisabled = Boolean(field.fieldConfig?.inputProps?.["disabled"]);
  const { hasVisibleLabel, helpLabel, displayedLabel } = getWrapperLabels(field, label);
  const fieldTestId = getAutoFormFieldTestId(testIdPrefix, id);
  const isSplit = depth === 0 && !isCompact;

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
                  data-slot="help-trigger"
                  data-testid={getAutoFormFieldTestId(testIdPrefix, id, "help")}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <CircleHelp className="size-4" />
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
        <AutoFormErrorDescriptionContext.Provider value={error ? errorId : undefined}>
          {children}
          <FieldFeedback
            error={error}
            errorId={errorId}
            field={field}
            helpLabel={helpLabel}
            id={id}
            isCompact={isCompact}
            testIdPrefix={testIdPrefix}
          />
        </AutoFormErrorDescriptionContext.Provider>
      </FieldContent>
    </Field>
  );
};

function ObjectSectionHeading({
  field,
  label,
  headingLevel,
}: {
  field: ObjectWrapperProps["field"];
  label: ObjectWrapperProps["label"];
  headingLevel: ReturnType<typeof headingLevelForDepth>;
}) {
  const helpText = getFieldDescriptionText(field);
  return (
    <>
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
    </>
  );
}

export const ObjectWrapper: React.FC<
  ObjectWrapperProps & {
    testId?: string | undefined;
    hasError?: boolean | undefined;
  }
> = ({ label, children, field, testId, hasError }) => {
  "use no memo";

  const depth = useFormDepth();
  const headingLevel = headingLevelForDepth(depth);
  const hasVisibleLabel = !(typeof label === "string" && label.trim().length === 0);
  const customData = (field.fieldConfig?.customData ?? {}) as Record<string, unknown>;
  const isCollapsible = Boolean(customData["collapsible"]);
  // Divider under a section header. Defaults to true for parity with the
  // historical ObjectWrapper behavior. Consumers can opt out by setting
  // `customData.showDivider = false` — same escape hatch as FormSection's
  // `divider` prop so both entry points agree on when a rule renders.
  const showDivider = customData["showDivider"] !== false && hasVisibleLabel;
  const isSplit = depth === 0 && hasVisibleLabel && !isCollapsible;
  const headerClassName = showDivider
    ? `${formSpacing.sectionHeader} ${formSpacing.sectionDivider} ${isSplit ? "sm:border-b-0 sm:pb-0" : ""}`
    : formSpacing.sectionHeader;
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
        <section className={cn(formSpacing.field, showDivider && formSpacing.sectionDivider)} data-testid={testId}>
          <CollapsibleTrigger asChild>
            <Button className="h-auto w-full justify-between text-left" type="button" variant="ghost">
              <div className={formSpacing.sectionHeader}>
                <ObjectSectionHeading field={field} headingLevel={headingLevel} label={label} />
              </div>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
            </Button>
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
        <div className={headerClassName}>
          <ObjectSectionHeading field={field} headingLevel={headingLevel} label={label} />
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
