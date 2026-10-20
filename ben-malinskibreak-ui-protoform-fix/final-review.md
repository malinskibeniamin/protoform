# Exact-candidate inline review

Head: f5bc6bcae2887e5b74689b25439d05c7332d5817; base: a5333a28ec8b31e1eeb324539f7d95584ba21c04.

product: qol (declared) -- justified -- form authors; explicit user request; reachable shared raw JSON editor; before/after token-localization evidence.
lie-detector: truthful -- merge not proven -- Behavior observed; code-owner approval and hosted checks pending at review time.

Full source/dependency/test diff reviewed; generated registry inspected as synchronized output. No new P0/P1/P2 defect identified. Prior seven-fix review reused for unchanged hunks and replayed via current 48 visual cases. No ownership policy weakened. One coherent commit retained, no rebase needed (0 behind main).

Counterexamples checked: invalid draft immediately followed by submit cannot publish stale data; correction publishes synchronously; reset supersedes malformed draft; nested invalid draft cannot vanish on mode switch; falsy primitives retain values; tooltip not clipped; Tab does not trap focus. CM linter's native point coordinates are supplemented with syntax-tree error ranges so invalid tru token is actually underlined across engines. Empty document keeps visible marker + text instead of fabricating a nonempty range.

Tests moved to native browser runner because CodeMirror contenteditable selection is not modeled faithfully by happy-dom. Contracts retained, no removed assertions or mocks of editor behavior. RED was assertion failure on missing visible squiggle, not compile/setup failure. New E2E uses keyboard typing because Firefox Playwright fill had different contenteditable behavior. Final source passes lint, typecheck, build, Doctor strict, focused browser tests, consumer install, normal 48-case visuals and capture replay. Hosted status tracked in completion.json.

Residual limits: whole-payload shell not converted; arbitrary large JSON, native zoom, RTL, real screen readers untested. Async editor/module support verified in project/installed host, not every possible downstream bundler. Security exceptions unchanged. Strongest reason not to merge is lack of eligible independent CODEOWNER, not a code finding.

Final CI repair: retain the binding’s typing defer, assert reset via browser-native auto-wait with unchanged value/ARIA checks plus no callback echo. Trial synchronous adapter rejected after concrete Firefox/WebKit cursor regression; not present in final diff. Exact editor source equals reviewed 27c29df. Extended E2E correction preserves complete typed document and recovered submitted field, PASS in all three engines. Final browser 20 and integration 260 PASS.
