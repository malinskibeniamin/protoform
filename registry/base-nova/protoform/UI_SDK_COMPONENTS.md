# Protoform UI SDK bundle

`@protoform/protoform-ui-sdk` installs themed React controls built on
`@ui-sdk/react` and `@ui-sdk/core`, pinned to `0.1.0-beta.2`.
UI SDK is beta: review upgrades and copied source before adopting another release.

## Breaking migration

This bundle replaces `protoform-shadcn`; it is not shadcn/Base UI API-compatible.
The source-distribution mechanism is still the shadcn registry CLI.
Existing theme tokens, protobuf conversion, validation, form engines, and the UI-independent
host entrypoint remain separate from UI implementation.

- Use native `render` composition, not `asChild` or `nativeButton`.
- Tabs use `TabsTab` and `TabsPanel`, with string values.
- Accordions and collapsibles use `AccordionPanel` and `CollapsiblePanel`.
- Menus share `Menu*` parts; right-click areas use `MenuContextTrigger`.
- Compose modal backdrops explicitly: `AlertDialogBackdrop`, `DialogBackdrop`, `DrawerBackdrop` or `SheetOverlay`. Sheets use the SDK Drawer with `side="right"` by default; put other sides on the root. The SDK viewport owns positioning and translation, while local styles provide dimensions and surfaces.
- Compose `SelectContent` with an explicit `SelectList`. Use the native mount/unmount lifecycle. `keepMounted` remains outside the themed API after a beta.1 Escape error during migration; retained content is not covered across the supported harnesses. Protoform does not patch the package.
- Toggle groups always use arrays. Their entries are ordinary SDK toggles.
- Calendars use ISO date/month strings and `onValueChange`, not DayPicker props or Date objects.
- OTP inputs use `OTPInput*` and `onValueChange`.
- Carousels require `CarouselViewport` and use SDK controllers rather than Embla APIs.
- Resizable panels use `Resizable`, numeric percentage sizes, and SDK handles/controllers.
- Toasts use `toast(...)`, `toast.dismiss()`, `ToastRegion`, and `createToaster`.
- Tooltips coordinate hover warm-up without a provider. Set `delay` on individual roots.
- Popup lifecycles, change reasons, cancellation, state attributes and positioning follow the
  installed UI SDK documentation. Native `data-open`, `data-selected`, `data-checked` and other
  SDK attributes replace the old compatibility `data-state` layer.

`OptionCombobox`, `SimpleMultiSelect`, choice cards, the questionnaire and message scroller are
Protoform compositions of SDK controls. Chart rendering remains with Recharts in this bundle;
CodeMirror remains the JSON editor. UI SDK does not replace these specialized renderers.
The alternative `protoform-ui-sdk-tanstack` bundle uses native TanStack Charts instead of Recharts.

## Host-owned UI and agents

`protoform-ui-sdk-host` copies only an editable component map and its prop-normalization helper.
Install matching controls into your own UI aliases first. Text controls in the renderer boundary use `onValueChange(string)`; custom native controls should connect their `onChange` to that callback.
The renderer-boundary `Select` requires `items` metadata, including labels, so null and the literal string `"null"` remain distinct before the popup mounts.
Other UI libraries can still implement
`ProtoformUIComponentMap` directly; the core installation does not acquire SDK dependencies.

`protoform-ui-sdk-agent` provides the native `createAgent` factory and a policy-required `createAgentSession`. Call the chosen factory before rendering when a host explicitly
wants an agent bridge. Nothing creates a bridge, registers WebMCP tools, or grants agent actions
at module import. Hosts own authorization and confirmation/secret policies.

Declare `@layer ui-sdk;` before Tailwind imports in application styles. SDK components are
styled locally with semantic tokens, not the optional upstream `web.css` theme.

## Provenance and licenses

Behavior comes from the npm packages, not vendored implementation files. The upstream is
[vercel-labs/ui](https://github.com/vercel-labs/ui), Apache-2.0, inspected at revision
`8ff6bcf7100d48230a3fab8c72475d99316cc58a`. Package licenses ship with npm installations.
The [version-matched docs](https://ui-sdk.dev/docs) also ship in `@ui-sdk/react/docs`.

Existing presentation styles and non-behavioral compositions were adapted from MIT-licensed
[shadcn/ui revision ba1503c64472b82256d9de95e2e62c5901a38e8b](https://github.com/shadcn-ui/ui/tree/ba1503c64472b82256d9de95e2e62c5901a38e8b/apps/v4/registry/bases/base/ui).
Preserve the bundled `shadcn-MIT.txt` notice. That attribution is not a compatibility promise.
`registry/ui-catalog.json` inventories installed modules and examples.

## Core composition and agent workbench

`Rating` and `RatingStar` are a framework-free `definePrimitive` rendered through React `createParts`. The primitive composes `createChange`, `createRovingFocus`, and `announce`; its radio group has one Tab stop, selection-following arrows, wrapping, Home/End, and native button activation. Values are integers from 0 (cleared) through 5. Only `setValue` is agent-callable. The primitive passes `checkPattern`, `checkServer`, and `checkDirection` from `@ui-sdk/core/testing` in Chromium. React is the tested adapter; no Vue/Svelte packages are installed.

The pinned core's `definePrimitive` return type includes an optional-valued `options` property incompatible with its own `Primitive` constraint under `exactOptionalPropertyTypes`. The rating attaches its shared, explicitly declared option schema with `Object.assign`, preserving the callable primitive and exact slot types without casts or a package patch.

Install `@protoform/ui-sdk-agent-workbench` for an explicitly enabled, local example of the real bridge, form validation, approval, observation, staging, seeking, and source-specific undo. It has no model connection or backend and never registers WebMCP tools. The built example is at `/docs/blume-examples/registry/base-nova/protoform/demo/ui/agent-workbench`.

For application integration, import `createAgentSession` from your installed `@lib/ui-sdk/session` alias and call it before mounting the agent-enabled controls:

```ts
const session = createAgentSession({
  allow: authorizeAction,
  confirm: askThePerson,
  history: { within: () => editablePanel },
  onChange: receiveRedactedAgentVisibleChanges,
});
```

`allow` is required. Confirmation-marked actions also require `confirm`; a broad `allow` cannot silently authorize them. Both callbacks receive an abort signal and must honor it. `dispose()` aborts that signal, refuses future actions, and stops this session's history/subscription. `session.signal` lets asynchronous callers discard stale results after disposal. The upstream bridge has no destroy method; disposal does not erase the SDK's page registry or stop normal human interactions.

Use the native `agentTools` from `@ui-sdk/react/agent` to wire snapshot, act, and query to your chosen model harness. Registration and transport are deliberately left to the host. An `act` result with `ok: true` can still contain a canceled or unaccepted controlled change: read back the control's current state.

Import `observe`, `withSource`, and `elementOf` from `@ui-sdk/react/observe`, and `createHistory`, `stageChanges`, and `describeEntry` from `@ui-sdk/react/history`. These are version-matched native APIs, not local copies. Raw `observe` includes hidden regions; keep it inside trusted application code. Use `agent.subscribe` (or the session's `onChange`) for agent-visible events. Keep history's `within` scope outside secret/private fields where possible; scoping history is not authorization or snapshot filtering.

Mark custom secrets with `data-agent-secret`, private regions with `data-agent-hidden`, and consequential actions with a trusted `data-agent-confirm` explanation. Password inputs retain redaction even while their visibility toggle shows text. Never send raw form values to an agent to work around redaction.

Commands are asynchronous, and a multi-step action is not atomic. The workbench shows running/ready status; wait for ready before editing fields that an in-flight command may still change. Hosts that allow concurrent human and agent edits need application-owned conflict handling.

History is experimental. `undoSource('agent')` preserves later human edits, while `seek` and staged `revert` restore captured values subject to current permissions/callbacks. Restoration can be partial: inspect returned skipped entries. Redacted fields cannot be restored. Staged `revert` can overwrite later edits; it is not conflict-safe or atomic. No history operation undoes a save or network request. After an `await`, use `withSource(source, () => controller.setValue(...))` to retain the original agent attribution.

Read installed docs via `node_modules/@ui-sdk/react/docs/llms.txt`, `docs/agents.md`, and the core package's `docs/core.md` and `skills/ui-sdk/SKILL.md`; public web docs may describe a newer release.

The agent marks constrain the UI SDK bridge, not arbitrary same-origin code or browser automation with full DOM access. Backend authorization remains required for real side effects.
