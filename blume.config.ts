import { defineConfig } from "blume";

import { demoRedirects } from "./examples/catalog/demo-docs.js";

export default defineConfig({
  basePath: "/docs",
  content: {
    root: "content/docs",
  },
  deployment: {
    site: "https://protoform.pages.dev",
  },
  description: "Protovalidate-compatible shadcn forms for protobuf apps.",
  examples: {
    css: "theme.css",
    source:
      "{examples/basic/basic-form.tsx,examples/complex/complex-form.tsx,examples/kitchen-sink/kitchen-sink-form.tsx,examples/learning/cel-re2-form.tsx,examples/learning/oneof-form.tsx,examples/learning/two-step-form.tsx,examples/nested/deeply-nested-form.tsx,registry/base-nova/protoform/demo/catalog/!(*.test).tsx}",
  },
  i18n: {
    defaultLocale: "en",
    fallbackLocale: null,
    locales: [
      { code: "en", label: "English" },
      {
        code: "zh",
        label: "简体中文",
        style:
          "Simplified Chinese for Mainland China. Use concise technical prose and preserve API, CLI, package, and code identifiers in English.",
      },
      {
        code: "zh-TW",
        label: "繁體中文",
        style:
          "Traditional Chinese for Taiwan. Use concise technical prose and preserve API, CLI, package, and code identifiers in English.",
      },
      {
        code: "pl",
        label: "Polski",
        style:
          "Natural Polish technical documentation. Use concise prose and preserve API, CLI, package, and code identifiers in English.",
      },
    ],
  },
  navigation: {
    sidebar: {
      display: "group",
    },
  },
  openapi: {
    codeSamples: ["curl", "js"],
    enabled: true,
    renderer: "blume",
    route: "/reference",
    spec: "./openapi.yaml",
  },
  redirects: [...demoRedirects],
  theme: {
    fonts: {
      body: {
        fallback: "sans",
        name: "Inter",
        variants: [
          {
            src: "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
            weight: "100..900",
          },
        ],
      },
      display: {
        fallback: "sans",
        name: "Inter Tight",
        variants: [
          {
            src: "node_modules/@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2",
            weight: "100..900",
          },
        ],
      },
      mono: {
        fallback: "mono",
        name: "IBM Plex Mono",
        variants: [
          {
            src: "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2",
            weight: 400,
          },
          {
            src: "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2",
            weight: 500,
          },
          {
            src: "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2",
            weight: 600,
          },
          {
            src: "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-700-normal.woff2",
            weight: 700,
          },
        ],
      },
    },
  },
  title: "Protoform",
});
