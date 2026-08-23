# Contributing to Protoform

Thanks for contributing. Protoform accepts focused issues and pull requests on a best-effort basis.

## Before changing code

1. Search existing issues and documentation.
2. Open an issue before a breaking public contract, new dependency, or large UI direction.
3. Keep generated files and registry output synchronized with their sources.

## Development

Requirements: Bun 1.4.0, Node.js 24, Git, and Buf through the checked-in Bun dependency.

```bash
bun install --frozen-lockfile
bun run proto:generate
bun run ci:gate
```

For the complete browser and consumer matrix:

```bash
bunx playwright install chromium firefox webkit
bun run quality:gate
```

## Tests and changes

- Use failing-test-first development for behavior changes.
- Co-locate unit and integration tests with their source.
- Do not edit generated files independently. Run `bun run proto:generate` or `bun run registry:build`.
- Keep public protobuf changes compatible with `bun run proto:breaking -- --against '.git#ref=origin/main'`.
- Use `type(scope): description` commit messages.

## Pull requests

Keep one coherent change per pull request. Explain the user impact, tests, compatibility implications,
generated output, and documentation changes. By submitting a contribution, you agree to license it
under the repository's MIT License.

Security reports must follow [SECURITY.md](SECURITY.md), not a public issue.
