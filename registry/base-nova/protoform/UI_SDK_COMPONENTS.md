# Targeted UI SDK enhancements

Protoform has one control catalog, built on `@base-ui/react`. UI SDK beta.5 adds a small,
explicit capability layer; it is not an alternative Button/Input/Select/Dialog library.

Install `@protoform/protoform-shadcn-tanstack` (or the Recharts chart variant
`protoform-shadcn`) for the catalog, including the enhancement source. Existing applications
with the canonical Protoform Base UI controls can add only `protoform-sdk-enhancements`.
That item does not copy or replace their standard controls.

## Retained capabilities

- `sdk/rating`: a distinct core-composed Rating using `definePrimitive`, `createChange`,
  `createRovingFocus`, and `announce`, rendered through `@ui-sdk/react/primitive`.
  Its only declared agent action is `setValue`; arguments must be integers from zero to five.
- `sdk/async-option-combobox`: `useAsyncOptions` supplies cancellation, debouncing, retry,
  and explicit pagination to the existing Base UI Combobox. Base UI alone owns keyboard,
  focus, selection, and popup behavior. The loader must honor its AbortSignal.
- `sdk/preferences`: explicit persistent preference models, `usePreference`, and a Base UI
  Select. Mounting the opt-in example restores its specified storage only; it does not change
  the global application theme or install an agent-controlled Select.
- The hooks example demonstrates SDK shortcuts and platform-aware hints around native controls.
- `lib/ui-sdk/session`: a policy-required agent session with separate human confirmation,
  redacted observation/history, abortable permission checks, and disposal. The lower-level
  native `createAgent` factory remains available from `lib/ui-sdk/agent`.

## Safety boundary

Importing modules starts no session and registers no WebMCP tools. Agent access is opt-in and
only covers SDK primitives with declared actions, such as Rating. Ordinary Base UI controls
are not SDK agent targets; adding `data-agent-*` attributes does not register them as targets.
Authorization, confirmation, and any integration with application actions remain app-owned.
Keep secret/hidden/confirmation attributes intact on SDK roots. History restores UI values,
not saves, transactions, or network side effects. Source-specific undo preserves later human
edits; reverting a staged preview restores its captured values and may overwrite later edits.
Do not attach a second keyboard/focus/state owner to an existing Base UI control.

The installed and built agent workbench demonstrates the Rating boundary, callback cancellation,
redaction, approval/rejection, staging, seek/replay, undo, and repeated disposal. Its Base UI
project input and save button are deliberately unavailable to the SDK agent. Helper integration
tests use upstream SDK components directly as external-consumer fixtures, not vendored replacements.

## Migration from the unreleased parallel catalog

`protoform-ui-sdk`, `protoform-ui-sdk-tanstack`, `protoform-ui-sdk-host`, the SDK AutoForm
entrypoint/map, and the replacement control adapters have been removed. No compatibility
alias silently replaces SDK controls with different native APIs. Use the canonical AutoForm
and Base UI controls; only the three additions listed above remain in `sdk/`.
Do not mechanically remove `/sdk/` from old imports: native Base UI props, callbacks, and
composition parts differ. Consult the Base UI examples and compiler-checked public contracts.
The earlier goal of using every SDK React hook is retired; SDK Field and replacement-control
hooks are not layered onto native controls merely to increase a usage count.

## License and provenance

The SDK packages are pinned together at `0.1.0-beta.5`. Package documentation is shipped with
those installed versions. The previously evaluated upstream source revision was
`98ba9fd019274efae63fae08eb56da02453b4873` of vercel-labs/ui. The full SDK catalog is no longer
vendored. Native shadcn-derived code retains its separate MIT notice and provenance in
`SHADCN_COMPONENTS.md`; preserve that notice when copying the catalog.
