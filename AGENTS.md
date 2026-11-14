# Working agreements

Use the grill-me skill for material open decisions and ask follow-up questions as needed. Explore the codebase first when it can answer the question.

Name new worktrees `beniamin-malinski/ticket-name-if-any/feature-description`.

## UI SDK

Before changing UI SDK code, read `node_modules/@ui-sdk/react/docs/llms.txt` and the version-matched skill at `node_modules/@ui-sdk/core/skills/ui-sdk/SKILL.md`. Read only the relevant component pages. For new primitives, search `node_modules/@ui-sdk/core/docs/core.md` by heading and read `node_modules/@ui-sdk/react/docs/rendering.md`.

Rebuild the control layer at the explicitly agreed public `@ui-sdk/core` boundary. Existing React SDK component wrappers are the migration baseline, not the target architecture. Compose public behaviors rather than hand-rolling focus, selection or popup handling. Keep React rendering and semantic-token styling separate from the framework-independent primitive. Declare agent actions explicitly and validate their arguments.

Agent sessions are opt-in. Keep authorization and human confirmation application-owned; never automatically register WebMCP tools. Preserve secret/hidden/confirmation attributes through wrappers. Treat history as UI-value restoration, not a transaction or a way to undo network side effects.

New primitives need the SDK pattern, server, and direction checks plus browser coverage at their real consuming page. Agent changes need read-back assertions, cancellation, redaction, confirmation, history and disposal checks. Use the scripts in `package.json`; `bun run quality:gate` is the final local gate. See `docs/verification/host-registry.md` for installed-consumer verification.
