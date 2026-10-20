# Test runner migration verification

Protoform uses Bun for pure units, Happy DOM for simulated rendering, and Rstest
for integrations and real Chromium journeys. This record distinguishes those
boundaries and preserves the existing application and installed-consumer coverage.
Firefox and WebKit were intentionally removed from the automated matrix.

## Application and test inventory

Baseline: `a5333a28ec8b31e1eeb324539f7d95584ba21c04`.
There is one root package, not a workspace of independently managed apps.

| Surface | Baseline | Migrated boundary |
| --- | --- | --- |
| Registry/library, domain service and pure tooling policies | Rstest Node units mixed with process/network tests | Bun: 36 existing files, 125 cases; one additional PNG comparator case |
| Repository tools, registry artifacts and Connect HTTP server | Mixed into the same 56-file, 246-case unit command | Rstest Node: 20 existing process/network/artifact files renamed without removing cases |
| Docs components, example forms, registry controls and hooks | Rstest Happy DOM: 73 files, 260 cases | Rstest Happy DOM; also recovers the previously excluded hook-rendering file |
| Schema/CEL/Protobuf/form-adapter conformance | Rstest Happy DOM: 22 files, 175 cases | Same separate conformance gate, including its existing integration overlap |
| Native component interaction and large-form budgets | Rstest Chromium: 5 files, 10 cases | Same cases plus native media-query/scroll regression coverage |
| Built Blume docs/demo application and running Connect example server | Playwright Test: 229 cases per browser engine | Rstest Playwright integration: all 229 Chromium cases |
| Two installed-consumer applications | Playwright Test: 8 desktop/mobile cases | Same real Vite apps, viewports, locale, timezone, screenshots and cases through Rstest |
| Additional source-copy consumer fixtures | Registry build/install/type checks | Same consumer smoke entrypoint and type checks |

Classification follows exercised behavior. Pure `.ts` files use Bun; subprocess,
filesystem-artifact and network contracts use Node integration. The hook-rendering
`.test.ts` explicitly belongs to the DOM project. Conformance remains a distinct
cross-module contract suite, not a filename-based unit bucket.

## Configuration and compatibility

```text
bunfig.toml                 -> Bun pure-unit discovery and isolation
rstest.config.ts            -> Node + Happy DOM integration projects
rstest.node.config.ts       -> real process/network/artifact contracts
rstest.dom.config.ts        -> Happy DOM + React Compiler + Testing Library
rstest.conformance.config.ts -> schema and adapter conformance
rstest.browser.config.ts    -> Chromium component browser mode
rstest.e2e.config.ts        -> running docs and Connect application
rstest.host-registry.config.ts -> desktop/mobile installed consumers
rstest.canary.config.ts     -> native E2E compatibility regression cases
```

- Rstest packages are pinned to `0.12.4`. Happy DOM remains `21.0.3`; this baseline
  already used Happy DOM and had no direct JSDOM or Vitest dependency.
- Direct `@playwright/test` imports/dependency/configurations are removed.
  `playwright@1.64.1` remains as the browser automation engine, not the test runner.
- Shared Testing Library matchers and AutoForm test utilities remain. Simulated media,
  scrolling, storage and resize shims stay confined to Happy DOM, not native browsers.
  Happy DOM disables implicit CSS/iframe loading while retaining explicit real HTTP fetch.
- `scripts/run-tests.mjs` runs the actual Rstest CLI, forwards failures/signals, and owns
  application readiness and bounded process-group cleanup. It rejects healthy existing
  listeners. Consumer ports can be overridden without reusing another workspace's app.
- Native keyboard chords, trusted drag events, runtime viewport changes, and live DOM
  access use public Playwright APIs. No maintained runner fork or patch is introduced.
  This repository has no Ivya consumers to remove.
- PNG comparison uses `pixelmatch` and `pngjs`: threshold `0.2`, antialias exclusion,
  zero differing pixels, identical dimensions, CSS scale, disabled animations, hidden
  carets and consecutive stable captures. Existing PNG paths and bytes are unchanged.
  Updates require an explicit command. Missing or mismatched references fail.
- Accessible descriptions use `dom-accessibility-api` inside the actual browser DOM.
  Accessible-name role queries retain native Playwright locator semantics.

## CI, caches and entrypoints

`ci:gate` retains the registry, security, conformance, types, lint and browser gates,
and adds compatibility canaries. The PR docs job runs the complete Chromium E2E
suite rather than the previous subset. Scheduled quality and release gates retain
all other steps. No CI job is disabled.

No explicit legacy runner cache action existed. Rstest's persistent build cache remains
under `node_modules`; Rsdoctor still disables it when profiling. New runtime failure
images and traces use ignored `.rstest/` artifacts, uploaded on PR job failures.
No application source or shared registry dependency is removed.

```bash
bun install --frozen-lockfile
bun run lint:fix
bun run typecheck
bun run test:ci
bun run ci:gate
bun run quality:gate
bun run test:rsdoctor dom examples/catalog/capability-demo.test.tsx
bun run rsdoctor:agent chunks list --data-file artifacts/rsdoctor/dom/rsdoctor-data.json
```

New compatibility contracts cover native interactions, live DOM/viewport changes,
accessible descriptions, PNG mismatch/missing/update behavior, real CLI behavior/hook/
collection failures, interruption, and server startup/shutdown failures. The shutdown
regression reproduced a descendant server surviving its parent's exit before the repair.

## Limits and remaining legacy usage

- No direct legacy runner usage remains. Negative policy assertions still mention removed
  runners. Rstest and Playwright distributions can contain Vitest-derived or Playwright
  Test implementation internals; this repository does not import them.
- The optional Protobuf-ES v1 bridge remains excluded from root tests and types, as before.
  Its consumer must supply v1; this root uses v2. This is an existing verification gap,
  not newly skipped migration coverage.
- Linux screenshot verification comes from hosted CI; local macOS results alone cannot
  certify platform-specific Linux baselines. No baseline PNG was regenerated.
- Release-gate verification does not publish a release, create a tag, or test production
  provenance/upload operations. This migration does not authorize those operations.

## Measured runner cost

Measured on 2026-10-20: Apple M5 Max, arm64, macOS 27.0.1, Bun 1.4.2,
Node 26.12.0, Playwright/Chromium 1.64.1. Each runner received three counted
warmups and five alternating measured pairs, with `CI=1 TZ=UTC`.
No selected case failed, skipped, or retried. Reporter-specific parameter display
and test-directory prefixes were normalized before comparing case identities.
[Measured samples and source hashes](test-runner-benchmarks.json) retain the evidence.

| Cohort | Before median (range), seconds | After median (range), seconds | Observed change |
| --- | --- | --- | --- |
| Six provider files, 26 pure unit cases, two workers | 1.229 (0.901–1.597) | 0.146 (0.113–0.216) | 1.083 seconds less, 88.1% reduction |
| Two real-app search/keyboard journeys, one worker | 1.951 (1.708–2.151) | 2.289 (1.942–6.363) | 0.337 seconds more, 17.3% increase |

The unit result exceeds the predeclared 10% worthwhile reduction. The three-file,
46-case DOM cohort showed no meaningful change within its observed variability.
The E2E cohort is not a speedup: Rstest includes compilation startup, and candidate
samples showed substantial variance. This migration claims a faster pure-unit
loop, not faster E2E or CI. No full-suite performance inference follows from these cohorts.

The machine also hosted unrelated workloads; CPU load was not controlled. These
are local, warm-cache CLI wall times, including runner and reporter startup. They
are not cold installs, Linux timings, confidence intervals, or production measurements.
Both E2E runners used the same already-built application, Chromium device descriptor,
and port `55535`; common application startup was excluded. The E2E cohort uses search
and Escape/scroll restoration, not screenshot comparison or Connect submission.
The port and second-journey amendment preceded E2E measurement because unrelated
Docker listeners occupied the normal application ports.

Reproduce the unit cohort in independent frozen installs of the baseline and candidate:

```bash
files=(
  registry/base-nova/protoform/lib/protobuf-provider/field-mask.test.ts
  registry/base-nova/protoform/lib/protobuf-provider/source-preservation.test.ts
  registry/base-nova/protoform/lib/protobuf-provider/mutation-request.test.ts
  registry/base-nova/protoform/lib/protobuf-provider/conversion-validation.test.ts
  registry/base-nova/protoform/lib/protobuf-provider/aip-client-workflow.test.ts
  registry/base-nova/protoform/lib/protobuf-provider/method-workflow.test.ts
)
# Baseline checkout
CI=1 TZ=UTC node scripts/run-tests.mjs unit "${files[@]}" --pool.maxWorkers=2 --reporters=json
# Candidate checkout
CI=1 TZ=UTC bun test --parallel=2 "${files[@]}" --reporter=junit --reporter-outfile=unit-results.xml
```

DOM cohort: `examples/catalog/capability-demo.test.tsx`,
`examples/form-libraries/form-libraries.test.tsx`, and
`registry/base-nova/protoform/components/auto-form/__tests__/proto-forms.test.tsx`.
Use the baseline `integration` and candidate `dom` CLI projects, JSON reporters,
and `--pool.maxWorkers=2` for both.

E2E cohort: `e2e/docs-contract.spec.ts`, filtered to
`finds identifiers that appear inside code blocks` and
`search restores the page scroll state (default)`. Baseline uses the Playwright Test
CLI with only Chromium, one worker, no retries, no `webServer`, and JSON reporting.
Candidate uses the actual Rstest CLI with the E2E config, one worker, JSON reporting,
and the equivalent name filter. Override both context base URLs to the same static
preview on `55535`; preserve the existing Desktop Chrome descriptor.
