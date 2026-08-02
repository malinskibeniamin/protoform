import { decodePreset, encodePreset, type PresetConfig } from "shadcn/preset";

export type PresetMode = "light" | "dark";
export type PresetRadius = PresetConfig["radius"];
export type PresetColorName =
  | "accent"
  | "accent-foreground"
  | "background"
  | "border"
  | "card"
  | "card-foreground"
  | "destructive"
  | "foreground"
  | "input"
  | "muted"
  | "muted-foreground"
  | "popover"
  | "popover-foreground"
  | "primary"
  | "primary-foreground"
  | "ring"
  | "secondary"
  | "secondary-foreground";
export type PresetCssVariables = Record<`--${PresetColorName}`, string>;

export interface PresetDefinition {
  chartColor: NonNullable<PresetConfig["chartColor"]>;
  dark: PresetCssVariables;
  description: string;
  id: string;
  light: PresetCssVariables;
  name: string;
  theme: PresetConfig["theme"];
}

const lightBase = {
  "--accent": "oklch(0.97 0 0)",
  "--accent-foreground": "oklch(0.205 0 0)",
  "--background": "oklch(1 0 0)",
  "--border": "oklch(0.922 0 0)",
  "--card": "oklch(1 0 0)",
  "--card-foreground": "oklch(0.145 0 0)",
  "--destructive": "oklch(0.577 0.245 27.325)",
  "--foreground": "oklch(0.145 0 0)",
  "--input": "oklch(0.922 0 0)",
  "--muted": "oklch(0.97 0 0)",
  "--muted-foreground": "oklch(0.556 0 0)",
  "--popover": "oklch(1 0 0)",
  "--popover-foreground": "oklch(0.145 0 0)",
  "--ring": "oklch(0.708 0 0)",
} satisfies Partial<PresetCssVariables>;

const darkBase = {
  "--accent": "oklch(0.269 0 0)",
  "--accent-foreground": "oklch(0.985 0 0)",
  "--background": "oklch(0.145 0 0)",
  "--border": "oklch(1 0 0 / 10%)",
  "--card": "oklch(0.205 0 0)",
  "--card-foreground": "oklch(0.985 0 0)",
  "--destructive": "oklch(0.704 0.191 22.216)",
  "--foreground": "oklch(0.985 0 0)",
  "--input": "oklch(1 0 0 / 15%)",
  "--muted": "oklch(0.269 0 0)",
  "--muted-foreground": "oklch(0.708 0 0)",
  "--popover": "oklch(0.205 0 0)",
  "--popover-foreground": "oklch(0.985 0 0)",
  "--ring": "oklch(0.556 0 0)",
} satisfies Partial<PresetCssVariables>;

const coloredSecondaryLight = {
  "--secondary": "oklch(0.967 0.001 286.375)",
  "--secondary-foreground": "oklch(0.21 0.006 285.885)",
} satisfies Partial<PresetCssVariables>;

const coloredSecondaryDark = {
  "--secondary": "oklch(0.274 0.006 286.033)",
  "--secondary-foreground": "oklch(0.985 0 0)",
} satisfies Partial<PresetCssVariables>;

interface AccentDefinition {
  chartColor: NonNullable<PresetConfig["chartColor"]>;
  darkPrimary: string;
  description: string;
  id: string;
  lightPrimary: string;
  name: string;
  primaryForeground: string;
  theme: PresetConfig["theme"];
}

const accentDefinitions = [
  {
    chartColor: "blue",
    darkPrimary: "oklch(0.424 0.199 265.638)",
    description: "Clear blue",
    id: "ocean",
    lightPrimary: "oklch(0.488 0.243 264.376)",
    name: "Ocean",
    primaryForeground: "oklch(0.97 0.014 254.604)",
    theme: "blue",
  },
  {
    chartColor: "emerald",
    darkPrimary: "oklch(0.432 0.095 166.913)",
    description: "Grounded green",
    id: "forest",
    lightPrimary: "oklch(0.508 0.118 165.612)",
    name: "Forest",
    primaryForeground: "oklch(0.979 0.021 166.113)",
    theme: "emerald",
  },
  {
    chartColor: "rose",
    darkPrimary: "oklch(0.455 0.188 13.697)",
    description: "Warm red",
    id: "rose",
    lightPrimary: "oklch(0.514 0.222 16.935)",
    name: "Rose",
    primaryForeground: "oklch(0.969 0.015 12.422)",
    theme: "rose",
  },
  {
    chartColor: "violet",
    darkPrimary: "oklch(0.432 0.232 292.759)",
    description: "Expressive purple",
    id: "violet",
    lightPrimary: "oklch(0.491 0.27 292.581)",
    name: "Violet",
    primaryForeground: "oklch(0.969 0.016 293.756)",
    theme: "violet",
  },
  {
    chartColor: "amber",
    darkPrimary: "oklch(0.473 0.137 46.201)",
    description: "Warm gold",
    id: "amber",
    lightPrimary: "oklch(0.555 0.163 48.998)",
    name: "Amber",
    primaryForeground: "oklch(0.987 0.022 95.277)",
    theme: "amber",
  },
] satisfies AccentDefinition[];

function buildAccentPreset(accent: AccentDefinition): PresetDefinition {
  return {
    chartColor: accent.chartColor,
    dark: {
      ...darkBase,
      ...coloredSecondaryDark,
      "--primary": accent.darkPrimary,
      "--primary-foreground": accent.primaryForeground,
    },
    description: accent.description,
    id: accent.id,
    light: {
      ...lightBase,
      ...coloredSecondaryLight,
      "--primary": accent.lightPrimary,
      "--primary-foreground": accent.primaryForeground,
    },
    name: accent.name,
    theme: accent.theme,
  };
}

/**
 * Curated from shadcn's Base UI + Nova `/init` output. These variables are
 * intentionally local so the docs preview does not depend on a third-party
 * request at runtime.
 */
const neutralPreset: PresetDefinition = {
  chartColor: "neutral",
  dark: {
    ...darkBase,
    "--primary": "oklch(0.922 0 0)",
    "--primary-foreground": "oklch(0.205 0 0)",
    "--secondary": "oklch(0.269 0 0)",
    "--secondary-foreground": "oklch(0.985 0 0)",
  },
  description: "Quiet grayscale",
  id: "neutral",
  light: {
    ...lightBase,
    "--primary": "oklch(0.205 0 0)",
    "--primary-foreground": "oklch(0.985 0 0)",
    "--secondary": "oklch(0.97 0 0)",
    "--secondary-foreground": "oklch(0.205 0 0)",
  },
  name: "Neutral",
  theme: "neutral",
};

export const presetDefinitions: PresetDefinition[] = [
  neutralPreset,
  ...accentDefinitions.map(buildAccentPreset),
];

export const presetRadii: Array<{
  label: string;
  value: PresetRadius;
  cssValue: string;
}> = [
  { cssValue: "0rem", label: "None", value: "none" },
  { cssValue: "0.3rem", label: "Small", value: "small" },
  { cssValue: "0.5rem", label: "Medium", value: "medium" },
  { cssValue: "0.625rem", label: "Default", value: "default" },
  { cssValue: "0.75rem", label: "Large", value: "large" },
];

export const defaultPreset = neutralPreset;
export const defaultRadius: PresetRadius = "default";

export function buildPresetConfig(
  preset: PresetDefinition,
  radius: PresetRadius
): PresetConfig {
  return {
    baseColor: "neutral",
    chartColor: preset.chartColor,
    font: "geist",
    fontHeading: "inherit",
    iconLibrary: "lucide",
    menuAccent: "subtle",
    menuColor: "default",
    radius,
    style: "nova",
    theme: preset.theme,
  };
}

export function buildPresetCode(
  preset: PresetDefinition,
  radius: PresetRadius
): string {
  return encodePreset(buildPresetConfig(preset, radius));
}

export function findSupportedPreset(
  code: string
): { preset: PresetDefinition; radius: PresetRadius } | undefined {
  const config = decodePreset(code);
  if (
    config?.style !== "nova" ||
    config.baseColor !== "neutral" ||
    config.iconLibrary !== "lucide" ||
    config.font !== "geist" ||
    config.fontHeading !== "inherit" ||
    config.menuAccent !== "subtle" ||
    config.menuColor !== "default"
  ) {
    return;
  }

  const preset = presetDefinitions.find(
    (candidate) =>
      candidate.theme === config.theme &&
      candidate.chartColor === config.chartColor
  );
  const radius = presetRadii.find(
    (candidate) => candidate.value === config.radius
  )?.value;

  if (!(preset && radius) || buildPresetCode(preset, radius) !== code) {
    return;
  }

  return { preset, radius };
}
