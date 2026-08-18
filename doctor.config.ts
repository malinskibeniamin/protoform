import { defineConfig } from "react-doctor/api";

export default defineConfig({
  blocking: "warning",
  buckets: {
    "compiler-cleanup": "error",
  },
  // Registry entries and Astro islands are discovered outside Doctor's static
  // React import graph. TypeScript, Biome, and production builds cover them.
  deadCode: false,
  ignore: {
    files: [
      ".blume/**",
      ".blume-verify/**",
      "build/**",
      "conformance/gen/**",
      "dist/**",
      "examples/gen/**",
      "public/r/**",
      "registry/**/__golden__/**",
      "registry/**/gen/**",
      "registry/base-nova/protoform/lib/protobuf-v1-bridge/**",
      "**/*_form.ts",
      "**/*_pb.ts",
      "**/routeTree.gen.ts",
    ],
    overrides: [
      {
        // Installable registry modules import through their declared public
        // item boundaries so the registry can resolve dependencies.
        files: ["registry/base-nova/protoform/**"],
        rules: ["react-doctor/no-barrel-import"],
      },
      {
        // These standalone animation primitives cannot assume that consumers
        // mounted a shared LazyMotion provider.
        files: [
          "registry/base-nova/protoform/components/card/index.tsx",
          "registry/base-nova/protoform/components/checkbox/index.tsx",
          "registry/base-nova/protoform/components/choicebox/index.tsx",
          "registry/base-nova/protoform/components/collapsible/index.tsx",
          "registry/base-nova/protoform/components/copy-button/index.tsx",
          "registry/base-nova/protoform/components/popover/index.tsx",
          "registry/base-nova/protoform/components/radio-group/index.tsx",
          "registry/base-nova/protoform/components/tabs/index.tsx",
          "registry/base-nova/protoform/components/toggle-group/index.tsx",
          "registry/base-nova/protoform/components/tooltip/index.tsx",
        ],
        rules: ["react-doctor/use-lazy-motion"],
      },
      {
        // Measured auto-height and selection-indicator motion intentionally
        // animates geometry; transform-only motion changes the interaction.
        files: [
          "registry/base-nova/protoform/components/collapsible/index.tsx",
          "registry/base-nova/protoform/components/tabs/index.tsx",
          "registry/base-nova/protoform/components/toggle-group/index.tsx",
        ],
        rules: ["react-doctor/no-layout-property-animation"],
      },
      {
        // Schema editors are cohesive orchestration surfaces. Their logic is
        // already split into hooks and helpers at stable domain boundaries.
        files: [
          "registry/base-nova/protoform/components/auto-form/auto-form-core.tsx",
          "registry/base-nova/protoform/components/combobox/index.tsx",
          "registry/base-nova/protoform/components/json-field/index.tsx",
        ],
        rules: ["react-doctor/no-giant-component"],
      },
      {
        // These lists are positional editors, decorations, or fixed render
        // slots without stable domain identifiers.
        files: [
          "registry/base-nova/protoform/components/auto-form/renderers/index.tsx",
          "registry/base-nova/protoform/components/group/index.tsx",
          "registry/base-nova/protoform/components/json-field/index.tsx",
          "registry/base-nova/protoform/components/key-value-field/index.tsx",
          "registry/base-nova/protoform/components/toggle-group/index.tsx",
        ],
        rules: ["react-doctor/no-array-index-as-key"],
      },
      {
        // Card text convenience is a documented public polymorphic API.
        files: ["registry/base-nova/protoform/components/card/index.tsx"],
        rules: ["react-doctor/no-polymorphic-children"],
      },
      {
        // Controlled adapters intentionally synchronize external snapshots;
        // replacing this with derived state would break dirty tracking.
        files: [
          "registry/base-nova/protoform/components/auto-form/adapters/tanstack-v2.tsx",
          "registry/base-nova/protoform/components/auto-form/auto-form-core.tsx",
          "registry/base-nova/protoform/components/auto-form/field-wrapper.tsx",
          "registry/base-nova/protoform/components/json-field/index.tsx",
          "registry/base-nova/protoform/components/input/index.tsx",
          "registry/base-nova/protoform/lib/base-ui-compat/index.tsx",
        ],
        rules: [
          "react-doctor/no-adjust-state-on-prop-change",
          "react-doctor/no-derived-state",
          "react-doctor/no-derived-state-effect",
          "react-doctor/no-effect-chain",
        ],
      },
      {
        // These composite controls retain native keyboard focus on their
        // contained input; nested native buttons would be invalid HTML.
        files: [
          "registry/base-nova/protoform/components/input-group/index.tsx",
          "registry/base-nova/protoform/components/multi-select/index.tsx",
        ],
        rules: ["react-doctor/no-static-element-interactions", "react-doctor/prefer-tag-over-role"],
      },
      {
        // The combobox bridge reports collection state to its owning primitive.
        files: ["registry/base-nova/protoform/components/combobox/index.tsx"],
        rules: ["react-doctor/no-pass-data-to-parent"],
      },
      {
        // These error records are populated from live form state below their
        // declarations; they are not module-scope static values.
        files: [
          "registry/base-nova/protoform/components/auto-form/adapters/tanstack-v2.tsx",
          "registry/base-nova/protoform/components/auto-form/adapters/tanstack.tsx",
        ],
        rules: ["react-doctor/prefer-module-scope-static-value"],
      },
    ],
  },
  lint: true,
  noScore: true,
  respectInlineDisables: false,
  scope: "full",
  share: false,
  supplyChain: {
    enabled: false,
  },
  surfaces: {
    ciFailure: {
      includeFileContexts: ["test", "story"],
      includeTags: ["design"],
    },
  },
  verbose: true,
  warnings: true,
});
