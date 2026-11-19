# Landmines and Ultracite 8.3 migration

Baseline: `08be8a9054a4d1f0217f7c752e15868ca62e9090` (Formisch support). This is a tooling and
test cleanup, not a protobuf or product feature change.

## Which evidence stayed

- Real form submissions, including provider rejection and HTTP failure/recovery, public callbacks,
  protobuf edit preservation, and dirty-mask behavior. Use strict MSW only where the test controls a
  transport response; example Connect tests exercise the real local server.
- Chromium owns real layout, focus, clipboard, print and fullscreen behavior. E2E keeps actual
  image comparisons, keyboard navigation, published redirect contracts, interactive-form journeys,
  permission denial and recovery. A docs build is not a substitute for these checks.
- Conformance checks Protoform's CEL and protobuf behavior, public engine adapters and malformed
  input. The performance contract stays in the native Chromium form suite.
- All 388 pinned shadcn compiler assertions and the protobuf form-value type assertions run as
  compiler fixtures. Removing their 75 no-op runtime wrappers is separate from behavior cuts.
- Real process startup/cleanup, including descendant shutdown, remains integration coverage.
  Darwin permission classification now checks exited, retryable and permanently denied groups
  from group-state observations, without replacing `process.kill`.

## What was removed or consolidated

- Built-docs checks dropped render-only captures with no comparator, repetitive redirected
  navigation and a copied full sidebar inventory. Platform/CDN redirect artifacts still cover
  every shipped route; Chromium exercises an anchored redirect per hub. The live sidebar checks
  cover section ordering, keyboard interaction, selected state and representative navigation.
  The built docs already verify the selected demo's code tab reads its own source and the shared
  AutoForm implementation; there is no parallel component replay of that same contract.
- Kept Protoform behavior instead of upstream-only Protobuf text/decoder calls, a synthetic timing
  matrix also covered by Chromium, and duplicate malformed-response cross-products. Every hostile
  provider response shape remains covered, and each engine exercises failure and successful retry.
- Folded duplicate example submissions into error-and-retry journeys and removed assertions that
  merely inventory API methods. Type checks and real calls carry those contracts.
- Retired forced QuickJS startup/allocator failures that had no deterministic public trigger
  without substituting the factory or clock. Real QuickJS tests keep the memory limit, guest
  interruption, error handling and isolation. This leaves the two forced failure paths without
  equivalent deterministic coverage.
- Renaming `.spec.ts`, moving out of `__tests__`, and splitting files are not removals of behavior.
  Screenshot reference paths follow the renamed tests; no reference pixel was changed.

## Enforcement and verification

Installed with Bun 1.4.4 and Node 26.13.1. Ultracite is pinned to 8.3.1, Landmines to 0.1.1,
and MSW to 2.14.6. JSDOM 31.0.1 runs the limited DOM interop cases; the rest of DOM/conformance
stay on Happy DOM and Chromium owns browser capabilities. No simulated global replaces Fetch,
the animation API, storage, scrolling, observers, or media queries in shared setup.

A disposable negative fixture through the actual repository Oxlint configuration reported each of
the ten Landmines rule IDs at error severity. A valid, colocated, explicitly exported fixture was
accepted by the full configuration. The fixtures were removed. See the
[rule inventory and detection limits](../ui-toolchain.md#landmines-and-ultracite-83) for what CI can
and cannot infer. No Landmines allowlist or new lint suppression was introduced.

## Test accounting and artifact checks

These are counts reported by each runner, not a count of deleted contracts. Browser moves and
the removal of repeated demo execution between integration and conformance affect the totals.

| Runner                     |                                       Baseline cases | Migration cases |
| -------------------------- | ---------------------------------------------------: | --------------: |
| Bun unit                   |                                                  335 |             254 |
| Rstest integration         |                                                  395 |             305 |
| Conformance                |                                                  193 |             170 |
| Docs E2E                   | 259 (258 passed, one stale sidebar assertion failed) |             139 |
| Chromium component browser |                              Not separately recorded |              57 |

The independent discovery audit assigned all 202 in-scope runtime test files, found no
cross-suite duplication or dangling active CLI paths, and checked the exact docs and integration
smoke selectors. The five compiler-only fixtures are separate. The pre-existing Protobuf-ES v1
bridge exclusion is unchanged. File inventory (including that bridge): 206 legacy
`.test`/`.spec` files at baseline, 203 after the migration. Renamed paths count as moves.

- All 67 screenshot PNGs are byte-identical to the baseline. The registry rebuild produced 460
  embedded source entries with zero byte mismatches; all 44 readiness evidence paths exist.
- A disposable manifest entry verified that the demo generator deletes an obsolete wrapper
  without touching its colocated test. A second lint fixture verified the three restored Ultracite
  checks (named capture groups, deprecated API use, and captured void values).
- An isolated archived baseline build reproduced eight Formisch docs audit warnings: description
  width and orphan-page findings across all four locales. Localized descriptions and related
  guide links fix both findings under the existing thresholds; Blume adopted all six edited
  translations without running a translation agent.
