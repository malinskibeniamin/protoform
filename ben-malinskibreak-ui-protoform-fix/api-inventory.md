# Base UI API parity verification

Candidate: 443ec1638a633ee438554caad7c01b8418d9c652. Base: 23958c736a2751c8fe4b53baa41895055754d29e. Same branch/PR114, one commit. Source inputs pin shadcn/ui ba1503c64472b82256d9de95e2e62c5901a38e8b; source-copy MIT notices preserved.

## Scope

63 official Base UI primitive modules, 388 exports, plus Date Picker/Data Table/Typography composition guides =66 catalog entries. All official public prop objects accepted by compiler contracts derived independently from upstream source, with representative generic inference probes in installed consumers. Not byte-identical styling; not future upstream, other primitive stacks, AI Elements, application blocks or optional Shiki hooks. No API-follow-up dependency added.

## Changed surfaces and coverage

- Standard Button/Badge render APIs and variant aliases; legacy convenience APIs retained. Native disabled/loading, form type, caller attributes, callback classes/styles. Public integration tests plus API example, catalog and original form snapshots.
- Full Combobox composition/chips/clear/filter and generic Select values/details/cancellation. Installed-consumer compilation, public integration tests and live selection/cancel/recovery.
- ToggleGroup array and legacy selection; Slider numeric/array callbacks and repeated controlled keyboard focus; custom Switch keyboard behavior; Calendar locale. Public controls tests, native E2E, catalog examples and real-browser/manual use.
- Native DOM events/refs separated from Motion-only props; standard callback details forwarded; cancelable/controlled disclosures preserve state. Component tests, E2E, all catalog and original form states replayed.
- ChartStyle helper: multiple/late/retargeted targets, ownership-tracked color properties, caller inline precedence, cleanup and light/dark selectors. Real-browser regressions and chart-color example.
- AlertAction, Popover sections and line tabs. Mobile alert overlap reproduced and fixed at source; semantic popup description and keyboard close tested. New screenshots cover API composition at320/1000px, light/dark, all three engines.
- Existing Code Block/Trace and seven-fix/CodeMirror surfaces: rechecked with their original screenshots. No old baselines, masks, pixel tolerances or timing budgets updated.

## Browser reproduction

Use Node26/Bun1.4.3, locked dependencies and installed Chromium/Firefox/WebKit. Current native Rstest has Chromium-only Playwright fixtures; supplemental Firefox/WebKit use the direct installed Playwright driver, explicitly verify the engine and create isolated contexts. The unmodified repository matchScreenshot assertion remains the screenshot oracle. No old @playwright/test runner is used.

`bun run test:e2e --config .context/shadcn-api/visual.config.ts --reporters verbose`

Specifications/config and reviewed PNG references are published with this receipt. Native E2E supplies fresh production build, fixture API and cleanup. 60 catalog +18 Code Block/Trace +48 resilience/CodeMirror +12 new API cases. Twelve new API PNG references were created explicitly after the missing-reference run and visual inspection. Existing126 behavioral cases retain all138 original PNG references (60+30+48).

The two very tall Chromium320px Basics captures required viewport expansion to2801px *for capture only*, after the normal320x1000 interaction checks. Native locator capture otherwise alternated16 antialiased corner pixels while repeatedly resizing a screenshot taller than its viewport. Diagnostic captures proved zero differing pixels against the original reference at the stable expanded height. No baseline changed or region masked. Other viewport heights remain the original matched sizes.

Harness diagnosis logs are retained: initial attempts incorrectly treated a top-level browserName fixture as an engine selector; those are invalid cross-browser evidence, not product regressions. A second attempt exposed the native fixture's Chromium-only support. Final specifications use real Firefox/WebKit contexts; Axe-required secondary contexts are supported. Only the final normal run is a completion receipt.

## Real UI and media

API example: /docs/blume-examples/registry/base-nova/protoform/demo/ui/shadcn-api. Manual use: render button, selection, cancel/recover disclosure, repeated slider keys, named popup/Escape, then resize to320px and inspect readable actions. No page errors; settled document width320. Motion can temporarily exceed the narrow viewport while resizing; width returns to320 when the transition settles.

New-view comparison: actual current base23958c7 reconstructed from git archive, own frozen dependencies/build. Its proposed API demo route returns an actual404; the base video starts in the existing registry docs and navigates to that missing route. Candidate video performs live button/selection/disclosure interactions. This is not a pre-existing matched identical feature.

Existing catalog, CodeMirror and Code Block/Trace videos remain historical evidence for their stated revisions; final screenshot replay and current CI cover the current candidate. No trace/network instrumentation is added; sample actions are local. Clipboard failures are exercised at the browser boundary, not the system clipboard.

## Verification limits

Compiler contracts do not exhaust every possible interaction. Browser coverage is representative, not an arbitrary-props or accessibility guarantee. Existing private Buf audit limitation, two documented dependency audit exceptions and local OpenAPI example warning remain unchanged. A local cold-start raw React SSR budget initially measured164ms against the unchanged100ms threshold under concurrent analysis; the same unmodified full conformance suite passed its immediate replay. No benchmark thresholds, retries, permissions or test assertions were relaxed.

Independent human review is not claimed. Hosted protections are read separately; no self-approval, owner substitution or merge. Revert the single commit and rebuild copied registry source to undo the code change.

Historical6a type-only follow-up: uncontrolled legacy ToggleGroup string callbacks require type=single, a string value, or a string defaultValue. A negative compiler assertion failed before narrowing and passes after. The full local ci:gate and138-case visual replay ran on runtime revision6e3f5af; that6a candidate differed only by this type-only migration guard, its compiler test, and documentation. type-only-runtime-proof.json verifies identical emitted JavaScript. Final source/test/docs types, focused toggle tests and native E2E were replayed; hosted full gates are bound to the final head. Final manual capture/video uses the final candidate.

Latest tooling rebase: main23958c7 migrated the checker to TSRS0.18.0-ts7.1.0-dev.20260929. All UI/API source and runtime dependencies remain identical (tsrs-rebase-proof.json). Fresh TSRS source/test/docs checks pass; the deliberately invalid type assertion fails with TS2344. All138 native visual cases and10 acceptance cases pass on443ec16; baseline23958c7 and candidate443ec16 media were recaptured. Previous local ci:gate6e3 and hosted6a gates remain historical receipts, not new-head evidence. Current hosted CI/security/exhaustive runs are bound to443ec16.
