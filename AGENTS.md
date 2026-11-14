# Working agreements

Use the grill-me skill for material open decisions and ask follow-up questions as needed. Explore the codebase first when it can answer the question.

Name new worktrees `beniamin-malinski/ticket-name-if-any/feature-description`.

## UI SDK

Before changing UI SDK code, read `node_modules/@ui-sdk/react/docs/llms.txt` and the version-matched skill at `node_modules/@ui-sdk/core/skills/ui-sdk/SKILL.md`. Read only the relevant component pages. For new primitives, search `node_modules/@ui-sdk/core/docs/core.md` by heading and read `node_modules/@ui-sdk/react/docs/rendering.md`.

Own React rendering adapters over public `@ui-sdk/core` component primitives, using `@ui-sdk/react/primitive` for rendering. Reuse upstream state and behavior compositions rather than rewriting them. Existing SDK React component wrappers are the migration baseline, not the target architecture. Do not import private or renderer-only core APIs. Retain SDK React adapters only for proven public-API gaps, with a runtime reproduction and an explicit documented boundary. Keep React rendering and semantic-token styling separate from the framework-independent primitive. Declare agent actions explicitly and validate their arguments.

Agent sessions are opt-in. Keep authorization and human confirmation application-owned; never automatically register WebMCP tools. Preserve secret/hidden/confirmation attributes through wrappers. Treat history as UI-value restoration, not a transaction or a way to undo network side effects.

New primitives need the SDK pattern, server, and direction checks plus browser coverage at their real consuming page. Agent changes need read-back assertions, cancellation, redaction, confirmation, history and disposal checks. Use the scripts in `package.json`; `bun run quality:gate` is the final local gate. See `docs/verification/host-registry.md` for installed-consumer verification.
