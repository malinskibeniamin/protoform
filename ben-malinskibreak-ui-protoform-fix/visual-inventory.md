# UI resilience review evidence

Base: a5333a28ec8b31e1eeb324539f7d95584ba21c04. Candidate: ed7d0121c385a7f86cbd238a3ce500a8c03d8b73.
Captures/video originally labeled eb8c7c6 use identical product source; ed7d012 changes only the lazy-demo integration test. Screenshot overlays name the final equivalent candidate. No fixture/theme/state changes were used to manufacture differences.

## Surface and state inventory

| Changed surface / affected consumers | Test and replay | Matched before/after capture |
|---|---|---|
| JSONField: Object, Scalar, List, Any; immediate valid publish; malformed draft; format/mode switch; external reset | json-field/index.test.tsx; auto-form/__tests__/json-values.test.tsx; e2e/form-resilience.spec.ts; supplemental invalid/zero cases | invalid-json, zero-value; real typing/submission video |
| Structured JSON string/number/boolean/enum/custom/array paths; accessible IDs, labels and remove controls | JSONField accessibility integration cases, dynamic JSON live replay | structured-labels: no visible UI change; captures.json records empty IDs/ARIA -> named inputs |
| Array/map collection root errors and correction; field/group ARIA | accessible-errors.test.tsx; supplemental root-error/recovery case | collection-error |
| Form/FieldWrapper/ObjectWrapper/ArrayElementWrapper; all AutoForms inherit container breakpoints and reduced narrow padding | committed cross-browser resilience tests; supplemental 320/390 plus desktop 1280 with 320 form; installed consumer suite | nested-320, nested-390, nested-720, nested-1280 |
| KeyValueField; string maps plus compact bool/numeric map rows; delete/add/error placement | existing map/validation integration; bool map submit replay; supplemental bool map 320/1280 | nested metadata and maps-320/maps-1280 |
| CopyButton outline text; JSONField and AutoForm mode-shell payload viewer/editor | contrast >=4.5 plus axe color-contrast, keyboard focus in light/dark; existing copy/mode-shell tests | copy-light/copy-dark. Same outline component/token in payload viewer; other variants unchanged. No icon-only direct caller found. |
| Alert/AlertDescription: server-error, complex, learning, bookstore, form-adapter and catalog feedback | 320px profile + environment success; full catalog/error integration and E2E | profile-success/environment-success. Short prose unchanged when it fits; preformatted content retains its own scroll behavior. |
| Source-copy registry consumers | registry build/smoke/installed host tests; 110 source files synchronized | same shared implementations; no separately authored registry UI |
| Native date CI baseline selection, not application behavior | installed-consumer native precision/payload + screenshot assertions, macOS 26/27 | comparison.png diagram; four old 27 baselines byte-identical renames; four 26 baselines from reviewed CI actuals |

At 720px nested CIDR full-view captures are byte-identical; at 1280px its width is unchanged. These are intentional unchanged states, not missing deltas. Desktop metadata still stacks because the actual key/value container is narrow. Empty collections and loading/disabled states keep existing behavior; validation is newly visible after error, and recovery is tested. Loading-demo CI test now awaits real loaded controls rather than only spinner disappearance.

## Visual regression

Normal command (no update):
`bunx --no-install playwright test --config .context/break-ui/pr-media/playwright.visual.config.ts`

Result: **33 tests passed, Chromium/Firefox/WebKit, 17.3s**. 33 PNG expectations. All three engine review sheets and matched pairs visually inspected. Missing-baseline failures established before generating new supplemental baselines; no masks, tolerances or existing assertions weakened. This supplemental reviewer suite is published evidence, not a claimed new committed CI gate. Committed resilience specs remain in normal E2E.

Files: [spec](form-resilience.visual.spec.ts), [config](playwright.visual.config.ts), [run log](visual-final.log), [measurements](captures.json), [capture script](capture.mjs). Published files are flattened: restore spec/config to the command directory and PNG files beside them in `form-resilience.visual.spec.ts-snapshots/`. Serve a fresh candidate build on port 55120 and stateless fixture API on 55012 before replay. Platform-specific supplemental PNGs were captured on macOS.

[Chromium contact sheet](visual-review-chromium.png), [Firefox](visual-review-firefox.png), [WebKit](visual-review-webkit.png).
Full-view labeled pairs share the names above with `-before.png` and `-after.png`. `focus-*` files crop only the named control/result and retain the full-view files for context.

## Direct measurements / limits

Identical fixtures, Chromium DPR1, en-US, UTC, light (except explicit dark), same routes/viewport. At 320px: nested CIDR 50 -> 218px (+168px, +336%); metadata key/value 22 -> 218px (+196px, +891%); profile document width 438 -> 320; environment 400 -> 320. Malformed draft remains unchanged; success count 1 -> 0 and aria-invalid absent -> true. Zero displays `{}` -> `0` while protobuf numberValue remains 0. These are layout/correctness measurements, not runtime speed claims.

Dogfood PASS: actual catalog/docs entrypoints, immediate valid submit, malformed JSON/recovery, falsy values, mode switch/reset, Unicode map values, collection error/recovery, nested editing and long success IDs. No browser console errors in capture replay. Existing local API OpenAPI warning and two documented dependency audit exceptions remain unchanged.

Limits: 320/390 mobile, 720/1280 desktop and narrow desktop container; equivalent reflow coverage, not native browser-zoom validation. Not exhaustive RTL, assistive-technology or arbitrary large-data coverage. Publication readback verifies media URLs, not universal playback/access.
