# Protoform

Protoform is an MIT-licensed shadcn registry for building React forms from protobuf descriptors,
Protovalidate constraints, CEL rules, and Google AIP conventions.

The project distributes source, not Protoform npm packages. `shadcn add` copies the runtime, hooks,
components, generator, or examples into the consuming repository so teams can inspect and adapt
everything they ship.

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
| `protoform-core` | Framework-neutral field model and Standard Schema adapters |
| `protobuf-provider` | Protobuf-ES v2, Protovalidate, CEL, field masks, and Connect errors |
| `use-proto-form` | Native React Hook Form integration |
| `use-proto-form-tanstack` | Native TanStack Form integration |
| `auto-form` | React Hook Form AutoForm |
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
