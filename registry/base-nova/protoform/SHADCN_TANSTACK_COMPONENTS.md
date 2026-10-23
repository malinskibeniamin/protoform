# TanStack UI bundle provenance

`@protoform/protoform-shadcn-tanstack` is the recommended full UI bundle for new applications.
It retains the shared controls and composition examples from the pinned Base UI Nova bundle,
but replaces the Recharts chart module with `TanStackChart` under `components/ui/chart-tanstack`.
The Recharts module, its exports, and its dependency are not installed by this variant.

The shared shadcn controls originate from revision
[`ba1503c64472b82256d9de95e2e62c5901a38e8b`](https://github.com/shadcn-ui/ui/tree/ba1503c64472b82256d9de95e2e62c5901a38e8b/apps/v4/registry/bases/base/ui).
Their source digests, adaptations, and compatibility notes are recorded in the
[fallback bundle provenance](https://github.com/malinskibeniamin/protoform/blob/e49202241f0a7ad59e16b1fd06af27a33d9f741c/registry/base-nova/protoform/SHADCN_COMPONENTS.md).
The chart digest and Recharts API contracts in that document apply only to the fallback, not this variant.
The upstream MIT notice is installed alongside this file as `shadcn-MIT.txt`; preserve it when copying controls.

The TanStack wrapper is Protoform-authored source, not a copy of the shadcn Recharts implementation.
It imports the pinned `@tanstack/charts` dependency and preserves its native typed definition and callback API.
Recharts JSX is not a compatible input. The React SVG adapter loads lazily; no other framework adapter is imported.
