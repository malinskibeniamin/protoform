import type { AutoFormStep } from "./types";

export function getStepConfigurationError(steps: AutoFormStep[], defaultStep?: string): string | undefined {
  if (steps.length < 2) {
    return "AutoForm stepper requires at least two steps.";
  }

  const ids = new Set<string>();
  for (const step of steps) {
    if (!step.id.trim()) {
      return "AutoForm step ids must not be empty.";
    }
    if (ids.has(step.id)) {
      return `AutoForm step ids must be unique. Duplicate: ${step.id}`;
    }
    ids.add(step.id);
  }

  if (defaultStep && !ids.has(defaultStep)) {
    return 'AutoForm default step "'.concat(defaultStep, '" does not exist.');
  }

  return undefined;
}
