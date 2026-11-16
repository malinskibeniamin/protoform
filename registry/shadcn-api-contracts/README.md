# Shadcn Base UI API contracts

Independent compiler fixtures for the 63 official Base UI primitives, pinned to shadcn/ui revision `ba1503c64472b82256d9de95e2e62c5901a38e8b` and the base-nova registry retrieved on 2026-10-21. The catalog and canonical source blob IDs are in ../shadcn-catalog.json; source-digests.json pins the exact styled registry input bytes.

These declarations derive from the official source, not Protoform implementations. MIT; the full upstream notice is in ../../LICENSES/shadcn-MIT.txt. They are test-only: not included in any installed registry item. No runtime source or additional dependency ships with these fixtures.

../shadcn-api-contract.test.ts checks all 388 exports: 385 callable APIs, two exported types and the toast manager. Component assertions require every official prop object to be accepted by the local implementation, while allowing additional Protoform props. Other functions and public types preserve their signatures. Root source and test typechecks execute these compiler assertions; running the unit file alone does not prove type compatibility. Generic inference and runtime semantics have separate public-component tests and installed-consumer probes.

## Reproduction

Retrieve the official source with the existing CLI and configured Base UI style:

```sh
bunx --no-install shadcn view $(bun -e 'const c = await Bun.file("registry/shadcn-catalog.json").json(); console.log(c.components.map(x => x.name).join(" "))') > .context/shadcn-source.json
bun scripts/generate-shadcn-api-contracts.ts .context/shadcn-source.json
bun run type:check
```

The generator rejects any input whose SHA-256 differs from source-digests.json. It performs no network requests. A moving registry may no longer serve the pinned source: recover the archived matching input rather than silently changing digests. An upstream refresh requires reviewing the source revision, input hashes, complete contract diff, adapters, installed-consumer smoke and browser behavior together.

The installed TypeScript compiler emits declarations; implementation-only diagnostics from shadcn's icon/style generator imports do not affect the public signatures. Normalization changes imports to type-only, retains useRender/Toast return types through their public aliases, removes redundant default ReactElement type arguments, and makes message-scroller re-exports explicit. Repository format/lint fixes are applied. No public parameter is narrowed to unknown and no lint exemptions are used. Base UI dependency types remain referenced, so dependency upgrades also exercise these contracts.

Compiler fixtures prove acceptance, not identical visuals, every possible interaction sequence or third-party APIs outside the pinned Base UI catalog. See the bundled SHADCN_COMPONENTS.md for intentional extensions and migration notes.
