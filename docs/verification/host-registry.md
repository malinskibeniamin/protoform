# Host-owned registry verification

## Reproduce

```bash
bun install --frozen-lockfile
bun run registry:build
bun run registry:consumer-smoke
bun run registry:host-browser
```

The consumer smoke uses the repository's locked shadcn CLI. It creates disposable fixtures under
`.tmp/` and requires network access for the host registry and npm dependencies. Run it serially:
the fixtures and local registry port are shared. `--host-only` skips the older bundles when iterating.

The host fixture uses `new-york`, an independently configured `@host` registry namespace, and
separate nested aliases for UI, components, hooks, and library files. Before installing Protoform,
it first installs Base UI defaults, records their control files and default AutoForm entrypoint,
then adds the isolated SDK bundle and checks byte equality. It records both foundations, the host
stylesheet, utilities, and `components.json` before installing the SDK host map and agent helper,
and verifies that no existing control changed and no extra primitives appeared. The primary
consumer checks the reverse order: adding Base UI after SDK must leave SDK files unchanged.
It then typechecks and server-renders the installed AutoForm, not repository source aliases.
The installed Base UI and SDK Card and Group exports must have identical implementation
identity, proving that their common presentation is installed once rather than copied.
The fixture disables automatic Tailwind source discovery: shared styles must compile through
the existing UI source roots, without scanning private library directories.
The other fixtures typecheck core-only and themed SDK installs, plus Base UI-backed alternate
form engines. The SDK agent workbench must first install and import in a clean consumer without Base UI.

## Browser coverage

Chromium at 1100×800 and 390×844:

- Computed host theme color and full-width input: fail if CSS is missing.
- Required select placeholder and selection.
- Submit through the host's input and button.
- Remove a required UI mapping; show the missing component by name.
- Restore the mapping with the same schema; recover without remounting the entire app.
- Empty submission, visible validation feedback, correction, and successful resubmission.
- Distinguish an unset selection from the literal string `"null"`.
- No uncaught browser errors. React's development error-boundary report during the intentional
  missing-component step is expected.

| Desktop                                                                                                     | Mobile                                                                                                               |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| ![Host form](../../scripts/__screenshots__/host-consumer.browser.spec.ts/desktop/host-ui.png)               | ![Host form on mobile](../../scripts/__screenshots__/host-consumer.browser.spec.ts/mobile/host-ui.png)               |
| ![Missing mapping](../../scripts/__screenshots__/host-consumer.browser.spec.ts/desktop/missing-control.png) | ![Missing mapping on mobile](../../scripts/__screenshots__/host-consumer.browser.spec.ts/mobile/missing-control.png) |

These are new-host-entrypoint baselines, not screenshots of a redesigned legacy form. The fixture's
Tailwind v4 stylesheet and neutral theme are consumer-owned and are not shipped by Protoform.
The Vite Tailwind plugin compiles both installed primitives and Protoform classes; the browser imports
the stylesheet. The original handwritten-CSS snapshots were inadequate styling evidence and are replaced.

## Scope and limitations

The host adapter maps the renderer-neutral form boundary to host-owned UI SDK controls. Other
component libraries need their own map. All form engines use the same updated boundary; hook-only
and core-only installations stay independent of UI SDK. Specialized combobox, multi-select,
choicebox, JSON, and key/value controls still require explicit host mappings or custom renderers.

The `@host` namespace resolves the pinned local registry snapshot, not a moving third-party registry.
Installing the core and host adapter must not mutate the already-installed controls or host theme.
Previous screenshot baselines must be reviewed against the current native UI SDK composition.

## Agent and core behavior verification

The installed `ui-sdk-agent-workbench` example runs at `/agent.html` in the full consumer fixture. `scripts/agent-consumer.browser.spec.ts` covers explicit enablement, snapshot/query/act, controlled callback cancellation, custom primitive actions, secret/hidden marks, human approval and rejection, actual AutoForm validation/submission, asynchronous source propagation, staging/revert, seek/replay, source-specific undo, and repeated session disposal. A browser-provided WebMCP registration spy must remain untouched. `e2e/agent-workbench.spec.ts` separately exercises the built Blume example at 1280px, 390px, and 320px in light/dark modes: the docs preview's intrinsic sizing must not widen the page, even after long snapshot output, and approval controls must remain in the viewport.

`registry/ui-sdk/protoform/components/rating/rating.browser.test.tsx` exercises the framework-free primitive with SDK `mount`, `checkPattern`, `checkServer`, and `checkDirection`, including strict SDK warnings, keyboard selection, announcements, argument bounds, and cancellation. `lib/ui-sdk/session.browser.test.tsx` tests the application's policy/lifecycle seam, not a reimplementation of SDK internals. UI history does not undo submitted side effects.

## Default and optional foundation isolation

`registry/ui-foundations.integration.test.ts` builds actual module graphs: default AutoForm must
include Base UI without SDK, explicit SDK AutoForm must include SDK without Base UI, and the
headless core and host must include neither. The Base UI map supplies its tooltip provider through
the optional renderer-map `Provider`; a regression test preserves input identity and edits across
map updates.
The same isolation assertions also build every public control entrypoint in each catalog,
covering controls outside AutoForm's default map.

`ui-foundations` installs a real default Base UI form beside an explicitly enabled SDK rating.
`scripts/foundations-consumer.browser.spec.ts` exercises the installed example in both host-browser
profiles; `e2e/ui-foundations.spec.ts` checks the built docs example at 1280px, 390px, and 320px in
light/dark modes. They cover invalid submission and recovery, Base UI selection and saved values,
SDK agent read-back, refusal to edit the Base UI form, SDK-only history undo, and stop/re-enable.
SDK actions do not automatically cover Base UI controls. Keep each control and nested popup flow
on one foundation; cross-library shortcuts and modal coordination remain application-owned.
