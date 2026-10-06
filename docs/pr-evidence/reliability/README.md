# Reliability evidence

Original capture comparison: `origin/main` at `2c27f091950cb77d315e0ffc1b5a59e5fe306e14` against this PR.
Fixtures contain synthetic data only. Screenshots and the flow recording use identical source,
neutral theme, Chromium, and viewport for each base/candidate pair.

Rebased onto `a179fc14356cc98dce69402ae62c406107b0bf5b` on October 6, 2026.
The captured controls only inherited formatting, comment removal, and equivalent return normalization.
The registry was rebuilt and freshly installed, and all eight installed-consumer browser/visual tests
passed normally without snapshot updates. The original captures remain unchanged; they were not recaptured.
Direct recovery, pagination, reload, and v7/v8 native edit/reset journeys also passed with no page errors.

| Surface / state | Evidence | Automated coverage |
| --- | --- | --- |
| Two same-field errors and selection-control error descriptions | `before/after-desktop.png`, `before/after-mobile.png`, `before-after.gif` | Installed reliability consumer, desktop and mobile |
| Selection absent from page one, then loaded on page two | `before/after-options.png` | Installed reliability consumer plus provider integration tests |
| Native v7/v8 timestamp defaults | `native-before/after-desktop.png`, `native-before/after-mobile.png` | Native-hook browser tests and installed-consumer screenshots |
| Native edit and reset retain only untouched precision | Installed `native-defaults-v7/v8.png` baselines under `scripts/__screenshots__` | Edit, inspect, reset, inspect, reload in both hooks and viewports |
| Existing host-owned primitives, missing-input recovery | Existing host screenshots | Installed host consumer, desktop and mobile |
| Docs and shared controls | Existing docs screenshots | Chromium, Firefox, WebKit E2E suite |
| 50/200/500-field form | Real AutoForm fixture | Browser render, edit, submit and step budgets; no speedup claimed |

Reliability captures: 1280×800 / 390×844. Native captures: 1100×800 / 390×844.
Native inputs display local time; synthetic source instant is `2026-10-03T12:00:37.123456789Z`.

Direct use/abuse/replay covered invalid submission, recovery, option loading and search,
Escape, Tab/Shift+Tab, native date-time keyboard edits, reset, repeated submission and reload.
The 500-field consumer submitted edits to the first and last fields repeatedly. Reliability and
native fixtures had no page errors. The host negative test intentionally removes a required
component and verifies the error boundary's recovery.

Visual snapshots were inspected, only intended updates accepted, and the installed browser suite
rerun normally. Initial nanosecond defaults produced blank native inputs; regression tests now
cover millisecond-compatible display, lossless untouched output, explicit nanosecond edits,
collection source matching, and no rounding into the next second.

Local consumer installation used port 48742 instead of 48741 because another workspace owned
48741. Only the server/origin port literals changed; assertions were unchanged.
The post-rebase fresh installation used the normal port 48741 with no script overrides.

The full quality gate is **not green**: React Doctor flags the existing selection-clear effect
(`no-pass-live-state-to-parent`); its latest full scan completed maintainability analysis. No suppression
or weakening of that gate was added. See the PR for security exceptions and dependency review risks.
