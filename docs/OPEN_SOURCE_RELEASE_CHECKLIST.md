# Open-source release checklist

Keep `malinskibeniamin/protoform` private until every blocking item below is complete and the release
owner explicitly approves the visibility change.

## Repository and history — blocking

- [ ] Confirm the final `main` branch contains only intended source and generated artifacts.
- [ ] Review every remote branch and tag; delete obsolete remote refs only after explicit approval.
- [ ] Scan the working tree and all remote Git history with a current secret scanner. Investigate
  findings without copying secret values into issues or logs; rotate any exposed credential before
  rewriting history.
- [ ] Confirm the repository license and source attribution are accurate.
- [ ] Confirm contributor names, repository URLs, screenshots, fixtures, and example data are safe to
  publish.
- [ ] Have a second human review the final diff and this checklist.

Recommended secret-scan commands after installing and checksum-verifying Gitleaks:

```bash
gitleaks dir . --redact
gitleaks git . --log-opts="--remotes=origin" --redact
```

## Quality and supply chain — blocking

- [ ] `bun install --frozen-lockfile` succeeds on a clean checkout.
- [ ] `bun run release:gate` passes, including unit, integration, browser, end-to-end, docs,
  conformance, build, type, lint, registry consumer, and dependency-audit checks.
- [ ] `bun run build` succeeds and produces `dist/docs/index.html` plus `dist/r/protoform.json`.
- [ ] GitHub Actions billing is healthy and `CI` and `Quality Gate` have successful runs.
- [ ] Required actions remain pinned to reviewed full commit SHAs.
- [ ] Dependabot is enabled for Bun packages, Actions, and the docs container.
- [ ] The final release commit produces no uncommitted registry diff after `bun run registry:build`.
- [ ] `bun run packages:smoke` packs and type-checks core-only and combined React consumers.
- [ ] The `@protoform` npm scope, first-publish token, and trusted publisher settings are ready.

## GitHub settings — blocking

- [ ] Add the repository description and topics used by the README.
- [ ] Enable private vulnerability reporting, dependency graph, Dependabot alerts, security updates,
  secret scanning, push protection, and CodeQL where the account and repository visibility support
  them.
- [ ] Protect `main`: require pull requests, approvals, resolved conversations, and the `CI` check;
  prevent force pushes and deletion.
- [ ] Restrict Actions permissions to read by default, allow approved GitHub-authored actions, and
  grant write permissions only in the release workflow.
- [ ] Keep documentation CI deterministic and secret-free through the Blume build, audit, and
  type-check commands. AI-assisted documentation evaluation remains an optional local tool.

Some security features change availability after a repository becomes public. Record their desired
settings before launch, then verify them immediately after the visibility change.

## Public launch — explicit approval required

- [ ] Release owner approves making the repository public.
- [ ] Change visibility to public. This is a separate manual action, never part of a preparation PR.
- [ ] Recheck branch protection, security settings, Actions permissions, issue templates, and public
  profile metadata.
- [ ] Complete the steps in [RELEASING.md](RELEASING.md) and publish `v1.0.0`.
- [ ] Verify the tagged raw registry URL and release archive from a logged-out browser and a clean
  consumer repository.
- [ ] Announce only after the tagged install and checksum verification pass.

## Stop conditions

Do not make the repository public or publish `v1.0.0` if any secret scan is unresolved, the release
gate is red, required GitHub settings cannot be enabled, licensing is unresolved, or the release
owner has not given explicit approval.
