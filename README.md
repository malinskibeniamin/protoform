# Protoform

Protoform is an MIT-licensed package and shadcn registry for building React forms from protobuf
descriptors, Protovalidate constraints, CEL rules, and Google AIP conventions.

Use the compiled packages when the application should update Protoform with a version bump:

```bash
# Manually authored protobuf forms, without AutoForm
bun add @protoform/core

# useProtoForm and React Hook Form AutoForm together
bun add @protoform/react
```

`@protoform/auto-form` is the headless renderer package for adapter authors. `@protoform/react`
depends on and re-exports both layers, while `@protoform/core` has no AutoForm dependency.

The shadcn registry remains available when a team prefers inspectable source copied into its own
repository. It can install the runtime, hooks, components, generator, or examples independently.

## Package UI boundary

The compiled AutoForm renderer does not import application-local shadcn modules. Pass a local
component map instead:

```tsx
import { AutoForm } from "@protoform/react";
import { protoformComponents } from "./protoform-components";

<AutoForm components={protoformComponents} schema={RequestSchema} />;
```

## Source install with existing shadcn components

Install `protoform-react` when the app already owns its shadcn-compatible components. This copies
the renderer and a typed component map, but no UI implementations:

```bash
bunx shadcn@latest add @protoform/protoform-react
```

The default `shadcnUIComponents` map points at the app's existing `@/components/ui/*` aliases. A
vendor can replace individual entries or provide a complete map without changing Protoform's
renderer:

```tsx
import { AutoForm, shadcnUIComponents, type ProtoformUIComponentMap } from "@/components/auto-form";
import { Button } from "@/components/ui/button";

const components = {
  ...shadcnUIComponents,
  Button,
} satisfies ProtoformUIComponentMap;

<AutoForm components={components} schema={RequestSchema} />;
```

Install `protoform-shadcn` instead when the app wants Protoform's optional default UI source.

## Flagship example

The bookstore walkthrough connects five real RPCs to one generated contract:

- `ListBooks` and `GetBook` power the browser and detail views.
- `CreateBook` uses a two-step React Hook Form flow and an ISBN-13 CEL rule.
- `UpdateBook` derives a field mask, preserves server-owned fields, and sends an etag.
- `DeleteBook` uses AutoForm for the generated confirmation request.

The docs include a native source workspace for the actual `.proto`, `*_pb.ts`, `*_form.ts`, React,
and service files. It does not depend on an external playground.

## Stable release

Protoform 1.0 is the stable package and source-distribution contract. Package releases use the same
version as the immutable Git tag. Install the `v1.0.0` registry snapshot directly from GitHub:

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
| `protoform-shadcn` | Optional default shadcn UI source |
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

- compiled packages use SemVer and update through the application's package manager;
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
