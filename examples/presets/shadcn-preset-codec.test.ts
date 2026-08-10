import { describe, expect, it } from "vitest";

import { decodePreset, encodePreset } from "./shadcn-preset-codec.js";

describe("shadcn preset codec", () => {
  it("matches shadcn v4 preset codes", () => {
    expect(encodePreset({})).toBe("b0");
    expect(
      encodePreset({
        baseColor: "taupe",
        chartColor: "taupe",
        font: "instrument-serif",
        fontHeading: "instrument-serif",
        iconLibrary: "remixicon",
        menuAccent: "bold",
        menuColor: "inverted-translucent",
        radius: "large",
        style: "rhea",
        theme: "taupe",
      })
    ).toBe("b8V3duo56p");
  });

  it("decodes current and legacy shadcn preset links", () => {
    expect(decodePreset("b4ujYeUjgQ")).toEqual({
      baseColor: "gray",
      chartColor: "rose",
      font: "lora",
      fontHeading: "playfair-display",
      iconLibrary: "tabler",
      menuAccent: "bold",
      menuColor: "default-translucent",
      radius: "small",
      style: "maia",
      theme: "yellow",
    });

    const legacy = decodePreset("a1YmqvjO4");
    expect(legacy).toEqual({
      baseColor: "neutral",
      font: "geist",
      fontHeading: "inherit",
      iconLibrary: "lucide",
      menuAccent: "subtle",
      menuColor: "default",
      radius: "default",
      style: "nova",
      theme: "blue",
    });
    expect(legacy).not.toHaveProperty("chartColor");
  });

  it("rejects invalid preset codes", () => {
    expect(decodePreset("invalid")).toBeNull();
    expect(decodePreset("bnot_base62!")).toBeNull();
  });
});
