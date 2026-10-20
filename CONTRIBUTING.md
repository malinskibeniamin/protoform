# Contributing to Protoform

Thanks for contributing. Protoform accepts focused issues and pull requests on a best-effort basis.

## Before changing code

1. Search existing issues and documentation.
2. Open an issue before a breaking public contract, new dependency, or large UI direction.
3. Keep generated files and registry output synchronized with their sources.

## Development

Requirements: Bun 1.4.3, Node.js 26, Git, and Buf through the checked-in Bun dependency.

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

## Analyze test builds with Rsdoctor

Rsdoctor 2.0 is opt-in for Rstest's Rspack builds. It does not analyze the Astro/Vite
documentation build or change normal test commands.

Choose `unit`, `integration`, `conformance`, or `browser`, then pass any Rstest filters or flags:

```bash
bun run test:rsdoctor integration examples/catalog/capability-demo.test.tsx
bun run test:rsdoctor unit --watch
```

Each suite writes `rsdoctor-report.html` and `rsdoctor-data.json` under
`artifacts/rsdoctor/<suite>/`. Open the HTML file locally for loader and plugin timings,
dependency analysis, and module and chunk graphs. Tree-shaking and Brotli collection are
enabled, but depend on compiler support. Rstest uses a watching compiler even for one-time
runs, so Rsdoctor skips compressed sizes; test reports are not production bundle measurements.
Reports are gitignored and overwritten on subsequent builds; copy a report directory before
comparing runs. Keep reports private:
they include local paths, dependency details, and build configuration.

Use the pinned Agent CLI to query JSON without starting a report server:

```bash
bun run rsdoctor:agent chunks list --data-file artifacts/rsdoctor/integration/rsdoctor-data.json
bun run rsdoctor:agent bundle optimize --data-file artifacts/rsdoctor/integration/rsdoctor-data.json
bun run rsdoctor:agent list
```

Report generation starts no browser or persistent report server. The script uses
`PROTOFORM_RSDOCTOR` instead of `RSDOCTOR` to avoid automatically profiling Rstest's internal
setup compilers. Normal test builds load no Rsdoctor runtime. Profiling disables persistent
build caching to collect fresh reports. The integration reapplies `disableClientServer` after
construction because Rsdoctor 2.0.0 overrides it when `RSTEST=true`; otherwise profiling leaves
a server open after tests.
Rsdoctor requires Node.js `^20.19.0 || >=22.12.0` and Rspack 2 or later; the project's
Node.js 26 and Rstest dependencies meet these requirements. See the
[Rsdoctor 2.0 release notes](https://rsdoctor.rs/blog/release/release-note-2_0) and
[Rstest profiling guide](https://rstest.rs/guide/debug/profiling) for details.

## Key-free documentation features

Blume enables PDF and EPUB page exports, GitHub source-edit links, git-derived update dates,
browser-language routing, and all 18 generated API sample languages. These features require no
API keys and keep the Cloudflare Pages build static. PDF uses the browser print dialog; EPUB
downloads only the current page. Choosing a language explicitly overrides automatic routing;
deep links are never rerouted. Update dates need git history (`fetch-depth: 0` in CI).

Page narration is disabled. The assistant, MCP server, analytics, consent banner, and written
feedback remain unconfigured. Default Markdown, JSON, search, and agent-skill outputs stay enabled.

## Tests and changes

- Use failing-test-first development for behavior changes.
- Co-locate unit and integration tests with their source.
- Do not edit generated files independently. Run `bun run proto:generate` or `bun run registry:build`.
- Keep public protobuf changes compatible with `bun run proto:breaking -- --against '.git#ref=origin/main'`.
- Use `type(scope): description` commit messages.
- Do not add source comments or inline lint suppressions; name code so it explains itself. New or broadened rule
  exemptions are forbidden. Fix the source instead; see [the UI quality policy](docs/ui-toolchain.md).

## Pull requests

Keep one coherent change per pull request. Explain the user impact, tests, compatibility implications,
generated output, and documentation changes. By submitting a contribution, you agree to license it
under the repository's MIT License.

Security reports must follow [SECURITY.md](SECURITY.md), not a public issue.
