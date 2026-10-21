# Narrow CI memory repair

Final candidate: 46d44aaf1a0bd2527692b1d8a092ca09b3047e46. Compared with captured UI candidate 3727730, only .github/workflows/quality.yml changes (two added lines); all rendering source, registry content, dependencies, tests, assertions, timeouts, permissions, triggers and artifacts are identical.

The first hosted exhaustive run passed all 747 E2E cases, then Node aborted during the strict isolated docs typecheck at its 2048 MiB old-space limit. Local `NODE_OPTIONS=--max-old-space-size=2048 bun run docs:blume:check` reproduces the heap OOM; the same command at4096 MiB reports zero errors/warnings/hints across673 files. The workflow now grants the quality command that bounded4096 MiB maximum. No assertion or diagnostic is suppressed and no timeout/retry is changed.

Only the trusted manual/scheduled quality job is affected. It checks out its chosen revision with the existing pinned actions and contents:read permissions. No fork-triggered privileged code, credentials, cache/artifact consumer or external input is added. The fixed constant NODE_OPTIONS is not an expression or untrusted shell input.

Node’s max-old-space-size is measured in MiB: https://nodejs.org/api/cli.html#--max-old-space-sizesize-in-mib
