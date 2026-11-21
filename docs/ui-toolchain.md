# UI quality toolchain

Run `bun run lint:fix` and `bun run type:check` before submitting changes. CI also runs component,
conformance, browser, registry-consumer and documentation tests.

## Reviewed versions (updated 2026-11-16)

| Tool            | Version             | Responsibility                                     |
| --------------- | ------------------- | -------------------------------------------------- |
| Bun             | 1.4.4               | Package manager; pinned across workflows           |
| Blume           | 2.2.7               | Astro/MDX checking, builds and audits              |
| Ultracite       | 8.2.1               | Shared conventions and safe edit hooks             |
| Biome           | 2.6.8               | General linting and source formatting              |
| Oxlint          | 1.94.0              | Additional syntax, import, promise and test checks |
| oxlint-tsgolint | 7.0.2007            | Type-aware linting and compiler diagnostics        |
| tsrs            | 0.25.0-ts7.1.0-beta | Rust-based strict source and test checking         |
| Oxfmt           | 0.79.0              | Astro/Markdown/YAML formatting                     |
| React Doctor    | 0.9.23              | Full warning-blocking component/design audit       |
| React Scan      | 0.5.7               | Interactive profiling: `bun run scan:react`        |

Source, test, and authored-file coverage checks use the exactly pinned Rust compiler, `tsrs`.
This release targets TypeScript 7.1 beta and uses upstream checker defaults. It supports macOS
arm64/x64, Linux x64/arm64 and Windows x64/arm64. The project uses the default checker mode, not `--fast`. TypeScript 6 remains for
synchronous AST APIs used by tooling, not for source/test typechecking. Blume retains its own
Astro/MDX checker.

The primary strict program includes authored tests, so the combined gate checks it once;
`typecheck:tests` remains available for a targeted test program. Coverage is checked against
the primary program, preventing tests from silently moving outside the combined gate.

Rstest's Node and Happy DOM projects enable React Compiler through SWC's
`jsc.transform.reactCompiler`; the React plugin's `reactCompiler` option applies only to
web targets. Real CLI regressions compile a valid component and reject an impure render
in all three Node-target projects. Browser mode retains the plugin's web-target transform.

`bun run scan:react` starts an opt-in development server with the installed React Scan module loaded
before React hydration. Profiling is never injected into builds or previews. The installed CLI's
`init` command replaces the older URL-based command; no unpinned CDN script is used.

Blume 2.2.7 has a Bun-managed patch in `patches/blume@2.2.7.patch`: load the OpenAPI request
module before defining its custom element. Its new lazy import lost early edits and Send clicks
while the already-visible controls were unwired. The existing fast-edit/send browser regressions
failed before this patch. Handlers attach when the element connects, not on the queued disclosure
`toggle` event: otherwise a first edit can arrive before the listener exists. A real-app regression
opens and edits in one event-loop task and checks the generated sample without a second input.
This trades deferred initialization for working controls; remove the patch
when upstream makes initialization synchronous or exposes a real loading/readiness state.
The pinned package integrity in `bun.lock` owns provenance; upstream license files are unchanged.

The same patch isolates the language-choice listener from server-side locale routing. Importing
the routing module retained every UI translation dictionary in the eager language-switcher chunk.
The docs browser contract bounds the complete static client import graph and preserves language
selection with the current fragment. Remove this portion when upstream separates that browser
boundary without losing locale persistence, dismissal or routing behavior.

The 2.2.7 upgrade retains that patch: its unpatched source still defers initialization
until the disclosure toggle. Blume's declaration exports and localized reference labels,
Astro's build/router fixes, Connect's cancellation cleanup and Rstest's Happy DOM 21
prebundling apply without local opt-ins. Resolver 7's breaking TypeBox migration does not
affect Protoform, which only uses `toNestErrors` and `validateFieldsNatively`.

Pixelmatch 8 uses OKLab/HyAB color differences and improved transparency detection. The
screenshot comparator keeps `threshold: 0.2`, anti-alias filtering and zero differing-pixel
acceptance; it does not opt into masks or windowed counts. A transparent-white regression
now detects a change missed by version 7. That comparator migration did not regenerate references.
The subsequent dependency refresh updates eight owner-authorized, agent-reviewed text-rendering baselines only;
dimensions, layout and zero-pixel tolerance remain unchanged. Capture details and hashes are in
`docs/verification/macos-screenshot-provenance.json`.
The registry source pins `react-resizable-panels@4.24.0` for copied consumers too;
new Workspace APIs remain unused.

The version-scoped `deepmerge@^4` override installs the exact npm alias
`@stackline/deepmerge@1.1.2` for Ultracite, shadcn and `@shadcn/registry`.
It replaces the prototype-poisoning behavior in CVE-2026-93753 without changing the audit
policy or adding an advisory exception. Formik's separate deepmerge 2.x remains unchanged.
The fork has no runtime dependencies and preserves the default callable CommonJS/ESM API,
recursive configuration merging, custom array merging and `merge.all`.
`scripts/deepmerge.integration.test.ts` exercises the dependency resolved by each tooling
consumer, hostile input in both merge positions, and ordinary configuration behavior.
Remove the override when those consumers resolve an upstream release with the same fix;
rerun the security audit, regressions and registry consumer checks first.
See the [fork's release and compatibility notes](https://github.com/alexandroit/stackline-deepmerge/releases/tag/v1.1.2)
and [Bun's version-scoped override semantics](https://bun.com/docs/pm/overrides#version-scoped-overrides).

The 2026-11-08 refresh updates stable production/dev packages and both existing experimental
comparison tracks (React Hook Form `8.0.0-beta.5` and TanStack Form `2.0.0-alpha.3`).
TanStack v2 submission callbacks now read `validatorOutputs`, not `schemaOutputs`.
Protobuf runtime and generators move together to 2.17.0; Buf locks and registry output are regenerated.
The new React Doctor `forwarded-set-state-in-effect` rule is enforced as an error.

Six redundant overrides were removed: MCP SDK, Rspack, Vercel's Zod, KaTeX, Lodash ES and Sharp.
Their parents now resolve compatible versions normally. Security overrides remain for Glob 14.0.4,
Minimatch 11.0.8, Typography's selector parser 6.1.6, Vercel's path-to-regexp 6.3.0, router's
path-to-regexp 8.4.2 and the deepmerge fork. The path-to-regexp lines intentionally differ: the
parents rely on different APIs; forcing v9 into either is not a compatible upgrade.

The 2.6.4 verification previously refreshed three transitive resolutions to their smallest
fixed releases: `@hono/node-server` 2.1.3, `seroval` 1.6.11 and `systeminformation` 5.33.16.
These remediate nine audit advisories without adding dependencies, overrides or audit exceptions.
The current refresh supersedes these resolutions with compatible releases, including Seroval 1.7.10. See the [static-path advisory](https://github.com/advisories/GHSA-rmxm-3fg6-px4f),
[Seroval injection advisory](https://github.com/advisories/GHSA-f86p-h4j2-7qgj) and
[systeminformation command-injection advisory](https://github.com/advisories/GHSA-3f7j-7jwc-fxfj).

The 2026-11-17 runtime/development refresh uses the latest stable npm tags for the 16 requested
packages (Biome was already current), plus `tsrs` 0.25.0 on its existing TypeScript 7.1 beta track.
[Oxlint 1.94.0](https://github.com/oxc-project/oxc/releases/tag/oxlint_v1.94.0) and
[Oxfmt 0.79.0](https://github.com/oxc-project/oxc/releases/tag/oxfmt_v0.79.0) add safer fixes,
more suggestions and Prettier 3.10.1 support. Installed rule catalogs contain no new IDs.
The disabled-rule review enables four Biome and 19 Oxlint rules as errors without broadening
any file exemptions. Parameter count is capped at seven to preserve existing callback contracts.
Async form callbacks and default-handled protobuf enum values remain supported by the
configured Promise/exhaustiveness checks. React refs and IDs use recognizable local names;
named loop/await results preserve runtime behavior. React Doctor keeps shorthand true props,
and named forwardRef render callbacks retain their debugging/display names.

Oxlint's type-aware runner is explicitly `node_modules/.bin/tsrs-lint`. Source and test
`tsrs --noEmit` commands remain available; the combined gate checks the primary program once because it includes authored tests. The installed stable-tag tsrs runner accepts the
Boolean `checksConditionals` option, not Oxlint 1.94's new object-form `flagUnions` option.
Do not enable that option until the stable tsrs runner supports it. Numeric CSS parsing,
empty callback expressions, generic builder returns and compiler inference retain their
existing contracts rather than accepting destructive autofixes.

Astro 7.4.12 and Vite 8.3.8 retain their compatible framework/bundler pairing. Targeted lockfile
updates select `@astrojs/node` 11.1.13, `@hono/node-server` 2.1.8 and Hono 4.13.19 within their
parents' existing ranges. The existing Minimatch override advances to 11.0.8 for its compile-cost,
cache-retention and literal-escaping fixes. These updates add no audit exceptions or new overrides.

## Dependency override decisions (reviewed 2026-11-15)

Review owner ranges, security fixes and consumer behavior together; a clean audit alone does not prove compatibility.
The existing Blume patch and `deepmerge@^4` alias retain their removal conditions above.

| Original override                 | Decision and owner constraint                                                                                                          | Removal condition / verification                                                                                                            |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `@modelcontextprotocol/sdk`       | Remove the redundant pin; Blume accepts `^1.30.0`. Locked SDK remains 1.32.1.                                                          | No package or integrity change; frozen install and audit.                                                                                   |
| `@rspack/core`                    | Remove: Rsbuild 2.3.1 now supports the locked Rspack 2.3.1 through `~2.3.1`.                                                           | Native compiler, React Compiler, mock and browser suites verify the owner-supported resolution.                                             |
| Typography → selector parser      | Use the security-backported 6.1.6 rather than force 7.x onto Typography's exact 6.0.10. Shadcn independently resolves supported 7.2.1. | Remove when Typography accepts a fixed parser. Prose, excluded children and nested modifiers compile; representative CSS is byte-identical. |
| Vercel CLI config → Zod           | Remove after the supported Functions → OIDC → CLI-config update below.                                                                 | Fixed bundled and declared Zod; config passthrough, rejection and auth-file filtering regressions.                                          |
| Vercel routing → `path-to-regexp` | Keep 6.3.0 instead of the owner's exact vulnerable 6.1.0; do not force router's v8 grammar.                                            | Remove when routing-utils drops or updates the old import; optional/repeated rewrite captures must still work.                              |
| `deepmerge@^4`                    | Keep the scoped 1.1.2 security replacement; do not replace Formik's separate 2.x.                                                      | Fixed upstream owner release; hostile-key, array, custom-merge, cycle and clone regressions.                                                |
| `glob`                            | Keep 14.0.4 security remediation despite NFT's `^13.0.0`; no speculative latest-major substitution.                                    | Remove when NFT accepts a fixed version. Dynamic asset tracing covers symlinks, dotfiles and dependency-directory exclusions.               |
| `katex`                           | Remove: Mermaid 12.3.0 now accepts `^0.18.0`, resolving KaTeX 0.18.10 without a pin.                                                   | Preserve inline/display/error output and diagram math labels on the owner-supported family.                                                 |
| `lodash-es`                       | Remove: Chevrotain 13.2.0 no longer pins Lodash ES; remaining owners resolve fixed 4.18.1.                                             | Retain Mermaid parsing and Formik integration checks without a global pin.                                                                  |
| `minimatch`                       | Keep 11.0.8 for compile-cost, retained-cache and literal-escaping fixes, despite older ESLint/filelist ranges.                         | Remove when owners select fixed compatible releases; config matching and filelist expansion/exclusions exercise both API families.          |
| Router → `path-to-regexp`         | Keep 8.4.2. Although Router accepts `^8.0.0`, removing the override resolves vulnerable 8.2.0.                                         | Require an unforced fixed resolution and clean audit; keep v8 separate from Vercel's v6 replacement.                                        |
| `sharp`                           | Remove the redundant pin; Blume accepts `^0.35.5` and Astro `^0.35.4`. Locked Sharp/native packages remain unchanged.                  | Frozen install and image/documentation build; do not remove native image functionality.                                                     |

Selector-parser 6.1.6 and 7.1.8 fix the newer
[quadratic parsing advisory](https://github.com/postcss/postcss-selector-parser/security/advisories/GHSA-67xj-gfww-g738);
7.2.1 also restores constructor escaping compatibility and fixes its TypeScript declaration
([release notes](https://github.com/postcss/postcss-selector-parser/releases/tag/7.2.1)).
This project parses trusted build-time CSS, not remote selectors. Router's unpinned downgrade
reintroduces [optional-group](https://github.com/pillarjs/path-to-regexp/security/advisories/GHSA-j3q9-mxjg-w52f)
and [wildcard](https://github.com/pillarjs/path-to-regexp/security/advisories/GHSA-27v5-c462-wpq7) denial-of-service advisories.

CLI-config 0.3.1 bundled Zod 4.1.11: changing its installed dependency never rewrote that embedded code.
The supported chain from Astro's existing Functions range now selects Functions 3.11.3 → OIDC 4.0.9 →
CLI-config 0.4.0, whose artifact embeds Zod 4.6.7 and declares `^4.6.6`. This removes the ineffective
leaf override without overriding an owner's exact pin. The [collection-exhaustion advisory](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)
was not reachable through the old default object/scalar config schemas; nevertheless the new artifact fixes the embedded runtime.
Verification uses fixture config only, never real credentials, token refresh or deployment. New DPoP/affinity APIs are not adopted.

Run the owner compatibility checks with
`node scripts/run-tests.ts integration scripts/dependency-overrides.integration.test.ts scripts/deepmerge.integration.test.ts`.
These targeted probes do not certify every third-party feature or platform. Keep frozen installation, security audit,
registry consumers, form integrations, native compiler and complete documentation/browser gates before delivery.

## Client payload budgets

The current main dependency refresh installs CEL 0.6.2 alongside Protovalidate 1.3.0's exact CEL/Re2 0.6.1 pins. The complete-consumer caps account for both engines after isolated base/head builds confirmed the inherited increase. The complete-consumer probes externalize no dependencies, and Protovalidate's CEL/Re2 pins are unchanged; revisit the duplication when Protovalidate updates its declared dependencies.

Own-code bundle checks remain in place. Fully resolved, no-externals host/default-UI probes additionally bound initial,
async and total gzip JavaScript; CodeMirror must remain deferred. Built-route budgets follow representative routes'
static, literal-dynamic, inline and island module graphs, counting shared chunks once. Pagefind's runtime/worker and ELK's embedded fallback are accounted for explicitly; unexpected computed import or worker sites fail. These measure compressed artifact graphs,
not observed network traffic or CSS, font and WASM payloads. A paired host probe found only a negligible gzip difference
when removing the existing Motion wrapper, while losing its inherited reduced-motion policy; keep the wrapper without a speculative abstraction.

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
New or removed rules fail until reviewed. Biome has 648 rules globally enabled as errors out of
816 explicit decisions. The React, Astro, Playwright, TanStack and type-aware presets match
this project's dependencies. React Native, Drizzle, Vue and Svelte presets are not installed.
`.oxlintrc.jsonc` records all 872 Oxlint decisions,
including nursery rules. Incompatible duplicate conventions retain one owner: Biome owns
mixed/type-only import placement and lowercase hexadecimal digits.
`prefer-return-this-type` is not safe for generic builders: an intersection silently erased the
field registry's accumulated literal names. A compiler-contract regression protects that API.

Framework-specific checks, opposite conventions, manual-memoization requirements and reflective
generic APIs cannot all be enforced simultaneously. Inapplicable checks remain explicitly off.
The 2.6.3 review enables 19 of its 33 new rules, including Boolean sort comparators,
unsafe returns and TanStack Query rest destructuring. Two existing applicable rules also
become errors: Playwright describe callbacks and scoped Astro styles. Positional Playwright
selectors remain valid for ordered collection tests; underscore conventions and mandatory
minimum animation durations add noise here. Loop expressions now use named inputs before iteration. `Iterator.zip` remains unavailable
in the project's Node 26 runtime.
Other disabled additions target frameworks the project does not use.

### Biome 2.6.4 additions

The installed schema adds 30 rule decisions. Six gain error-level enforcement; recursion is production-scoped:

| Rule                    | Reason                                                                         |
| ----------------------- | ------------------------------------------------------------------------------ |
| `noConsoleSpaces`       | Avoid doubled separators in multi-argument console output.                     |
| `noMagicArrayFlatDepth` | Name non-default flattening depths; no explanatory comment is required.        |
| `noReturnArrayPush`     | Do not accidentally return an array length from a collector or callback.       |
| `noUselessRecursion`    | Use iterative production traversal where self-calls add avoidable stack depth. |
| `noYamlBooleanKeys`     | Quote boolean-looking mapping keys so they remain strings.                     |
| `useWhileLoopCondition` | Put a loop's leading break condition in its header.                            |

The 22 new Vue/Svelte checks remain off because this project uses neither framework.
`noNull` remains off: JSON, protobuf values, React refs and absent UI output legitimately use
`null`; replacing it with `undefined` changes contracts. IIFE readability stays with Oxlint: Biome's `noUnreadableIife` fixer expands arrow returns
that the required `arrow-body-style` fixer immediately collapses. An executable probe preserves the existing Oxlint diagnostic and verifies that accepted
named factories are stable across repeated formatter/fixer passes. `noUselessRecursion` is enabled in `registry/`, `examples/`
and `components/`, not test-only screenshot polling, which must remain sequential under
its existing await-in-loop ban. No previously enforced rule was weakened.
Oxfmt still owns Markdown formatting, even with Biome's Markdown fixes, so formatters do not compete.

Adoption replaces needless wrapper-validation recursion.
CEL cause traversal now preserves original diagnostics for deep or cyclic error collections
instead of replacing them with a stack-overflow error. Public evaluator regressions cover both.

### Biome 2.6.5–2.6.6 additions

Biome 2.6.6 fixes rule selection in groups exceeding 256 entries. The nursery group now
has 281 explicit decisions. The upgrade reviews all 97 additions since 2.6.4 and enables
34 as errors, including invalid numeric arguments, constant comparisons, event/Promise
misuse, Playwright browser-scope references, stable Query clients and Tailwind v4 variable
shorthand. Dynamic-delete checks align with the existing Oxlint rule; excessive nesting is
bounded at four blocks. Both checks accept the current source without exemptions.
The full-config regression exercises a rule beyond index 255 as well as invalid numeric
precision, while continuing to accept intentional `null` values.

The 60 new Vue, Svelte and Next.js checks stay off because those runtimes are not used.
Three other additions remain off: `noMapSpread` can replace immutable per-item copies with
an unsafe `Object.assign` fix that mutates the original objects;
`noSyncMethods` rejects intentional CLI/test setup; `usePackageJsonCpu` would unnecessarily restrict
architecture-independent source consumers. No previously enforced rule is weakened.

Source adoption makes nullable conditions explicit without changing empty-string fallbacks,
uses equivalent array predicates and Tailwind shorthand, and annotates the sequential server
startup reducer's Promise accumulator. Registry copies are regenerated from authored source.

### Biome 2.6.7–2.6.8 additions

The installed schema adds 49 nursery rules across these two patches; 31 become errors.
They cover invalid Fetch options, late `event.currentTarget` reads, deprecated Buffer
construction, redundant types/spreads, invalid namespace imports, global regular expressions,
mock assertions, package licenses and YAML structure. Every pre-upgrade rule decision and
exception boundary is unchanged. Three conformance helpers now check `Array.find()` results
explicitly against `undefined` to satisfy the updated type inference.

The remaining 18 additions are explicitly off:

- Ten target Drizzle, Vue or Svelte, which are not project runtimes.
- `noDisabledAttribute` conflicts with intentional native disabled controls, which prevent
  editing and submission rather than merely announcing an unavailable action.
- `noExcessiveSelectorComplexity` and `noTailwindRestrictedClasses` require project-specific
  limits/denylists that this upgrade does not introduce.
- `useConsistentBooleanName` would impose new names on public protobuf/form contracts;
  `useCalledWith` rejects intentional lifecycle call-count assertions.
- `noYamlEmptyMapValues` rejects intentional YAML null values, including workflow event declarations.
- `noMisusedSpread` incorrectly treats the JSON editor's `Array.isArray()`-narrowed,
  subsequently reassigned array as a string inside React callbacks.
- `useAtomicUpdates` does not recognize the QuickJS controller's revision guards/submission
  lock or the screenshot poller's sequential updates. These are not unguarded stale writes.

The release-hardening suite rejects invalid Fetch bodies, non-global `replaceAll()` regexes,
late `currentTarget` access and empty YAML sequence entries, and accepts valid counterparts.
The full source lint gate exercises the intentionally accepted cases above.

Biome 2.6.8 improves flow narrowing, conditional types and overload selection. The faster
suppression-free and Tailwind lint paths apply without configuration changes; this repository
has not benchmarked the upstream performance claims. Markdown/YAML formatting remains with Oxfmt.

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

- [Biome 2.6.8 release notes](https://github.com/biomejs/biome/releases/tag/%40biomejs%2Fbiome%402.6.8)
- [Biome 2.6.7 release notes](https://github.com/biomejs/biome/releases/tag/%40biomejs%2Fbiome%402.6.7)
- [Biome 2.6.6 release notes](https://github.com/biomejs/biome/releases/tag/%40biomejs%2Fbiome%402.6.6)
- [Biome 2.6.5 release notes](https://github.com/biomejs/biome/releases/tag/%40biomejs%2Fbiome%402.6.5)

- [tsrs CLI usage](https://github.com/oxc-project/tsrs/blob/main/docs/USAGE.md)
- [tsrs compatibility and platform support](https://github.com/oxc-project/tsrs/blob/main/docs/COMPATIBILITY.md)
- [Ultracite 8.1 release notes](https://github.com/haydenbleasel/ultracite/pull/857)
- [Ultracite upgrade guide](https://www.ultracite.ai/docs/upgrade)
- [Biome 2.6.4 release notes](https://github.com/biomejs/biome/releases/tag/%40biomejs%2Fbiome%402.6.4)
- [Biome 2.6.3 release notes](https://biomejs.dev/internals/changelog/version/2-6-3/)
- [Oxfmt Astro configuration](https://www.ultracite.ai/docs/configuration#formatting-astro-files-oxfmt)
- [Oxlint release notes](https://github.com/oxc-project/oxc/releases/tag/oxlint_v1.92.0)
- [Type-aware Oxlint](https://oxc.rs/docs/guide/usage/linter/type-aware)
- [Biome conflicting-rule guidance](https://biomejs.dev/guides/upgrade-to-biome-v2/)
- [Blume release notes](https://github.com/haydenbleasel/blume/releases/tag/blume%402.2.7)
- [React Scan installation](https://github.com/aidenybai/react-scan#manual-installation)
