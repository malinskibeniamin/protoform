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

## Owned React adapters

The agreed boundary is React rendering owned by Protoform over upstream public core component primitives, not locally rewritten state/behavior compositions. Adapter source lives in `lib/ui-sdk/adapters`; semantic-token styling stays in the component modules.

The first group covers Accordion, Avatar, Button, Calendar, Carousel, Collapsible, Dialog, AlertDialog, HoverCard, Input, Label, Popover, Progress, Resizable, ScrollArea, Separator, Slider, Switch, Tabs, and Textarea. Text adapters forward their initial values into native React markup as well as core options. Switch renders the core's native form input beside—not inside—its button. Plain Button bridges React events and asynchronous actions to the core's own pending-action API.

The beta.2 optional-schema type mismatch also affects built-in primitives under exact optional properties. `withOptionSchema` retains each factory's existing schema object and supplies an empty schema only when absent. It does not replace state, slots, or behavior, and no installed package is patched.

A Button with both a custom `render` and an action callback retains the SDK React adapter: the direct bridge failed the installed router-link regression by canceling the first navigation as soon as the action became pending. The retained adapter preserves first navigation and blocks subsequent pending presses.

Beta.2 requires bounded SDK renderer exceptions. In this release, core menu checkbox/radio parts and Select/Combobox extensions such as select-all are registered by renderer-only feature factories. Rendering their declared parts directly from the public primitives fails because the slot definition has not been registered. The package explicitly marks `@ui-sdk/core/renderer` as non-public and unstable. The agreed exception is to retain SDK React adapters only for demonstrated public-API gaps. No unstable renderer import is added here.

External controller-connected Dialog, AlertDialog, and Popover triggers, and roots configured with those controllers, likewise retain their SDK React adapter: a raw core part has no root handle outside its root, and the public controller does not expose one. Retaining just the trigger is insufficient: the SDK React root also registers the controller-to-renderer handle needed by that trigger. Ordinary in-root triggers use owned adapters. Other popup parts use owned adapters with inherited/explicit React portal containers; Dialog and Popover content also render the public viewport slot when their resolved presentation is a sheet. Tooltip also has an additional optional-slot typing incompatibility beyond the shared schema mismatch.

The design-system linter recognizes only explicitly enumerated owned adapter imports as unstyled parts. Semantic-token, arbitrary-value, and inline-style checks still apply; styled component usage retains its existing contracts. Positive and negative lint fixtures protect that distinction.

Distinctive `core-*` adapter filenames and `primitive-schema.ts` prevent shadcn basename collisions with AutoForm fields and schema helpers. Local part exports use imported bindings so the CLI rewrites their custom host aliases correctly. Clean consumer installs verify the emitted source.

Every existing control family has now been evaluated at the agreed boundary. Thirty-two of the 34 adopted SDK families have owned core-backed rendering parts; Menubar and Tooltip retain their SDK React renderer for the demonstrated boundaries below. This is not a claim that every part or root is independently renderable through beta.2’s public API.

The next group adds Radio/RadioGroup, OTPInput, Command, Drawer, and standalone Checkbox and Toggle. Radio renders each core native input beside its button; OTP forwards names and autofocus to its one native control, renders core slot characters, and keeps native validation/reset. Command’s owned parts preserve optional item values with stable React-generated identities and render text-match segments, explicit page scopes, shortcuts, and static/function empty content from core state. Root/list/data placement retains the SDK renderer boundary: a bare public core root renders no default data list, while a raw list inside an SDK root renders both that list and the SDK fallback, with duplicate IDs. The React placement and label helpers are not exported by the public primitive entry. Root, List, and Items therefore remain a stable SDK unit; switching root implementations only when data arrives was rejected because it resets an uncontrolled query. Other composed parts use owned adapters. Filtering, selection, page transitions, and pending actions remain upstream-owned. Drawer renders the public viewport around content and preserves public snap-point/handle behavior. External controller-connected Drawer roots, triggers, and outlets retain the same demonstrated renderer-handle connection exception as Dialog.

CheckboxGroup and ToggleGroup coordination retains the SDK React adapter together with grouped members. The public React primitive entry does not expose its nearest-handle/group context helpers. Raw parts in a native group, or native members in a raw group, render unchecked/unpressed despite a selected group default. An owned context could connect public core group APIs, but `usePrimitive` accepts the factories' erased string callbacks rather than their exported literal-generic option types; a narrowed `onValueChange` fails strict assignment. The generic `createParts` scope preserves options but does not publicly expose its handle to such a context. This bounded fallback preserves generic callbacks, parent checkbox registration, form ownership, and roving membership without assertions or private imports. Standalone controls and indicators/icons use owned adapters. Compiler contracts and real form/keyboard tests protect that boundary.

### Selection, menu, navigation, and toast boundaries

Menu, Select, Combobox, NavigationMenu, and Toast now have owned parts too. Select and Combobox own ordinary items, labels, inputs, indicators, groups, separators, status, clear buttons, arrows, explicit-string matched text, empty content, and value projection. Menu owns ordinary triggers/actions, separators, shortcuts, group identity/labels, and the context-key bridge. Navigation owns its list, triggers, links/icons, indicator, and viewport with explicit portal containers. Toast owns title/description rendering with explicit queue identity and React content. Presentation classes are unchanged.

| Retained SDK renderer                                           | Reproduced beta.2 boundary                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Menu root, content/data placement, and submenu connection       | A bare public root omits implicit data actions. Raw content inside an SDK root adds a second menu. Submenus require the opaque parent connection. Ordinary actions and group rendering stay owned.                                                                                            |
| Menu checkbox/radio/context/icon features                       | Their type declarations include slots that a bare instance does not register. The registering feature factories are not publicly exported. Native feature parts coexist with owned ordinary parts.                                                                                            |
| Select/Combobox roots, content/list/data placement              | Bare roots lose composed labels before the popup mounts and omit native form projection. Raw content adds duplicate data popups; raw lists omit data items. Keep the renderer unit stable when async items arrive.                                                                            |
| Selection default/non-string item-text and icon/extension parts | Default text needs the renderer’s nearest-item label mapping, especially for object values; explicit string text uses owned core match segments. Icon copying, select-all, chips/overflow/removal, and creation register renderer-only features.                                              |
| Navigation root/item/content                                    | A raw item cannot supply the SDK content’s item context. Replacing native content loses its parent context and makes a nested menu render a second landmark. The generic public hook also erases narrowed root callbacks. The public viewport works and is owned, including portal transport. |
| Menubar root                                                    | SDK menu roots do not join a bare public menubar root: triggers lose their menuitem roles and shared tab stop. Keep the connected root with SDK menu-root context.                                                                                                                            |
| Toast region/item/action/close                                  | The renderer supplies current-toast context, default queue placement, and per-part async action/close overrides. The public action slot accepts a toast identity, not those overrides. Owned text receives typed React content from the region and passes the explicit identity to core.      |
| Tooltip                                                         | After option-schema normalization, its shortcut slot’s optional-valued fields still fail the public Primitive constraint with exact optional properties. No cast, weakened compiler flag, or package patch is used.                                                                           |

The public-boundary integration tests preserve the runtime reproductions and negative compiler contracts. Native browser tests cover the actual owned/retained combinations, not just bare slot markup. Shared option schemas may be required or optional on beta.2 factories; normalization preserves the original factory and schema identity in either case.

Beta.2’s native context trigger did not open on Shift+F10 or the context-menu key in the runtime probe. The adapter uses public `matchesShortcut` and `withSource` to forward a keyboard context-menu gesture through the native context trigger. Its contextmenu event uses the keyboard button value, preserving first-item focus. The SDK still owns positioning, active-opener identity, context presentation, focus, dismissal, and change cancellation; no local menu state or generated controller is introduced. Caller key cancellation, disabled triggers, supplied controllers/payloads, callback cancellation/source, sheet-to-context-popover resolution, and focus recovery remain application/SDK-owned and are covered in Chromium.

Public part IDs are kept distinct where a renderer supplies metadata, including menu group labels and value/text parts. Reusing the empty group-label key dropped the second group’s accessible name; a browser regression protects both labels. Keyboard tests wait for the popup’s initial focus and subsequent highlighted focus to settle before committing selection; no duration waits or increased timeouts are used.

Beta.2 also leaves nonmatching manually composed Select/Combobox items visible when the same root receives an `items` data array. This reproduces with the unwrapped SDK components. Searchable manual compositions omit that array and let core register/filter their item parts; data-driven lists instead render the filtered SDK list data. `OptionCombobox` uses manual registration plus public `itemToLabel` for closed/server-rendered labels, including labels different from values. The API demo follows the same manual path. A browser regression covers rich labels, hidden nonmatches/empty groups, selection, and `filter={false}` provider results; incoming async options retain their existing integration coverage. No local filtering or selection algorithm is added.

## Public React hooks

The pinned beta.2 package exports seven public React hooks. Protoform now directly uses all seven (distinct APIs, not invocation counts):

| Hook              | Real consuming surface                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `usePrimitive`    | Owned state/rendering adapters for inputs, buttons, switches, and other controls                                               |
| `usePart`         | Owned component slots and the framework-free Rating adapter                                                                    |
| `useFieldControl` | Owned Input/Textarea inherit Field names, disabled state, labels, descriptions, and errors                                     |
| `useShortcut`     | Sidebar's platform-specific `mod+b`: page binding pauses behind other modals, and an own-layer binding closes its mobile modal |
| `useShortcutHint` | Sidebar trigger's platform-correct title and `aria-keyshortcuts`                                                               |
| `useAsyncOptions` | Optional `AsyncOptionCombobox`: debouncing, stale-request cancellation, error retry, pagination, and unmount cancellation      |
| `usePreference`   | Optional `PreferenceSelect` and the explicitly enabled saved-density example                                                   |

`Field` preserves its presentational wrapper for externally managed validation and existing form-engine ownership by default. It does not attach an additional SDK validator that could rewrite those engines’ explicit ARIA contracts. Set `validation="native"` to opt into SDK-managed labels/descriptions/errors and automatic Input/Textarea joining. That mode retains the native React root adapter: a public core root does not publish the renderer-owned context that the public `useFieldControl` hook reads. The browser regression reproduces that null context; it also verifies the connected root with owned input/textarea parts. The legacy `useFieldContext` error association remains for existing Protoform Input callers. External mode keeps its existing form-engine label/description/error associations; native mode uses SDK-managed parts and also supports controlled `invalid` state. Validation ownership is explicit rather than inferred from transient error props, so clearing an error cannot replace the root and remount its input. This avoids duplicate descriptions and competing validation authorities. No private context is imported. Existing form-engine ownership and explicit IDs remain application-owned. Labels with an explicit `htmlFor` keep the ordinary label path, so automatic `aria-labelledby` does not override a caller’s explicit accessible name (including host controls and secret-field aliases). Implicit labels use the owned core field-label slot.

Install `@protoform/ui-sdk-hooks` for a live example at `/docs/blume-examples/registry/base-nova/protoform/demo/ui/sdk-hooks`. `AsyncOptionCombobox` is optional; it does not replace cached protobuf-provider queries. Its loader must honor `signal` and return SDK option objects, optionally with `hasMore`. The retry action lives inside the nonmodal popup, not behind its floating list. A public combobox controller restores input focus before the retry action unmounts; the persistent error message remains outside the popup. Pagination delegates to the SDK’s end-of-list `onLoadMore` behavior. Results remain server-ranked (`filter={false}`).

Preferences are experimental and opt-in. Importing the module creates no preference, reads/writes no storage, and changes no global attributes or theme. Hosts explicitly create a preference and choose its storage/key. The demo does this only after Enable saved preferences, applies density only inside the example, and unsubscribes when stopped; saved values remain for later restoration. Server-rendered preference metadata uses `definedProps` to normalize beta.2’s optional-valued storage field without a cast. Supply a CSP nonce to the native `Preferences` component when required. `PreferenceSelect` preserves agent marks and original change source/event/reason, reflects cancellation, and uses native controlled-value read-back/history; stored preferences are not a transaction or a way to undo side effects.
