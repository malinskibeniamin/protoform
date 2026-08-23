"use client";

import { CheckIcon, CopyIcon, ExternalLinkIcon, Maximize2Icon, Minimize2Icon, MoonIcon, SunIcon } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AutoForm } from "@/registry/base-nova/protoform/components/auto-form";
import type {
  SchemaProvider,
  SchemaValidationError,
} from "@/registry/base-nova/protoform/components/auto-form/core-types";
import { Button } from "@/registry/base-nova/protoform/components/button";
import { cn } from "@/registry/base-nova/protoform/lib/utils";

import {
  buildPresetCode,
  defaultPreset,
  defaultRadius,
  findSupportedPreset,
  type PresetCssVariables,
  type PresetDefinition,
  type PresetMode,
  type PresetRadius,
  presetDefinitions,
  presetRadii,
} from "./preset-lab-presets";
import { PresetWorkspaceShell } from "./preset-workspace-shell";
import { PreviewFieldWrapper } from "./preview-field-wrapper";
import { PreviewForm } from "./preview-form";

type PreviewValues = Record<string, unknown>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/u;
const environmentValues = new Set(["development", "staging", "production"]);
const reviewTemplateValues = new Set(["access", "architecture", "compliance", "incident", "launch"]);

function isSupportedValue(value: unknown, supportedValues: Set<string>): value is string {
  return typeof value === "string" && supportedValues.has(value);
}

function isValidCoverageTarget(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !isoDatePattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!(year && month && day)) {
    return false;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function buildPreviewSchema(instanceId: string): SchemaProvider<PreviewValues> {
  const approvalKey = `${instanceId}-approval`;
  const coverageKey = `${instanceId}-coverage`;
  const dueDateKey = `${instanceId}-due-date`;
  const emailKey = `${instanceId}-email`;
  const environmentKey = `${instanceId}-environment`;
  const notificationsKey = `${instanceId}-notifications`;
  const notesKey = `${instanceId}-notes`;
  const reviewTemplateKey = `${instanceId}-review-template`;

  return {
    getDefaultValues: () => ({
      [approvalKey]: true,
      [coverageKey]: 80,
      [dueDateKey]: "2026-08-15",
      [emailKey]: "team@protoform.dev",
      [environmentKey]: "staging",
      [notificationsKey]: true,
      [notesKey]: "Focus on permissions, ownership, and recovery paths.",
      [reviewTemplateKey]: "architecture",
    }),
    parseSchema: () => ({
      fields: [
        {
          fieldConfig: {
            fieldType: "email",
            label: "Work email",
          },
          key: emailKey,
          required: true,
          type: "string",
        },
        {
          fieldConfig: {
            fieldType: "select",
            label: "Review template",
          },
          key: reviewTemplateKey,
          options: [
            ["access", "Access review"],
            ["architecture", "Architecture"],
            ["compliance", "Compliance"],
            ["incident", "Incident follow-up"],
            ["launch", "Launch readiness"],
          ],
          required: true,
          type: "select",
        },
        {
          fieldConfig: {
            label: "Environment",
          },
          key: environmentKey,
          options: [
            ["development", "Dev"],
            ["staging", "Staging"],
            ["production", "Prod"],
          ],
          required: true,
          type: "select",
        },
        {
          fieldConfig: {
            fieldType: "slider",
            inputProps: {
              max: 100,
              min: 0,
              step: 10,
            },
            label: "Coverage target",
          },
          key: coverageKey,
          required: true,
          type: "number",
        },
        {
          fieldConfig: {
            label: "Due date",
          },
          key: dueDateKey,
          required: true,
          type: "date",
        },
        {
          fieldConfig: {
            fieldType: "textarea",
            inputProps: {
              maxLength: 240,
              placeholder: "Add context for reviewers",
            },
            label: "Review notes",
          },
          key: notesKey,
          required: false,
          type: "string",
        },
        {
          fieldConfig: {
            fieldType: "switch",
            label: "Review notifications",
          },
          key: notificationsKey,
          required: false,
          type: "boolean",
        },
        {
          fieldConfig: {
            fieldType: "checkbox",
            label: "Require final approval",
          },
          key: approvalKey,
          required: false,
          type: "boolean",
        },
      ],
    }),
    validateSchema: (values) => {
      const errors: SchemaValidationError[] = [];
      const approval = values[approvalKey];
      const coverage = values[coverageKey];
      const dueDate = values[dueDateKey];
      const email = values[emailKey];
      const environment = values[environmentKey];
      const notifications = values[notificationsKey];
      const notes = values[notesKey];
      const reviewTemplate = values[reviewTemplateKey];

      if (typeof email !== "string" || !emailPattern.test(email)) {
        errors.push({
          message: "Enter a valid work email.",
          path: [emailKey],
        });
      }
      if (!isSupportedValue(environment, environmentValues)) {
        errors.push({
          message: "Choose a listed environment.",
          path: [environmentKey],
        });
      }
      if (!isSupportedValue(reviewTemplate, reviewTemplateValues)) {
        errors.push({
          message: "Choose a listed review template.",
          path: [reviewTemplateKey],
        });
      }
      if (!isValidCoverageTarget(coverage)) {
        errors.push({
          message: "Choose a coverage target from 0 to 100.",
          path: [coverageKey],
        });
      }
      if (!isValidIsoDate(dueDate)) {
        errors.push({
          message: "Enter a valid due date in YYYY-MM-DD format.",
          path: [dueDateKey],
        });
      }
      if (typeof notes !== "string" || notes.length > 240) {
        errors.push({
          message: "Keep review notes under 240 characters.",
          path: [notesKey],
        });
      }
      if (typeof notifications !== "boolean") {
        errors.push({
          message: "Choose whether to send review notifications.",
          path: [notificationsKey],
        });
      }
      if (typeof approval !== "boolean") {
        errors.push({
          message: "Choose whether final approval is required.",
          path: [approvalKey],
        });
      }

      return errors.length > 0 ? { errors, success: false } : { data: values, success: true };
    },
  };
}

const previewSchema = buildPreviewSchema("preset-preview");

const previewUiComponents = {
  FieldWrapper: PreviewFieldWrapper,
  Form: PreviewForm,
};

interface InitialSelection {
  mode: PresetMode;
  preset: PresetDefinition;
  radius: PresetRadius;
  status?: string | undefined;
}

type PreviewRadiusVariable =
  | "--radius"
  | "--radius-xs"
  | "--radius-sm"
  | "--radius-md"
  | "--radius-lg"
  | "--radius-xl"
  | "--radius-2xl";

type PreviewSelectionVariable = "--selected" | "--selected-foreground" | "--selection" | "--selection-foreground";

function readBlumeTheme(): PresetMode {
  return document.documentElement.dataset["theme"] === "dark" ? "dark" : "light";
}

function readInitialSelection(): InitialSelection {
  if (typeof window === "undefined") {
    return {
      mode: "light",
      preset: defaultPreset,
      radius: defaultRadius,
    };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const presetCode = searchParams.get("preset");
  const requestedMode = searchParams.get("mode");
  const supportedPreset = presetCode ? findSupportedPreset(presetCode) : undefined;
  const hasInvalidPreset = Boolean(presetCode && !supportedPreset);
  const hasInvalidMode = Boolean(requestedMode && requestedMode !== "light" && requestedMode !== "dark");
  let mode = readBlumeTheme();
  if (requestedMode === "dark" || requestedMode === "light") {
    mode = requestedMode;
  } else if (hasInvalidMode) {
    mode = "light";
  }
  const statusMessages: string[] = [];

  if (hasInvalidPreset) {
    statusMessages.push(
      "This shared preset is outside the supported range. Showing the default Base UI + Nova preset."
    );
  }
  if (hasInvalidMode) {
    statusMessages.push("This shared preview mode is not supported. Showing the light preview.");
  }

  return {
    mode,
    preset: supportedPreset?.preset ?? defaultPreset,
    radius: supportedPreset?.radius ?? defaultRadius,
    status: statusMessages.length > 0 ? statusMessages.join(" ") : undefined,
  };
}

function buildPreviewStyle(
  variables: PresetCssVariables,
  radius: string
): CSSProperties & PresetCssVariables & Record<PreviewRadiusVariable | PreviewSelectionVariable, string> {
  return {
    ...variables,
    "--radius": radius,
    "--radius-2xl": `calc(${radius} + 8px)`,
    "--radius-lg": radius,
    "--radius-md": `calc(${radius} - 2px)`,
    "--radius-sm": `calc(${radius} - 4px)`,
    "--radius-xl": `calc(${radius} + 4px)`,
    "--radius-xs": `calc(${radius} - 6px)`,
    "--selected": variables["--primary"],
    "--selected-foreground": variables["--primary-foreground"],
    "--selection": variables["--primary"],
    "--selection-foreground": variables["--primary-foreground"],
  };
}

type FullscreenMode = "fallback" | "native" | "none";

function createWorkspaceHost(): HTMLDivElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  const host = document.createElement("div");
  host.className = "w-full";
  host.dataset["presetWorkspaceHost"] = "";
  return host;
}

function isolateWorkspace(workspace: HTMLElement): () => void {
  const inertedElements: Array<{
    element: HTMLElement;
    wasInert: boolean;
  }> = [];
  let current = workspace;

  while (current.parentElement) {
    const parent = current.parentElement;
    for (const sibling of parent.children) {
      if (sibling === current || !(sibling instanceof HTMLElement)) {
        continue;
      }
      inertedElements.push({
        element: sibling,
        wasInert: sibling.inert,
      });
      sibling.inert = true;
    }
    if (parent === document.body) {
      break;
    }
    current = parent;
  }

  const previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = previousBodyOverflow;
    for (const { element, wasInert } of inertedElements) {
      element.inert = wasInert;
    }
  };
}

function useWorkspaceFullscreen(setStatus: (message: string) => void) {
  const inlineHostRef = useRef<HTMLDivElement | null>(null);
  const workspaceRef = useRef<HTMLElement | null>(null);
  const [workspaceHost] = useState(createWorkspaceHost);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isFallbackFullscreen, setIsFallbackFullscreen] = useState(false);
  const isFullscreen = isNativeFullscreen || isFallbackFullscreen;
  let mode: FullscreenMode = "none";
  if (isNativeFullscreen) {
    mode = "native";
  } else if (isFallbackFullscreen) {
    mode = "fallback";
  }

  useEffect(function trackWorkspaceFullscreen() {
    function synchronizeFullscreenState() {
      setIsNativeFullscreen(document.fullscreenElement === workspaceRef.current);
    }

    synchronizeFullscreenState();
    document.addEventListener("fullscreenchange", synchronizeFullscreenState);
    return () => document.removeEventListener("fullscreenchange", synchronizeFullscreenState);
  }, []);

  useEffect(
    function mountWorkspaceHost() {
      const inlineHost: HTMLDivElement | null = inlineHostRef.current;
      if (!(inlineHost && workspaceHost)) {
        return;
      }

      inlineHost.append(workspaceHost);
      return () => workspaceHost.remove();
    },
    [workspaceHost]
  );

  useEffect(
    function isolateFallbackFullscreen() {
      if (!isFallbackFullscreen) {
        return;
      }

      const workspace: HTMLElement | null = workspaceRef.current;
      const inlineHost: HTMLDivElement | null = inlineHostRef.current;
      if (!(workspace && inlineHost && workspaceHost)) {
        return;
      }

      document.body.append(workspaceHost);
      const restoreWorkspaceIsolation = isolateWorkspace(workspace);

      function closeOnEscape(event: KeyboardEvent) {
        if (event.key === "Escape") {
          setIsFallbackFullscreen(false);
          setStatus("Full screen closed.");
        }
      }

      document.addEventListener("keydown", closeOnEscape);
      return () => {
        document.removeEventListener("keydown", closeOnEscape);
        restoreWorkspaceIsolation();
        if (inlineHost.isConnected) {
          inlineHost.append(workspaceHost);
        }
      };
    },
    [isFallbackFullscreen, setStatus, workspaceHost]
  );

  async function toggleFullscreen() {
    const workspace: HTMLElement | null = workspaceRef.current;
    if (!workspace) {
      setStatus("Full screen is not available.");
      return;
    }

    if (isFallbackFullscreen) {
      setIsFallbackFullscreen(false);
      setStatus("Full screen closed.");
      return;
    }

    if (document.fullscreenElement === workspace) {
      try {
        await document.exitFullscreen();
        setStatus("Full screen closed.");
      } catch {
        setStatus("Could not close full screen. Press Escape to exit.");
      }
      return;
    }

    if (!workspace.requestFullscreen) {
      setIsFallbackFullscreen(true);
      setStatus("Full screen opened. Press Escape to exit.");
      return;
    }

    try {
      await workspace.requestFullscreen();
      setStatus("Full screen opened. Press Escape to exit.");
    } catch {
      setIsFallbackFullscreen(true);
      setStatus("Full screen opened. Press Escape to exit.");
    }
  }

  return {
    inlineHostRef,
    isFallbackFullscreen,
    isFullscreen,
    mode,
    toggleFullscreen,
    workspaceHost,
    workspaceRef,
  };
}

export function PresetLab() {
  const [initialSelection] = useState(readInitialSelection);
  const [activePreset, setActivePreset] = useState(initialSelection.preset);
  const [radius, setRadius] = useState(initialSelection.radius);
  const [mode, setMode] = useState(initialSelection.mode);
  const [status, setStatus] = useState(initialSelection.status);
  const {
    inlineHostRef,
    isFallbackFullscreen,
    isFullscreen,
    mode: fullscreenMode,
    toggleFullscreen,
    workspaceHost,
    workspaceRef,
  } = useWorkspaceFullscreen(setStatus);
  const presetCode = buildPresetCode(activePreset, radius);
  const command = `bunx shadcn@latest create --base base --preset ${presetCode}`;
  const createUrl = `https://ui.shadcn.com/create?base=base&preset=${presetCode}`;
  const radiusValue = presetRadii.find((candidate) => candidate.value === radius)?.cssValue ?? "0.625rem";
  const previewVariables = mode === "dark" ? activePreset.dark : activePreset.light;
  const previewStyle = buildPreviewStyle(previewVariables, radiusValue);

  useEffect(
    function synchronizePresetUrl() {
      const url = new URL(window.location.href);
      url.searchParams.set("preset", presetCode);
      url.searchParams.set("mode", mode);
      window.history.replaceState({}, "", url);
    },
    [mode, presetCode]
  );

  useEffect(
    function synchronizeBlumeTheme() {
      document.documentElement.dataset["theme"] = mode;
      localStorage.setItem("blume-theme", mode);
    },
    [mode]
  );

  useEffect(function trackBlumeTheme() {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setMode(readBlumeTheme());
    });
    observer.observe(root, {
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  function selectPreset(preset: PresetDefinition) {
    setActivePreset(preset);
    setStatus(`${preset.name} preset selected.`);
  }

  async function copyText(value: string, successMessage: string, failureMessage: string) {
    if (!navigator.clipboard) {
      setStatus(failureMessage);
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setStatus(successMessage);
    } catch {
      setStatus(failureMessage);
    }
  }

  return (
    <div className="not-prose" data-testid="preset-lab">
      <div ref={inlineHostRef} />
      {workspaceHost
        ? createPortal(
            <PresetWorkspaceShell
              fullscreenMode={fullscreenMode}
              isFallbackFullscreen={isFallbackFullscreen}
              isFullscreen={isFullscreen}
              workspaceRef={workspaceRef}
            >
              <h2 className="sr-only" id="preset-workspace-heading">
                Protoform preset workspace
              </h2>

              <header className="flex min-h-12 flex-wrap items-center gap-3 border-b px-3 py-2 sm:px-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div aria-hidden="true" className="flex -space-x-1">
                    {[
                      ["primary", previewVariables["--primary"]],
                      ["accent", previewVariables["--accent"]],
                      ["muted", previewVariables["--muted"]],
                    ].map(([name, color]) => (
                      <span
                        className="size-5 rounded-full border-2 border-background"
                        key={name}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="truncate font-medium text-sm">{activePreset.name}</span>
                  <span
                    className="hidden rounded-full border bg-muted/30 px-2 py-0.5 text-muted-foreground text-xs sm:inline-flex"
                    data-slot="preset-compatibility"
                  >
                    Base UI + Nova
                  </span>
                </div>

                <div className="ml-auto flex items-center gap-1">
                  <fieldset className="flex items-center gap-1">
                    <legend className="sr-only">Preview mode</legend>
                    <Button
                      aria-label="Light preview"
                      aria-pressed={mode === "light"}
                      className={cn(mode === "light" && "bg-muted")}
                      onClick={() => {
                        setMode("light");
                        setStatus("Light preview selected.");
                      }}
                      size="sm"
                      type="button"
                      variant={mode === "light" ? "outline" : "ghost"}
                    >
                      <SunIcon aria-hidden="true" />
                      Light
                    </Button>
                    <Button
                      aria-label="Dark preview"
                      aria-pressed={mode === "dark"}
                      className={cn(mode === "dark" && "bg-muted")}
                      onClick={() => {
                        setMode("dark");
                        setStatus("Dark preview selected.");
                      }}
                      size="sm"
                      type="button"
                      variant={mode === "dark" ? "outline" : "ghost"}
                    >
                      <MoonIcon aria-hidden="true" />
                      Dark
                    </Button>
                  </fieldset>
                  <Button
                    aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
                    onClick={toggleFullscreen}
                    size="sm"
                    title={isFullscreen ? "Exit full screen" : "Enter full screen"}
                    type="button"
                    variant="ghost"
                  >
                    {isFullscreen ? <Minimize2Icon aria-hidden="true" /> : <Maximize2Icon aria-hidden="true" />}
                    <span className="hidden sm:inline">{isFullscreen ? "Exit full screen" : "Full screen"}</span>
                  </Button>
                </div>
              </header>

              <div className="grid min-w-0 md:grid-cols-[11.5rem_minmax(0,1fr)] md:group-data-[fullscreen=true]/workspace:h-full md:group-data-[fullscreen=true]/workspace:min-h-0">
                <div className="min-w-0 border-b bg-muted/15 p-3 md:border-r md:border-b-0 md:group-data-[fullscreen=true]/workspace:overflow-y-auto">
                  <fieldset className="min-w-0">
                    <legend className="mb-2 px-1 font-medium text-muted-foreground text-xs">Presets</legend>
                    <div className="grid min-w-0 grid-cols-3 gap-1 md:grid-cols-1">
                      {presetDefinitions.map((preset) => {
                        const active = activePreset.id === preset.id;
                        const variables = mode === "dark" ? preset.dark : preset.light;

                        return (
                          <Button
                            aria-label={`Choose ${preset.name} preset`}
                            aria-pressed={active}
                            className={cn(
                              "h-9 justify-start gap-2 px-2.5 md:w-full",
                              active && "bg-muted ring-1 ring-border"
                            )}
                            key={preset.id}
                            onClick={() => selectPreset(preset)}
                            type="button"
                            variant="ghost"
                          >
                            <span
                              aria-hidden="true"
                              className="size-3.5 rounded-full border border-foreground/10"
                              style={{ backgroundColor: variables["--primary"] }}
                            />
                            {preset.name}
                            {active ? <CheckIcon aria-hidden="true" className="ml-auto hidden md:block" /> : null}
                          </Button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <fieldset className="mt-3 border-t pt-3">
                    <legend className="mb-2 px-1 font-medium text-muted-foreground text-xs">Radius</legend>
                    <div className="flex flex-wrap gap-1">
                      {presetRadii.map((candidate) => (
                        <Button
                          aria-pressed={radius === candidate.value}
                          className={cn("px-2", radius === candidate.value && "bg-muted")}
                          key={candidate.value}
                          onClick={() => {
                            setRadius(candidate.value);
                            setStatus(`${candidate.label} radius selected.`);
                          }}
                          size="xs"
                          type="button"
                          variant={radius === candidate.value ? "outline" : "ghost"}
                        >
                          {candidate.label}
                        </Button>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div
                  className={cn(
                    "min-w-0 bg-muted/25 text-foreground md:group-data-[fullscreen=true]/workspace:overflow-y-auto",
                    mode === "dark" && "dark"
                  )}
                  data-preset-id={activePreset.id}
                  data-testid="preset-preview"
                  style={previewStyle}
                >
                  <div className="flex min-h-[34rem] items-center justify-center p-4 sm:p-8 md:group-data-[fullscreen=true]/workspace:h-full md:group-data-[fullscreen=true]/workspace:min-h-0 md:group-data-[fullscreen=true]/workspace:items-start">
                    <div className="w-full max-w-3xl overflow-hidden rounded-2xl border bg-background shadow-sm">
                      <div aria-hidden="true" className="h-1.5 bg-primary" />
                      <header className="flex items-center justify-between gap-3 border-b bg-muted/30 px-5 py-4">
                        <div>
                          <h3 className="m-0! font-semibold! text-lg!">Create a review</h3>
                          <p className="m-0! text-muted-foreground text-xs">Live Protoform AutoForm</p>
                        </div>
                        <span className="rounded-full border bg-background px-2 py-0.5 text-muted-foreground text-xs">
                          {activePreset.name}
                        </span>
                      </header>

                      <div className="p-4 sm:p-5">
                        <AutoForm<PreviewValues>
                          onSubmit={() => setStatus(`${activePreset.name} preview form submitted.`)}
                          schema={previewSchema}
                          testId="preset-preview-form"
                          uiComponents={previewUiComponents}
                          validationMode="blur"
                          withSubmit
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="grid gap-3 border-t p-3 sm:px-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <p aria-live="polite" className="m-0! text-muted-foreground text-xs" role="status">
                    {status ?? activePreset.description}
                  </p>
                  <code className="block break-words text-foreground/70 text-xs">{command}</code>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Button
                    onClick={() =>
                      copyText(
                        presetCode,
                        "Preset code copied.",
                        "Could not copy the preset code. Copy it from the code field instead."
                      )
                    }
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <CopyIcon aria-hidden="true" />
                    Copy preset code
                  </Button>
                  <Button
                    onClick={() =>
                      copyText(
                        command,
                        "Bun command copied.",
                        "Could not copy the Bun command. Copy it from the command preview instead."
                      )
                    }
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <CopyIcon aria-hidden="true" />
                    Copy Bun command
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={createUrl} rel="noreferrer" target="_blank">
                      Open in shadcn/create
                      <ExternalLinkIcon aria-hidden="true" />
                    </a>
                  </Button>
                </div>
              </footer>
            </PresetWorkspaceShell>,
            workspaceHost
          )
        : null}
    </div>
  );
}
