# Working on Protoform

- Read [CONTRIBUTING.md](CONTRIBUTING.md) and [REVIEW.md](REVIEW.md) before editing.
  Use the repository's pinned Bun and Node versions and install with `bun install --frozen-lockfile`.
- Run `bun run lint:fix` and `bun run type:check`. CI applies the same
  [Ultracite and Landmines policy](docs/ui-toolchain.md) to changes from every agent and human contributor.
  Fix the reported source; do not add lint suppressions or rule allowances.
- Keep tests beside the implementation they exercise, using `.test.ts` or `.test.tsx`
  and a runtime infix if needed. Exercise real implementations; use strict MSW at HTTP
  boundaries that need controlled responses. Await the event or operation behind an
  assertion rather than sleeping, polling a recorder, retrying, or raising its deadline.
- Let function implementations infer return types. Preserve public contracts through typed
  boundaries and compiler checks. Put rationale in the PR; keep code self-explanatory.
- Run `bun run ci:gate` before handoff and `bun run quality:gate` for runner or browser changes.
  Regenerate copied registry output with `bun run registry:build`.
