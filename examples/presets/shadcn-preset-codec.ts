/**
 * Compact codec compatible with shadcn v4 preset links. The algorithm is
 * adapted from shadcn/ui under the MIT license in LICENSES/shadcn-MIT.txt.
 */

const presetStyles = [
  "nova",
  "vega",
  "maia",
  "lyra",
  "mira",
  "luma",
  "sera",
  "rhea",
] as const;
const presetBaseColors = [
  "neutral",
  "stone",
  "zinc",
  "gray",
  "mauve",
  "olive",
  "mist",
  "taupe",
] as const;
const presetThemes = [
  "neutral",
  "stone",
  "zinc",
  "gray",
  "amber",
  "blue",
  "cyan",
  "emerald",
  "fuchsia",
  "green",
  "indigo",
  "lime",
  "orange",
  "pink",
  "purple",
  "red",
  "rose",
  "sky",
  "teal",
  "violet",
  "yellow",
  "mauve",
  "olive",
  "mist",
  "taupe",
] as const;
const presetChartColors = presetThemes;
const presetIconLibraries = [
  "lucide",
  "hugeicons",
  "tabler",
  "phosphor",
  "remixicon",
] as const;
const presetFonts = [
  "inter",
  "noto-sans",
  "nunito-sans",
  "figtree",
  "roboto",
  "raleway",
  "dm-sans",
  "public-sans",
  "outfit",
  "jetbrains-mono",
  "geist",
  "geist-mono",
  "lora",
  "merriweather",
  "playfair-display",
  "noto-serif",
  "roboto-slab",
  "oxanium",
  "manrope",
  "space-grotesk",
  "montserrat",
  "ibm-plex-sans",
  "source-sans-3",
  "instrument-sans",
  "eb-garamond",
  "instrument-serif",
] as const;
const presetHeadingFonts = ["inherit", ...presetFonts] as const;
const presetRadii = ["default", "none", "small", "medium", "large"] as const;
const presetMenuAccents = ["subtle", "bold"] as const;
const presetMenuColors = [
  "default",
  "inverted",
  "default-translucent",
  "inverted-translucent",
] as const;

export interface PresetConfig {
  baseColor: (typeof presetBaseColors)[number];
  chartColor?: (typeof presetChartColors)[number];
  font: (typeof presetFonts)[number];
  fontHeading: (typeof presetHeadingFonts)[number];
  iconLibrary: (typeof presetIconLibraries)[number];
  menuAccent: (typeof presetMenuAccents)[number];
  menuColor: (typeof presetMenuColors)[number];
  radius: (typeof presetRadii)[number];
  style: (typeof presetStyles)[number];
  theme: (typeof presetThemes)[number];
}

interface PresetField {
  bits: number;
  key: keyof PresetConfig;
  values: readonly [string, ...string[]];
}

const legacyPresetFields: readonly PresetField[] = [
  { bits: 3, key: "menuColor", values: presetMenuColors },
  { bits: 3, key: "menuAccent", values: presetMenuAccents },
  { bits: 4, key: "radius", values: presetRadii },
  { bits: 6, key: "font", values: presetFonts },
  { bits: 6, key: "iconLibrary", values: presetIconLibraries },
  { bits: 6, key: "theme", values: presetThemes },
  { bits: 6, key: "baseColor", values: presetBaseColors },
  { bits: 6, key: "style", values: presetStyles },
];
const presetFields: readonly PresetField[] = [
  ...legacyPresetFields,
  { bits: 6, key: "chartColor", values: presetChartColors },
  { bits: 5, key: "fontHeading", values: presetHeadingFonts },
];
const base62Alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function toBase62(value: number) {
  if (value === 0) {
    return "0";
  }

  let encoded = "";
  let remaining = value;
  while (remaining > 0) {
    encoded = base62Alphabet[remaining % 62] + encoded;
    remaining = Math.floor(remaining / 62);
  }
  return encoded;
}

function fromBase62(value: string) {
  let decoded = 0;
  for (const character of value) {
    const index = base62Alphabet.indexOf(character);
    if (index === -1) {
      return -1;
    }
    decoded = decoded * 62 + index;
  }
  return decoded;
}

function fieldValue<const Values extends readonly [string, ...string[]]>(
  values: Values,
  index: number
): Values[number] {
  return values[index] ?? values[0];
}

export function encodePreset(config: Partial<PresetConfig>) {
  let encoded = 0;
  let offset = 0;
  for (const field of presetFields) {
    const value = config[field.key] ?? field.values[0];
    const index = field.values.indexOf(value);
    encoded += Math.max(index, 0) * 2 ** offset;
    offset += field.bits;
  }
  return `b${toBase62(encoded)}`;
}

export function decodePreset(code: string): PresetConfig | null {
  const [version] = code;
  if (code.length < 2 || (version !== "a" && version !== "b")) {
    return null;
  }

  const encoded = fromBase62(code.slice(1));
  if (encoded < 0) {
    return null;
  }

  let offset = 0;
  function read<const Values extends readonly [string, ...string[]]>(
    values: Values,
    bits: number
  ): Values[number] {
    const index = Math.floor(encoded / 2 ** offset) % 2 ** bits;
    offset += bits;
    return fieldValue(values, index);
  }

  const menuColor = read(presetMenuColors, 3);
  const menuAccent = read(presetMenuAccents, 3);
  const radius = read(presetRadii, 4);
  const font = read(presetFonts, 6);
  const iconLibrary = read(presetIconLibraries, 6);
  const theme = read(presetThemes, 6);
  const baseColor = read(presetBaseColors, 6);
  const style = read(presetStyles, 6);
  const chartColor = version === "b" ? read(presetChartColors, 6) : undefined;
  const fontHeading = version === "b" ? read(presetHeadingFonts, 5) : "inherit";

  return {
    baseColor,
    ...(chartColor ? { chartColor } : {}),
    font,
    fontHeading,
    iconLibrary,
    menuAccent,
    menuColor,
    radius,
    style,
    theme,
  };
}
