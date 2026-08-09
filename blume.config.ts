import { defineConfig } from "blume";

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
  title: "Protoform",
});
