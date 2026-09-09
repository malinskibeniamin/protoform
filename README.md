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
registry URL shown under [Stable release](#stable-release) before installing.

## Bring your own registry and theme (unreleased)

The changes in this branch are not in the immutable `v1.0.0` snapshot below. Use a registry
built from this branch to try them.

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

### Existing Radix-style shadcn components

```bash
bunx shadcn@latest add @protoform/protoform @protoform/protoform-shadcn-host
```

The optional `protoform-shadcn-host` item installs one editable adapter file, not primitives.
It imports your local alert, button, calendar, checkbox, collapsible, field, input, input-group,
popover, radio-group, select, slider, switch, tabs, textarea, toggle, toggle-group and tooltip
modules. Install any missing modules from **your** registry, for example
`bunx shadcn@latest add @company/input @company/button`. Remove unused imports and entries
from the adapter if you only need a smaller set.

```tsx
import { AutoForm } from "@/features/auto-form/host";
import { shadcnHostComponents } from "@/features/auto-form/shadcn-host";

<AutoForm components={shadcnHostComponents} schema={RequestSchema} />;
```

The adapter composes label, copy feedback, and nullable protobuf selections without modifying
primitives. Base UI and other custom APIs may require a different mapping; a registry URL alone
does not make those APIs compatible. Do not change your primitives to match Protoform.

### Custom controls and minimal forms

Pass a component map directly to `AutoForm` when using a different UI API. Only controls rendered
by your form need entries; the host entrypoint does not eagerly import your UI library. The
`ui-props.ts` file describes renderer inputs independently of consumer implementation types.
`testId` is translated to `data-testid` before reaching host controls.

Specialized `Combobox`, `SimpleMultiSelect`, `JSONField`, `KeyValueField`, and `Choicebox*` controls
are **not** supplied by the standard adapter. Register compatible host implementations through
`components`, or use `fieldRegistry` / `formComponents` to provide your own field renderer.
A missing control produces an actionable error naming it; supplying an updated map recovers the
form. For a minimal text form, use `modes={["simple"]}` and `showSummary={false}` to avoid requiring
tabs and summary controls.

### Existing consumers

- Keep manual hook installs unchanged.
- For host-owned UI, change the AutoForm import from `components/auto-form` to
  `components/auto-form/host` and pass `components` explicitly.
- `protoform-shadcn` remains an explicit legacy/demo bundle with the old entrypoint and customized
  UI. It is **not** the bring-your-own-registry path. Installing `protoform` no longer pulls it in.
- This initial host entrypoint uses React Hook Form v7. Existing experimental and TanStack
  AutoForm entrypoints retain their legacy default maps; their hook-only installs remain UI-free.
- Review source diffs when updating. This change does not delete old copied primitives or theme
  files from an existing app. Remove them only after checking your own references.

## Flagship example

The bookstore walkthrough connects five real RPCs to one generated contract:

- `ListBooks` and `GetBook` power the browser and detail views.
- `CreateBook` uses a two-step React Hook Form flow and an ISBN-13 CEL rule.
- `UpdateBook` derives a field mask, preserves server-owned fields, and sends an etag.
- `DeleteBook` uses AutoForm for the generated confirmation request.

The docs include a native source workspace for the actual `.proto`, `*_pb.ts`, `*_form.ts`, React,
and service files. It does not depend on an external playground.

## Stable release

Protoform 1.0 is the stable source-distribution contract. Install the immutable `v1.0.0` registry
snapshot directly from GitHub:

```json
{
  "registries": {
    "@protoform": "https://raw.githubusercontent.com/malinskibeniamin/protoform/v1.0.0/public/r/{name}.json"
  }
}
```

```bash
bunx shadcn@latest add @protoform/protoform
bunx shadcn@latest add @protoform/bookstore
bunx shadcn@latest add @protoform/protoc-gen-protoform
```

Useful items:

| Item | Source copied into the app |
| --- | --- |
| `protoform-foundation` | Framework-neutral field model and Standard Schema adapters |
| `hook-runtime` | Hook conversion, Protovalidate, field masks, and Connect errors |
| `protoform-core` | Protobuf conversion, validation, and `useProtoForm` without UI |
| `protobuf-provider` | Full schema/UI parsing, annotations, AIP metadata, and workflows |
| `use-proto-form` | Native React Hook Form integration |
| `use-proto-form-tanstack` | Native TanStack Form integration |
| `protoform-react` | React Hook Form AutoForm using a consumer-owned shadcn component map |
| `protoform-shadcn` | Explicit legacy/demo UI source |
| `protoform-shadcn-host` | Unreleased editable adapter for existing Radix-style controls |
| `auto-form-tanstack` | TanStack Form AutoForm |
| `protoc-gen-protoform` | Source-copy Buf plugin |
| `bookstore` | Complete five-RPC example |

Until the repository and tag are public, maintainers can build the same registry locally with
`bun install --frozen-lockfile && bun run registry:build`.

## Compatibility

The 1.x line supports:

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

To pin a release, point the namespace at that tag:

```json
{
  "registries": {
    "@protoform": "https://raw.githubusercontent.com/malinskibeniamin/protoform/v1.0.0/public/r/{name}.json"
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
