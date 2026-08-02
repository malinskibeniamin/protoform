# Releasing Protoform

Protoform releases immutable registry source and a matching GitHub archive. The repository remains
private until every item in the [open-source release checklist](OPEN_SOURCE_RELEASE_CHECKLIST.md) is
complete.

## Prepare `1.0.0`

1. Work from a clean branch based on `origin/main`.
2. Confirm `package.json` contains version `1.0.0` and `CHANGELOG.md` describes the final contract.
3. Install exactly the reviewed dependency graph:

   ```bash
   bun install --frozen-lockfile
   bun audit
   ```

4. Regenerate and verify all distributable source:

   ```bash
   bun run registry:build
   bun run release:gate
   git diff --exit-code -- public/r
   ```

5. Run the history and working-tree secret scans from the open-source checklist.
6. Merge the reviewed preparation pull request. Do not create a tag while the repository is private
   if the public launch is not approved.

## Publish `v1.0.0`

Only the release owner performs these steps after the public-launch checklist is approved.

1. Re-run `bun install --frozen-lockfile && bun run release:gate` on the final `main` commit.
2. Replace `Unreleased` in `CHANGELOG.md` with the release date, review, merge, and re-run the gate.
3. Create and push a signed, annotated tag whose name matches `package.json`:

   ```bash
   git tag -s v1.0.0 -m "protoform v1.0.0"
   GITHUB_REF_NAME=v1.0.0 bun run release:verify-tag
   git push origin v1.0.0
   ```

4. Monitor the `Release` workflow. It verifies the tag, runs the full release gate, proves registry
   generation is reproducible, publishes the registry archive and checksum, and creates a build
   provenance attestation.
5. In a clean temporary repository, install `@protoform/protoform`, `@protoform/bookstore`, and
   `@protoform/protoc-gen-protoform` from the tagged raw GitHub URL in the README.
6. Verify the GitHub release archive checksum and confirm the copied license notices are present.

## Failure handling

- Never move or replace a published tag.
- If the workflow fails before publishing, fix the cause on `main` and create a new patch version.
- If a released artifact is unsafe, publish a GitHub security advisory, mark the affected range in
  `SECURITY.md`, and release a fixed patch. Do not silently replace artifacts.
- If GitHub raw delivery is unavailable, direct consumers to the checksum-verified release archive;
  do not create an unreviewed alternate distribution channel.
