# UI quality toolchain

Run `bun run lint:fix` and `bun run type:check` before submitting changes. CI also runs component,
conformance, browser, registry-consumer and documentation tests.

## Reviewed versions (2026-10-20)

| Tool            | Version                     | Responsibility                                         |
| --------------- | --------------------------- | ------------------------------------------------------ |
| Bun             | 1.4.3                       | Package manager; pinned across workflows               |
| Blume           | 2.2.4                       | Astro/MDX checking, builds and audits                  |
| Ultracite       | 8.0.1                       | Shared conventions, latest stable at review            |
| Biome           | 2.5.15                      | General linting and source formatting                  |
| Oxlint          | 1.89.0                      | Additional syntax, import, promise and test checks     |
| oxlint-tsgolint | 7.0.2004                    | Type-aware linting and compiler diagnostics            |
| tsrs            | 0.18.0-ts7.1.0-dev.20260929 | Rust-based strict source and test checking             |
| Oxfmt           | 0.74.0                      | Markdown/YAML formatting, not a competing TS formatter |
| React Doctor    | 0.9.18                      | Full warning-blocking component/design audit           |
| React Scan      | 0.5.7                       | Interactive profiling: `bun run scan:react`            |

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

## Rule decisions and coverage

`lint:rules` compares installed Biome, Oxlint, shadcn and React Doctor catalogs with explicit decisions.
New or removed rules fail until reviewed. `.oxlintrc.jsonc` records all 871 Oxlint decisions,
including nursery rules. Duplicate conventions have one owner: Oxlint's Boolean-cast fixer, for
example, conflicts with Biome's strict mixed-union conditions.
`prefer-return-this-type` is not safe for generic builders: an intersection silently erased the
field registry's accumulated literal names. A compiler-contract regression protects that API.

Framework-specific checks, opposite conventions, manual-memoization requirements and reflective
generic APIs cannot all be enforced simultaneously. Inapplicable checks remain explicitly off.
Existing compatibility/false-positive file exemptions remain visible; `lint:exceptions` forbids new
or changed exemptions against `origin/main`. This upgrade adds no file-level exemption.

Ordinary lint/fix commands reject compiler, linter, formatter and React Doctor suppression comments.
The scanner parses comments, including those after interpolated templates, rather than rejecting
strings that merely document directives. Alternate/nested quality configs are rejected.

`lint:coverage` verifies actual Biome/Oxlint file discovery; `typecheck:coverage` verifies native
compiler programs, including tests and JavaScript. Only exact reviewed outputs in
`scripts/generated-sources.json` are exempt from source ownership. A new `gen/escape.ts` or
`escape_pb.ts` is not exempt. MDX uses Blume's parser/typechecker/build/audit, not Oxfmt's different grammar.

These checks prevent accidental bypasses, not malicious edits to the gates themselves. Protect
required CI checks and review policy changes at the repository-hosting layer.

## Upstream evidence

- [tsrs CLI usage](https://github.com/oxc-project/tsrs/blob/main/docs/USAGE.md)
- [tsrs compatibility and platform support](https://github.com/oxc-project/tsrs/blob/main/docs/COMPATIBILITY.md)
- [Oxlint release notes](https://github.com/oxc-project/oxc/releases/tag/oxlint_v1.89.0)
- [Type-aware Oxlint](https://oxc.rs/docs/guide/usage/linter/type-aware)
- [Biome conflicting-rule guidance](https://biomejs.dev/guides/upgrade-to-biome-v2/)
- [Blume release notes](https://github.com/haydenbleasel/blume/releases/tag/blume%402.2.4)
- [React Scan installation](https://github.com/aidenybai/react-scan#manual-installation)
