# CodeMirror JSON diagnostics: verification inventory

Candidate: `27c29df304897c5db8587e6aab1b943b94e290bd`.
PR base: `a5333a28ec8b31e1eeb324539f7d95584ba21c04`.
Follow-up comparison: actual previous PR head `ed7d0121c385a7f86cbd238a3ce500a8c03d8b73`.

## Outcome and reach

Quality of life for form authors: invalid JSON now identifies the broken token instead of only reporting a parser error. Shared JSONField raw editors use CodeMirror 6: line numbers, JSON highlighting, wrapping, folding, undo, red wavy diagnostics, gutter markers and hover text. F8 opens diagnostics; Tab leaves the editor. Object, scalar, list, Any raw mode and max-depth fallback use the same implementation. The separate whole-payload mode-shell textarea is not migrated.

Native JSON.parse remains the synchronous value boundary. Invalid drafts stay visible and block submission through a native-validation proxy; correction publishes immediately. Hidden proxy is excluded from the accessibility tree/tab sequence and redirects invalid/focus events to the visible CodeMirror textbox. External resets, mode-switch protection and false/0/null remain covered.

## Surface / state coverage

| Surface | Behavior exercised | Evidence |
|---|---|---|
| Object raw JSON | Valid edit, invalid token, inline hover, submit blocked, retained draft, correction + submit | Committed cross-browser resilience test; cm-invalid pair; native moving video |
| All JSONField raw editors | Object/scalar/list rendering, line numbers; Any structured and raw-mode shared path | 10 focused browser tests; editors-after full view |
| Empty / malformed / EOF | Error text, aria-invalid/description, native constraint, gutter diagnostic, last-character range | Browser contract tests; empty and invalid visual baselines |
| Keyboard | F8 diagnostic panel; Escape; Tab leaves editor without focus trap | Supplemental visual test for each engine |
| Reset / mode | External reset replaces invalid draft; nested invalid draft cannot be discarded by switching modes | index.browser.test.tsx |
| Falsy values | false, 0 and null preserved through form + protobuf submit | json-values.browser.test.tsx; zero screenshot |
| Themes | Token-based editor, diagnostics, tooltip and CopyButton focus in light/dark | Reviewed engine contact sheets and paired copy captures |
| Narrow viewport | 320px long JSON wraps without document overflow | 3-engine supplemental screenshots |
| Previous seven fixes | Collection errors/recovery, nested mobile/container spacing, bool/string maps, long success IDs, copy contrast, accessible labels | Original evidence appendix + unchanged supplemental cases + normal resilience specs |
| Source-copy consumer | Registered module + runtime dependencies installed; emitted source typechecks | consumer-delivery.log; normal hosted installed-consumer browser suite |

## Visual review

Normal, no-update command:
`bunx playwright test --config=.context/codemirror/playwright.visual.config.ts`

**48 passed** on the final source/build. Chromium, Firefox, WebKit, macOS, DPR1, en-US, UTC. Viewports include 320/390 mobile, 720/1280 desktop and narrow desktop form containers. Explicit light/dark cases. All 48 PNG expectations published; restore them into `form-resilience.visual.spec.ts-snapshots/` next to spec/config when replaying the flattened published files. Preview candidate production build on 55120 and fixture API on 55012.

Baseline changes: 15 new CodeMirror cases plus 6 existing JSON screenshots intentionally changed; 27 other cases unchanged. First normal run exposed missing/changed snapshots. Reviewed before/after/diffs; fixed an overly saturated active-line color and tooltip clipping at source. Reran without updates successfully. No masks, thresholds or assertions weakened. All three changed-state engine contact sheets inspected; final Chromium sheet and exact invalid before/after inspected again after final build.

Loading-only final refactor uses React.lazy + Suspense and module-scoped asynchronous imports; final build, Doctor strict, types, focused real-browser tests, consumer installation and this normal screenshot suite pass. Final capture replay reports no page errors, invalid submit blocked and scalar zero preserved. Previous full integration/browser results are supplemented by exact-head hosted CI, not represented as new local runs.

## Evidence provenance

- `cm-invalid-before` is the actual previous PR head ed7d012; `cm-invalid-after` is 27c29df, same malformed document, browser and framing. After additionally shows the hover diagnostic.
- `focus-invalid-json`, `focus-zero-value`, `copy-light/dark` compare actual PR base captures with fresh 27c29df captures; full-view after screenshots are included.
- Video: actual matched typing/submission takes, ed7d012 left and candidate right. Both insert the same malformed fragment into the existing theme string and block submit; only candidate has squiggles/gutter diagnostics. It does not claim to replace the entire document. The separate E2E test asserts exact `tru` token localization.
- Unchanged collection/nested/map/success screenshots remain pinned in the original appendix, labeled with their actual capture revision. Their equivalence to 27c29df is checked by the 27 unchanged passing screenshot cases; they are not represented as newly captured.
- Original layout measurements remain applicable: nested CIDR 50 -> 218px; metadata key/value 22 -> 218px at 320px. Correctness/layout evidence, not speed evidence.

## Risk / limits

Riskiest boundary: asynchronous editor loading plus hidden native-validation proxy. Preserve synchronous parse and submit constraints; no debounce for value publication (only visual lint delay). Packages replace Prism/react-simple-code-editor; no schema or stored-data migration. Revert the single feature commit and rebuild installed registry copies.

Not exhaustive assistive-technology, native zoom, RTL or arbitrary large JSON coverage. No runtime speed claim. Browser accessibility assertions do not certify all screen readers. Native video URL/body readback proves publication, not universal playback. Existing two audit exceptions and private Buf audit limitation remain visible. Human code-owner approval remains unresolved; automation is not approval.
