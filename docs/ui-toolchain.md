# UI quality toolchain

Run `bun run lint:fix` and `bun run type:check` before submitting changes. CI also runs component,
conformance, browser, registry-consumer and documentation tests.

## Reviewed versions (updated 2026-10-29)

| Tool            | Version                     | Responsibility                                     |
| --------------- | --------------------------- | -------------------------------------------------- |
| Bun             | 1.4.4                       | Package manager; pinned across workflows           |
| Blume           | 2.2.4                       | Astro/MDX checking, builds and audits              |
| Ultracite       | 8.1.0                       | Shared conventions and safe edit hooks             |
| Biome           | 2.6.3                       | General linting and source formatting              |
| Oxlint          | 1.90.0                      | Additional syntax, import, promise and test checks |
| oxlint-tsgolint | 7.0.2005                    | Type-aware linting and compiler diagnostics        |
| tsrs            | 0.18.0-ts7.1.0-dev.20260929 | Rust-based strict source and test checking         |
| Oxfmt           | 0.75.0                      | Astro/Markdown/YAML formatting                     |
| React Doctor    | 0.9.18                      | Full warning-blocking component/design audit       |
| React Scan      | 0.5.7                       | Interactive profiling: `bun run scan:react`        |

Source, test, and authored-file coverage checks use the exactly pinned Rust compiler, `tsrs`.
This release follows TypeScript 7.1 development, not the Microsoft 7.1 beta. It supports macOS arm64
and Linux x64/arm64; it does not ship Windows or Intel macOS binaries. TypeScript 6 remains for
synchronous AST APIs used by tooling, not for source/test typechecking. Blume retains its own
Astro/MDX checker.

`bun run scan:react` starts an opt-in development server with the installed React Scan module loaded
before React hydration. Profiling is never injected into builds or previews. The installed CLI's
`init` command replaces the older URL-based command; no unpinned CDN script is used.

Blume 2.2.4 has a Bun-managed patch in `patches/blume@2.2.4.patch`: load the OpenAPI request
module before defining its custom element. Its new lazy import lost early edits and Send clicks
while the already-visible controls were unwired. The existing fast-edit/send browser regressions
failed before this patch. Handlers attach when the element connects, not on the queued disclosure
`toggle` event: otherwise a first edit can arrive before the listener exists. A real-app regression
opens and edits in one event-loop task and checks the generated sample without a second input.
This trades deferred initialization for working controls; remove the patch
when upstream makes initialization synchronous or exposes a real loading/readiness state.
The pinned package integrity in `bun.lock` owns provenance; upstream license files are unchanged.

The version-scoped `deepmerge@^4` override installs the exact npm alias
`@stackline/deepmerge@1.1.0` for Ultracite, shadcn and `@shadcn/registry`.
It replaces the prototype-poisoning behavior in CVE-2026-93753 without changing the audit
policy or adding an advisory exception. Formik's separate deepmerge 2.x remains unchanged.
The fork has no runtime dependencies and preserves the default callable CommonJS/ESM API,
recursive configuration merging, custom array merging and `merge.all`.
`scripts/deepmerge.integration.test.ts` exercises the dependency resolved by each tooling
consumer, hostile input in both merge positions, and ordinary configuration behavior.
Remove the override when those consumers resolve an upstream release with the same fix;
rerun the security audit, regressions and registry consumer checks first.
See the [fork's release and compatibility notes](https://github.com/alexandroit/stackline-deepmerge/releases/tag/v1.1.0)
and [Bun's version-scoped override semantics](https://bun.com/docs/pm/overrides#version-scoped-overrides).

## Formatting and edit hooks

Biome owns JavaScript, TypeScript, JSON and CSS/SCSS formatting. Oxfmt owns Astro,
Markdown and YAML; Biome still lints those languages. Markdown formatting stays off in
Biome because its upstream whitespace bug can change rendered text. MDX stays with Blume.
`bun run lint:fix` runs both formatters before the read-only lint gate.

Oxfmt's `astro: true` requires the pinned `@astrojs/compiler-rs` development dependency.
Astro-only overrides preserve this project's single quotes and trailing-comma convention.
The project uses Astro 7, so it does not need the Astro 6 whitespace compatibility option.
Ultracite 8.1 replaces the local 8.0.2 Tailwind compatibility patch.

`ultracite fix --hook` leaves files unchanged when stdin has no readable edit path.
The hook integration suite exercises missing, unknown, invalid and unreadable payloads,
plus a valid edit that formats only its target. Run it with
`node scripts/run-tests.ts integration scripts/ultracite-hooks.integration.test.ts`.

## Rule decisions and coverage

`lint:rules` compares installed Biome, Oxlint, shadcn and React Doctor catalogs with explicit decisions.
New or removed rules fail until reviewed. Biome has 574 rules enabled as errors out of
640 explicit decisions. The React, Astro, Playwright, TanStack and type-aware presets match
this project's dependencies. React Native, Drizzle, Vue and Svelte presets are not installed.
`.oxlintrc.jsonc` records all 872 Oxlint decisions,
including nursery rules. Duplicate conventions have one owner: Oxlint's Boolean-cast fixer, for
example, conflicts with Biome's strict mixed-union conditions.
`prefer-return-this-type` is not safe for generic builders: an intersection silently erased the
field registry's accumulated literal names. A compiler-contract regression protects that API.

Framework-specific checks, opposite conventions, manual-memoization requirements and reflective
generic APIs cannot all be enforced simultaneously. Inapplicable checks remain explicitly off.
The 2.6.3 review enables 19 of its 33 new rules, including Boolean sort comparators,
unsafe returns and TanStack Query rest destructuring. Two existing applicable rules also
become errors: Playwright describe callbacks and scoped Astro styles. Positional Playwright
selectors remain valid for ordered collection tests; underscore conventions and mandatory
minimum animation durations add noise here. The loop-expression rule rejects readable
nullish fallbacks, and `Iterator.zip` is not available in the project's Node 26 runtime.
Other disabled additions target frameworks the project does not use.

### Release hardening

Additional compatible checks now enforce:

- `promise/always-return`: return intermediate promise results. `ignoreLastCallback: true`
  permits terminal side effects; it does not exempt returned multi-statement callbacks.
- `typescript/return-await`: `error-handling-correctness-only` prevents promises escaping
  `try`/`catch` without imposing an opposite return style elsewhere.
- `typescript/no-unsafe-type-assertion`: prefer runtime guards, validated JSON, discriminated
  unions and typed CSS-variable objects instead of narrowing casts.
- `noConditionalExpect` and `useExpect`: tests must execute assertions. Assertion helpers use
  `expect.hasAssertions()`; fixture-specific assertions are selected before test registration.
- `useAstroClientOnlyDirectiveValue`: client-only islands name their renderer.
- `useUniqueElementIds`: production components use instance-specific IDs. Isolated tests may
  exercise explicit IDs. `ChartContainer` and `ChartStyle` are excluded because their `id`
  scopes `data-chart`, not a DOM ID.
- `noExplicitAny` remains an error in inherited test-file overrides, not only production code.

The assertion rule has four scoped override groups naming 18 exact integration files in
`.oxlintrc.jsonc`, not directories or tests. These bridge runtime protobuf descriptors to Buf
conditional types, dynamic native form-library paths, erased React-context generics, custom
control names/ReactNode metadata, and Base UI render/ref/Motion contracts. Other unsafe-value
checks remain active in those files. Changes to these contracts need the hook, adapter,
conversion, preservation, registry and consumer suites; disabling the rule does not validate
external data. `scripts/release-hardening.test.ts` runs the installed linters on bad and valid
fixtures, including rejection of unsafe assignments inside an assertion-exempt bridge.

Runtime regressions found during adoption are covered directly: numeric step controls deliver
real change events and preserve ref attachment; repeated demo forms keep labels isolated;
malformed oneofs and FieldMasks are rejected rather than discarded. CEL runtime failures now
block validation with a safe root error instead of returning success. Providers cannot submit
primitive or array success values; all four form engines exercise rejection and recovery.
Applications that depended on fail-open CEL behavior must correct their expressions.

Existing compatibility/false-positive exemptions remain visible. `lint:exceptions` compares all
four lint configs against `origin/main`, including Oxlint. It rejects global error downgrades and
new or broadened waivers for protected rules. It permits narrowing existing waivers and bounded
adoption of a previously globally disabled rule, provided that rule had no scoped baseline policy.
The approved Biome 2.6 false-positive owners remain explicit and separately bounded.

Ordinary lint/fix commands reject compiler, linter, formatter and React Doctor suppression comments.
The scanner parses comments, including those after interpolated templates, rather than rejecting
strings that merely document directives. Alternate/nested quality configs are rejected.

`lint:coverage` verifies actual Biome/Oxlint file discovery, including Markdown, YAML and SCSS.
The authored `buf.gen.*.yaml` configs are explicitly included after Ultracite's generated-file
ignore; their names do not make them generated outputs.
`typecheck:coverage` verifies native
compiler programs, including tests and JavaScript. Only exact reviewed outputs in
`scripts/generated-sources.json` are exempt from source ownership. A new `gen/escape.ts` or
`escape_pb.ts` is not exempt. MDX uses Blume's parser/typechecker/build/audit, not Oxfmt's different grammar.

These checks prevent accidental bypasses, not malicious edits to the gates themselves. Protect
required CI checks and review policy changes at the repository-hosting layer.

## Upstream evidence

- [tsrs CLI usage](https://github.com/oxc-project/tsrs/blob/main/docs/USAGE.md)
- [tsrs compatibility and platform support](https://github.com/oxc-project/tsrs/blob/main/docs/COMPATIBILITY.md)
- [Ultracite 8.1 release notes](https://github.com/haydenbleasel/ultracite/pull/857)
- [Ultracite upgrade guide](https://www.ultracite.ai/docs/upgrade)
- [Biome 2.6.3 release notes](https://biomejs.dev/internals/changelog/version/2-6-3/)
- [Oxfmt Astro configuration](https://www.ultracite.ai/docs/configuration#formatting-astro-files-oxfmt)
- [Oxlint release notes](https://github.com/oxc-project/oxc/releases/tag/oxlint_v1.90.0)
- [Type-aware Oxlint](https://oxc.rs/docs/guide/usage/linter/type-aware)
- [Biome conflicting-rule guidance](https://biomejs.dev/guides/upgrade-to-biome-v2/)
- [Blume release notes](https://github.com/haydenbleasel/blume/releases/tag/blume%402.2.4)
- [React Scan installation](https://github.com/aidenybai/react-scan#manual-installation)
