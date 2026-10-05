# Security policy

## Supported versions

| Version | Supported |
| --- | --- |
| Current preview on `main` | Best-effort |
| Tagged 1.x (not yet published) | Planned |
| Earlier versions | No |

Source-copy consumers own and may modify installed Protoform files. Until the first release, security fixes land on `main`; after release they are published as
new immutable tags. Consumers must rerun `shadcn add`, inspect the diff, and merge the fix.

## Report a vulnerability

Do not open a public issue. Use
[GitHub private vulnerability reporting](https://github.com/malinskibeniamin/protoform/security/advisories/new)
with affected versions, impact, reproduction conditions, and any suggested mitigation.

The maintainer will acknowledge reports on a best-effort basis, coordinate a fix and advisory when
confirmed, and credit reporters who request attribution. No response or remediation service-level
agreement is offered.

## Dependency gate

`bun run security:audit` validates Bun’s advisory output and fails closed on unexcepted findings
or malformed results. Exceptions, if approved, must name an exact package and advisory, include a
reason, and expire in `scripts/security-audit-policy.ts`.

The remaining `braces@3.0.3` advisory [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
has no published patched version at the time of this audit. It is reachable through build tooling’s
`micromatch` / `fast-glob` chain. The maintainer approved an exception for this exact package and
advisory until **2026-11-04 (UTC)**. The script prints the exception on every audit and automatically
blocks it again at expiry. No other advisory is waived. Recheck the upstream release before the
deadline and remove this exception when a patched version is available.

Bun cannot audit the Buf-generated package registry because that registry does not support the
audit endpoint. The script preserves that warning; a passing audit is not proof that every registry
was scanned. Review Buf-generated dependencies separately.
