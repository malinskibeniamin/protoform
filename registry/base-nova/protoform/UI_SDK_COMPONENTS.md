# Protoform UI SDK bundle

`@protoform/protoform-ui-sdk` installs themed React controls built on
`@ui-sdk/react` and `@ui-sdk/core`, pinned to `0.1.0-beta.1`.
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
- Compose `SelectContent` with an explicit `SelectList`. Use the native mount/unmount lifecycle. `keepMounted` is deliberately not exposed by the themed `SelectContent`: beta.1 loses its bound element for retained content and throws on Escape. Protoform does not patch the package.
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

`protoform-ui-sdk-agent` exports `createAgent`. Call it before rendering when a host explicitly
wants an agent bridge. Nothing creates a bridge, registers WebMCP tools, or grants agent actions
at module import. Hosts own authorization and confirmation/secret policies.

Declare `@layer ui-sdk;` before Tailwind imports in application styles. SDK components are
styled locally with semantic tokens, not the optional upstream `web.css` theme.

## Provenance and licenses

Behavior comes from the npm packages, not vendored implementation files. The upstream is
[vercel-labs/ui](https://github.com/vercel-labs/ui), Apache-2.0, inspected at revision
`d55a1d825fd19d285ef4a3bd4c4ff1622df08373`. Package licenses ship with npm installations.
The [version-matched docs](https://ui-sdk.dev/docs) also ship in `@ui-sdk/react/docs`.

Existing presentation styles and non-behavioral compositions were adapted from MIT-licensed
[shadcn/ui revision ba1503c64472b82256d9de95e2e62c5901a38e8b](https://github.com/shadcn-ui/ui/tree/ba1503c64472b82256d9de95e2e62c5901a38e8b/apps/v4/registry/bases/base/ui).
Preserve the bundled `shadcn-MIT.txt` notice. That attribution is not a compatibility promise.
`registry/ui-catalog.json` inventories installed modules and examples.
