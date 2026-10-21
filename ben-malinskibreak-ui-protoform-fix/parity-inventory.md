# Full Base UI catalog — visual and consumer receipt

Final candidate 46d44aaf1a0bd2527692b1d8a092ca09b3047e46; UI capture revision3727730 (all rendering files identical; only the CI heap budget changed); PR base af64c5586288b2ae64f41f2004d43db936657b08. New-view comparison uses the actual previous published head ebf02da9290ac031e80771c6cb2c72c54784ceb9: its proposed catalog route returns 404. No prior equivalent catalog view existed. Before footage starts at real registry documentation then navigates to that 404; after footage creates a local sample, opens layout examples and filters the data-table recipe.

## Coverage and cost

Pinned official Base UI catalog: 63 primitives + 3 composition guides = 66 entries. Before this follow-up, 30 entries were covered; add 34 modules, use-mobile and 2 guide recipes. Typography retains the existing module. This is catalog coverage, not identical styling, all shadcn variants or exact upstream API compatibility. AI Elements, application blocks, legacy Sonner and optional Shiki integration are excluded.

The distributed protoform-shadcn item grows from 49 to 86 files, and raw copied file content from 320,131 to 495,556 bytes: +175,425 bytes. Additional direct packages are 8 runtime packages and 1 dev type package. This increases installation/maintenance cost. Direct component imports and lazy Recharts presentation avoid forcing chart runtime into unrelated consumers; no speed claim is made.

## Visual replay

Real route: /docs/blume-examples/registry/base-nova/protoform/demo/ui/shadcn-parity

`bunx --no-install playwright test --config=.context/shadcn-parity/playwright.visual.config.ts`

60 normal passing assertions: 5 categories × light/dark × 320/1000px × Chromium/Firefox/WebKit. Missing baselines failed first. Reviewed intended updates are confined to this new showcase's Messages/Recipes: corrected Message composition, awaited lazy content, painted scroller items and contained/keyboard-scrollable table. No masks, tolerance changes or updates to prior surface baselines.

Replay of prior surfaces: original Code Block/Trace suite 18 passed; original resilience/CodeMirror suite 48 passed, existing baselines unchanged. Their scenarios and historic before/after captures remain linked in the PR.

All category capture files reside under parity.visual.spec.ts-snapshots; contact sheets allow complete inventory review. For mobile Messages, scroll the first event into view before capture so CSS content-visibility paints real content. Recipes wait for the lazy composition component, not merely an empty tab panel. Native narrow checks also wait for actual category content and settled panel opacity before width/axe assertions.

## Interaction proof

30 native category journeys pass in all three engines: local creation/reset, progress, native enum and OTP format, safe cancellation/confirm/recovery, menus, focus return, carousel text editing, resize, message recovery/scroller, required/optional questionnaire and data-table/date-picker actions. Narrow table viewport uses unmodified arrow keys without capturing nested controls. Manual dogfood additionally covers questionnaire back/persisted selection/skip, mobile sidebar, hover/navigation/pagination; no page errors or mutating network requests.

Existing OpenAPI browser test failed once during the first heavily concurrent local suite, with stock request text after editing (hydration timing symptom); the unchanged WebKit journey then passed 3/3 in isolation. No retry, timeout increase or test weakening was introduced. A later broad local run hit widespread navigation timeouts. The fresh unchanged exact-head replay now passes all 747 tests in 2.3 minutes; exact-head CI, Security and the full exhaustive quality gate now pass on46d44aa. The first exhaustive run’s docs heap OOM is repaired with a bounded4096MiB quality-step budget, without any skipped checks, retries or timeout changes.

## Provenance and limits

registry/shadcn-catalog.json is an independent pinned install-path contract; registry consumer smoke compiles installed modules and both recipes. This is distinct from runtime behavior proof. Bundled SHADCN_COMPONENTS.md records exact upstream digests and local adaptations; full MIT notice is preserved byte-for-byte.

Browser engines/mobile viewports are not physical-device or comprehensive assistive-technology testing. State coverage is representative, not all props/content combinations. Samples are explicitly local presentations, not uploads, telemetry or server mutations. Existing OpenAPI localhost-example warning, private Buf audit limitation and two pre-existing audit exceptions remain visible. PR is not merged and no human approval is claimed.
