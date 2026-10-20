# Bundled UI evidence

Baseline f5bc6bc; rebased UI f9fc2a8 on main af64c55. Hono-only lockfile follow-up does not change these UI sources.

| Surface | States | Proof |
|---|---|---|
| New bundled Code Block | plain/numbered, blank line, wrapping, diff/highlighted line, 320px/1000px, light/dark | 24 PNG baselines, three browser engines |
| Copy | exact source success, denial, retry, no false success, filename retained on mobile error | six error PNGs, component tests, E2E and direct dogfood |
| Trace | pending, error, keyboard expand/collapse, output composed outside trigger | desktop/mobile open/closed PNGs; three-engine E2E and dogfood |
| Existing JSON/form surfaces | all original seven fixes + CodeMirror squiggle/diagnostics, empty draft, zero, false/null, reset/mode guard, mobile/contrast | 48 unchanged visual cases pass after rebase; 30 focused native E2E pass |
| Custom-option failure | failed creation persists across local clear/value echo, successful retry clears it | installed consumer assertion; reviewed desktop/mobile label-font snapshot updates |

New-view comparison is explicit: old head had no bundled showcase. Before footage navigates from existing Registry install docs to the proposed /examples/ui path and records a real 404. New footage operates the final /registry/base-nova/protoform/demo/ui/code-and-trace showcase (moved to the repository's existing default-export demo contract during rebase). It is not a matched pre-existing feature flow.

All 30 new PNG expectations were inspected and passed normally without update flags (18 tests, 3 engines). The two committed custom-option expectations only change the text-label typography to the existing Label component; the error remains visible. No tolerances or masks were loosened.

Replay: copy bundled-ui.visual.spec.ts and playwright.visual.config.ts into one folder, restore bundled-*.png under bundled-ui.visual.spec.ts-snapshots/, serve the production docs on port 55130, then run Playwright with that config. Logs replace local filesystem roots with placeholders. Read the root repository package scripts for native assertions.

Limits: static presentation traces, not instrumentation. Optional Shiki hook is not bundled; React token children are supported. Not exhaustive screen-reader, RTL, native zoom or arbitrary-size JSON coverage. Clipboard browser tests mock only the platform clipboard boundary; direct real-flow video exercises the available browser clipboard.
