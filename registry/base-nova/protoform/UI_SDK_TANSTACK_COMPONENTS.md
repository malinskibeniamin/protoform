# UI SDK with TanStack Charts

`@protoform/protoform-ui-sdk-tanstack` contains the same opt-in UI SDK controls and isolated `sdk/` installation namespace
as the Recharts variant, but installs `TanStackChart` instead of the Recharts module and dependency.
See the accompanying [shared control guide](./protoform-ui-sdk-controls.md) for shared controls,
licensing, breaking migration steps, owned core adapters, and opt-in agent integration.

The chart wrapper is Protoform-authored and uses the pinned `@tanstack/charts` native typed
chart definitions. Recharts JSX is not compatible input. The React SVG adapter loads lazily.
