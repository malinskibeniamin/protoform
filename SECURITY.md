# Security policy

## Supported versions

| Version                        | Supported   |
| ------------------------------ | ----------- |
| Current preview on `main`      | Best-effort |
| Tagged 1.x (not yet published) | Planned     |
| Earlier versions               | No          |

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

The former exceptions for `braces` ([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm))
and `sprintf-js` ([GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c))
have been removed. GitHub withdrew those advisories on 2026-10-23 and 2026-10-22, respectively.
This is not a claim that the packages received patches. No advisory is currently waived;
new or reinstated findings remain blocking.

Bun cannot audit the Buf-generated package registry because that registry does not support the
audit endpoint. The script preserves that warning; a passing audit is not proof that every registry
was scanned. Review Buf-generated dependencies separately.
