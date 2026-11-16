# Protoform

Protoform is an MIT-licensed shadcn registry for building React forms from protobuf descriptors,
Protovalidate constraints, CEL rules, and Google AIP conventions.

The project distributes source, not Protoform npm packages. `shadcn add` copies the runtime, hooks,
components, generator, or examples into the consuming repository so teams can inspect and adapt
everything they ship.

## Manual forms without AutoForm

Install only the core when you want protobuf conversion, validation, and `useProtoForm` with
your own fields and layout:

```bash
bunx shadcn@latest add @protoform/protoform-core
```

This copies editable source without AutoForm renderers or UI primitives. No AutoForm component
map or provider is required. Add `protoform-react` later for selected generated forms without
replacing your manual forms.

The `@protoform` names here identify registry items, not Protoform npm packages. Configure the
registry URL shown under [Preview snapshot](#preview-snapshot) before installing.

## Bring your own registry and theme

Use the preview snapshot below, or build a local registry from the revision you want to test.

`protoform` and `protoform-react` install protobuf-driven form behavior, not a design system.
They do not install UI primitives, change `components.json`, or inject CSS/theme tokens.
The source directory name `base-nova` is internal: installation uses explicit alias-based targets
and is tested with `new-york` and custom component paths.

Keep your existing style, theme and aliases. Add your own registry namespace alongside Protoform:

```json
{
  "aliases": {
    "components": "@/features",
    "ui": "@/design-system/ui",
    "lib": "@/lib",
    "hooks": "@/hooks",
    "utils": "@/lib/utils"
  },
  "registries": {
    "@company": "https://your-company.example/r/{name}.json",
    "@protoform": "https://your-protoform-registry.example/r/{name}.json"
  }
}
```

These are placeholder registry URLs. Merge the relevant keys into your existing configuration;
do not replace it. shadcn supports [custom namespaces](https://ui.shadcn.com/docs/registry/namespace)
and resolves [alias-based targets](https://ui.shadcn.com/docs/registry/registry-item-json) from that configuration.

### Base UI defaults

The default themed controls remain built on `@base-ui/react` 1.9.0. Install the Base UI bundle
for the existing control APIs and appearance:

```bash
bunx shadcn@latest add @protoform/protoform-shadcn-tanstack
```

Use `protoform-shadcn` for the Recharts variant. These bundles supply the default AutoForm
entrypoint at `components/auto-form`; the form core and host entrypoint remain independent
of either UI library. Host-owned Base UI controls can use the editable
`protoform-shadcn-host` map (`shadcnHostComponents` from `auto-form/shadcn-host`), or an application-owned component map.

### Optional UI SDK enhancements

[UI SDK](https://ui-sdk.dev/docs) is pinned to `0.1.0-beta.5` and is additive, not a replacement
for the Base UI defaults:

```bash
bunx shadcn@latest add @protoform/protoform-ui-sdk-tanstack
```

Use `protoform-ui-sdk` for its Recharts variant. SDK controls install under the configured UI
alias's `sdk/` directory without overwriting Base UI controls. Opt in per control or form:

```tsx
import { Rating, RatingStar } from "@/components/ui/sdk/rating";
import { AutoForm, uiSdkComponents } from "@/components/ui/sdk/auto-form";
```

The SDK AutoForm entrypoint selects the SDK component map; the default AutoForm keeps Base UI.
You can also pass `uiSdkComponents` explicitly to the headless host entrypoint. SDK native APIs
apply only in that namespace: see the [SDK guide](registry/base-nova/protoform/UI_SDK_COMPONENTS.md).
For host-owned SDK controls in the same `sdk/` namespace, use `protoform-ui-sdk-host`.
Each control has one behavior owner; do not attach SDK behavior to a Base UI-controlled element.
Renderer maps may supply an optional `Provider` for library-owned composition contexts, such as
Base UI tooltip coordination, without coupling the form core to the library.

Both full bundles reuse one React presentation layer under the UI alias's private `shared/`
directory. Appearance-only controls, style variants, and JSON/key-value editor logic have one
implementation; each public namespace binds its own behavior primitives. These helpers stay
inside ordinary UI-scoped Tailwind sources. Chart-specific dependencies remain separate, so
the TanStack variants do not install Recharts.

Custom component maps use the updated renderer-neutral contract: text controls receive
`onValueChange(string)`, and slots use names such as `Radio`, `CollapsiblePanel`, `SelectGroupLabel`,
`TabsTab`, and `TabsPanel`. The supplied Base UI map translates these to native APIs. Existing
application-owned maps must adopt this contract; raw control exports are not a drop-in map.

Install `@protoform/ui-foundations` for a real Base UI form alongside an explicitly enabled SDK
rating and agent sandbox. SDK items require a registry built from this revision; the older
immutable preview snapshot below predates these additions.

### Opt-in agent bridge

```bash
bunx shadcn@latest add @protoform/protoform-ui-sdk-agent
```

Use `createAgentSession` from the installed `lib/ui-sdk/session` for an explicit authorization policy,
a separate human-confirmation callback, redacted subscriptions, and UI history. Create it before
mounting agent-enabled controls and dispose it when the host disables the integration.
The native `createAgent` factory remains in `lib/ui-sdk/agent`; SDK tool schemas, observation,
and experimental history APIs come from their native package entries. Nothing creates a session,
registers WebMCP tools, or connects a model automatically.

Install `@protoform/ui-sdk-agent-workbench` for the local, interactive example and see the
[core and agent integration notes](registry/base-nova/protoform/UI_SDK_COMPONENTS.md#core-composition-and-agent-workbench).
The example explicitly selects SDK controls and AutoForm, and saves only in memory.
Base UI controls do not automatically acquire SDK agent actions. Authorization and human
confirmation remain application-owned; no WebMCP tools register automatically.

## Flagship example

The bookstore walkthrough connects five real RPCs to one generated contract:

- `ListBooks` and `GetBook` power the browser and detail views.
- `CreateBook` uses a two-step React Hook Form flow and an ISBN-13 CEL rule.
- `UpdateBook` derives a field mask, preserves server-owned fields, and sends an etag.
- `DeleteBook` uses AutoForm for the generated confirmation request.

The docs include a native source workspace for the actual `.proto`, `*_pb.ts`, `*_form.ts`, React,
and service files. It does not depend on an external playground.

## Preview snapshot

The repository is public, but no stable release tag has been published. Install this immutable
preview commit directly from GitHub; it is not a released 1.0 contract:

```json
{
  "registries": {
    "@protoform": "https://raw.githubusercontent.com/malinskibeniamin/protoform/9666e83796b9104b7af4f5e1385f1b7e7c793285/public/r/{name}.json"
  }
}
```

```bash
bunx shadcn@latest add @protoform/protoform
bunx shadcn@latest add @protoform/bookstore
bunx shadcn@latest add @protoform/protoc-gen-protoform
```

Useful items:

| Item                        | Source copied into the app                                       |
| --------------------------- | ---------------------------------------------------------------- |
| `protoform-foundation`      | Framework-neutral field model and Standard Schema adapters       |
| `hook-runtime`              | Hook conversion, Protovalidate, field masks, and Connect errors  |
| `protoform-core`            | Protobuf conversion, validation, and `useProtoForm` without UI   |
| `protobuf-provider`         | Full schema/UI parsing, annotations, AIP metadata, and workflows |
| `use-proto-form`            | Native React Hook Form integration                               |
| `use-proto-form-tanstack`   | Native TanStack Form integration                                 |
| `protoform-react`           | React Hook Form AutoForm using a consumer-owned UI component map |
| `protoform-ui-sdk-tanstack` | Opt-in SDK controls with TanStack Charts; no Recharts            |
| `protoform-ui-sdk`          | Explicit Recharts fallback with the existing chart API           |
| `protoform-shadcn`          | Base UI default controls and AutoForm map                        |
| `protoform-shadcn-tanstack` | Base UI defaults with TanStack Charts                            |
| `protoform-ui-sdk-host`     | Editable adapter for host-owned UI SDK controls                  |
| `auto-form-tanstack`        | TanStack Form AutoForm                                           |
| `protoc-gen-protoform`      | Source-copy Buf plugin                                           |
| `bookstore`                 | Complete five-RPC example                                        |

To test newer changes, build the registry locally with
`bun install --frozen-lockfile && bun run registry:build`.

## Compatibility

The preview targets:

- React 19.2 or later within major version 19;
- Protobuf-ES 2.13 or later within major version 2;
- Protovalidate 1.2 or later within major version 1;
- React Hook Form 7.81 or later within major version 7;
- TanStack Form 1.33 or later within major version 1 for its native adapter.

Formik 2.4 and Final Form 5 validation adapters remain supported. The canonical runtime target is
Protobuf-ES v2; the v1 bridge is migration-only. See [SECURITY.md](SECURITY.md) for the supported
release and security-reporting policy.

## Versioning and updates

Protoform follows shadcn's source-distribution model:

- the hosted registry exposes current source;
- Git tags are immutable release snapshots;
- consumers choose when to run `shadcn add` again and review the source diff.

Until a release exists, pin a reviewed commit. After a tag is published, its name can replace the
commit in this URL:

```json
{
  "registries": {
    "@protoform": "https://raw.githubusercontent.com/malinskibeniamin/protoform/9666e83796b9104b7af4f5e1385f1b7e7c793285/public/r/{name}.json"
  }
}
```

```bash
bunx shadcn@latest add @protoform/protoform
```

No npm registry, GitHub Packages credentials, account, or Protoform-owned domain is required.

## Development

```bash
bun install
bun run proto:generate
bun run registry:build
bun run test
bun run test:conformance
bun run typecheck
bun run lint
bun run build
```

`bun run dev` serves the Blume docs. The hosted examples use in-browser Connect transports, so the
production docs and registry deploy as one static artifact. `bun run examples:server` remains
available for real-network integration testing during local development.

CI validates documentation deterministically through Blume build, audit, and type-check commands.
The AI-assisted `bun run docs:blume:eval` command remains available as an optional local maintainer
tool; it is not part of CI or the release gate.

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request and [SUPPORT.md](SUPPORT.md)
before asking for help. Report vulnerabilities through the private process in
[SECURITY.md](SECURITY.md), never through a public issue.

Maintainers: follow [the release runbook](docs/RELEASING.md) and complete the
[open-source release checklist](docs/OPEN_SOURCE_RELEASE_CHECKLIST.md). Preparing a release never
changes repository visibility.

## License

[MIT](LICENSE). See [third-party notices](THIRD_PARTY_NOTICES.md) for code under additional
compatible licenses.

### Experimental JavaScript rules

[`protoform-quickjs`](docs/QUICKJS.md) adds opt-in, experimental JavaScript presentation rules for reviewed procedural policies. CEL remains the default for ordinary conditional fields. Existing forms do not load QuickJS. See the [order review example](examples/quickjs/README.md) and [runtime limits](docs/QUICKJS.md#execution-and-failure-boundary) before adopting it.
