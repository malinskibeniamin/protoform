# Optional UI SDK enhancements

Keep the canonical Base UI catalog and AutoForm. These additions use UI SDK `0.1.0-beta.5`;
there is no parallel control catalog, new form contract, or automatic agent session.
Declare `@layer ui-sdk;` before Tailwind on SDK pages. No SDK default stylesheet is installed.

## Install

Install the canonical `protoform-shadcn` or `protoform-shadcn-tanstack` bundle first, then:

```sh
bunx shadcn@latest add @protoform/protoform-sdk-enhancements
```

Import `Rating`/`RatingStar`, `AsyncOptionCombobox`, or `PreferenceSelect` from your configured
UI alias's `sdk/` directory. Async options and preferences reuse the existing native
Combobox and Select; Base UI keeps ownership of keyboard, focus, selection, and popup behavior.
Rating is a distinct primitive composed with public core behaviors and React rendering parts.
Preferences use only explicitly supplied storage and must be enabled by the app.

Install `ui-sdk-hooks` for async loading, shortcuts/hints, and opt-in saved preferences.
Install `ui-sdk-agent-workbench` for the Rating agent demonstration. Both require the canonical
controls above. The standard bundles install no SDK dependencies.

## Agent boundary

`protoform-ui-sdk-agent` can also be installed alone. `createAgentSession` requires an explicit
application authorization policy and a separate human-confirmation callback. No import starts
a session, registers WebMCP tools, or connects an LLM. Preserve secret/hidden/confirmation
attributes; dispose sessions when disabling agent access. Use the SDK’s native `createAgent` factory
from `@ui-sdk/react/agent` for application-owned integrations.

The workbench exposes declared Rating actions only, not ordinary Base UI controls or saving.
History restores UI values, never network effects. Source-specific undo preserves later human
edits; reverting a staged preview restores its captured values and may overwrite later edits.
Historical changes still require application authorization and confirmation. Cross-library
modal/shortcut coordination remains application-owned.

The shipped package docs and skill match the installed beta. No core internals are imported.
Native shadcn-derived source and MIT provenance stay unchanged in `SHADCN_COMPONENTS.md`.
