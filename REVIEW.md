# UI review

Review the generator and authored source, then verify the copied registry output. A generated-looking
filename is not an exemption: only `scripts/generated-sources.json` defines reviewed outputs.

- Require current `lint:fix`, `type:check`, Doctor and consumer/browser evidence. Never fix a gate by
  adding suppressions, file waivers, disabling checks or accepting snapshots without inspection.
- Review every new or removed installed rule individually. Keep one owner for conflicting conventions;
  preserve React Compiler behavior and prove generic/public type contracts with compiler assertions.
- Exercise form defaults, reset/dirty state, oneofs, repeated fields and every validation message.
  Check keyboard/focus, accessible errors, loading/failure/retry, mobile overflow and source-copy imports.
- Keep stable and experimental form adapters separate. Compare registry/protobuf artifacts with their
  owning generators; do not hand-edit generated output to hide a failure.
- For upgrades, inspect package integrity, peers, native binaries and patches. A canary needs an exact
  pin. Patches need a reproduced failure, passing consumer evidence and an upstream removal condition.
- Report uncertainty and existing audit limitations. A passing gate is not proof that policy files
  cannot be edited; preserve required CI, current approvals and resolved-review requirements.

State impact, verification, compatibility risk and how to revert in the pull request. One coherent
UI/tooling change per PR; no protocol or backend changes without their own compatibility evidence.
