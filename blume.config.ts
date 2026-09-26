import { defineConfig } from "blume";
import { openapi } from "blume/reference";
import { pagefind } from "blume/search";

import { demoRedirects } from "./examples/catalog/demo-docs.js";

export default defineConfig({
  agents: {
    llmsTxt: {
      details: `## Agent guidance

Use Protoform for protobuf-backed React forms with Protovalidate validation.
Start with [Getting started](https://protoform.pages.dev/docs/getting-started) and
[Registry installation](https://protoform.pages.dev/docs/registry-install); use the documented registry items and pinned installation URLs.
Use Protobuf-ES v2 schemas. Choose useProtoForm for an existing UI and AutoForm for schema-driven rendering.
Keep stable React Hook Form v7 and TanStack Form v1 integrations separate from experimental v8/v2 items; opt into experimental items only when requested.
Treat the bookstore API reference as a runnable example, not a hosted production service.
Read the relevant guide and example before generating code; cite its canonical documentation URL.`,
    },
  },
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
  integrations: [
    {
      hooks: {
        "astro:config:setup": ({ updateConfig }) => {
          // Blume uses js-yaml v5, while Astro also installs v4. Bundle each
          // importer’s version instead of resolving the hoisted v4 at runtime.
          updateConfig({
            vite: {
              environments: {
                prerender: { resolve: { noExternal: ["js-yaml"] } },
              },
              ssr: { noExternal: ["js-yaml"] },
            },
          });
        },
      },
      name: "protoform:bundle-blume-yaml",
    },
  ],
  navigation: {
    sidebar: {
      display: "group",
    },
  },
  react: {
    compiler: true,
  },
  redirects: [...demoRedirects],
  reference: [
    openapi({
      codeSamples: ["curl", "js"],
      route: "/reference",
      spec: "./openapi.yaml",
    }),
  ],
  search: {
    indexing: { includeCodeBlocks: true },
    provider: pagefind(),
  },
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
