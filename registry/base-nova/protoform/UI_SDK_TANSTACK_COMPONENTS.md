# UI SDK with TanStack Charts

`@protoform/protoform-ui-sdk-tanstack` contains the same UI SDK controls and breaking API migration
as the Recharts variant, but installs `TanStackChart` instead of the Recharts module and dependency.
See the accompanying UI SDK bundle provenance for shared controls, licensing, and migration steps.

The chart wrapper is Protoform-authored and uses the pinned `@tanstack/charts` native typed
chart definitions. Recharts JSX is not compatible input. The React SVG adapter loads lazily.
