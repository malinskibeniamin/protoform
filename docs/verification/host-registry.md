# Host-owned registry verification

```bash
bun install --frozen-lockfile
bun run registry:build
bun run registry:consumer-smoke
bun run registry:host-browser
```

The locked shadcn CLI installs disposable consumers under `.tmp/`. Network access is required;
run the consumer smoke serially because its fixtures and registry port are shared. Isolated
consumer fixtures resolve Query and Query Core to the repository-tested version, avoiding
partially published npm releases; production dependency ranges are unchanged.

There is one Base UI control catalog. The host fixture uses a `new-york` theme, an independent
`@host` registry namespace, and nested aliases for UI, hooks, components, and library files.
Installing the headless form/host map must not modify its existing controls, theme, utilities,
or `components.json`. Installed source is typechecked and server-rendered without repository
source aliases. The host stylesheet disables implicit Tailwind source discovery: presentation
helpers must compile through the normal UI source roots.

Other fixtures verify core-only installs, standalone alternate form engines, the native catalog,
and the TanStack chart variant without Recharts. The primary consumer additionally installs the
targeted SDK examples, not another full UI library.

## Browser coverage

Chromium desktop/mobile host journeys exercise real computed styles, placeholder/selection,
validation and recovery, submission, missing-map errors and recovery, nullable values, focus,
and absence of uncaught errors. Existing native screenshot baselines remain authoritative.

`registry/ui-foundations.integration.test.ts` builds real module graphs: the headless core/host
include neither UI engine; default AutoForm includes Base UI but not SDK runtime. The entire
standard control catalog is also bundled to reject accidental SDK runtime imports. A directory
and registry contract rejects parallel SDK replacements and alternate SDK AutoForm bundles.
The pinned native compiler contracts continue to cover the original Base UI public API.

`ui-foundations` renders a real Base UI form beside an explicitly enabled SDK Rating. Its
installed and built journeys check native validation/submission, scoped agent read-back,
refusal to edit Base UI controls, Rating-only undo, and repeated stop/re-enable.

`ui-sdk-agent-workbench` has a shared real-page journey for installed and built examples. It
checks declared Rating actions, Base UI refusal, cancellation, secret/hidden redaction, separate
human approval/rejection, staging/revert, seek/replay, source undo preserving human edits,
saved-output preservation, pending-confirmation abort, and disposal. A WebMCP registration spy
must remain untouched. SDK agent/helper tests may use upstream SDK primitives directly to
exercise external consumers; those are not copied into the shipped catalog.

The Rating primitive retains SDK pattern, server, direction, keyboard, announcement, and
argument-validation checks. Async loading retains stale-request cancellation, retry, pagination,
and unmount abort coverage. Preferences retain explicit storage restoration and cancellation.
Base UI owns their actual Combobox/Select interaction. Persistence and agent sessions remain
opt-in; history never reverses network side effects. Cross-library modal/shortcut coordination
and application action authorization remain application-owned.
