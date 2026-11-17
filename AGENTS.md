# Working agreements

Use the grill-me skill for material open decisions and ask follow-up questions as needed. Explore the codebase first when it can answer the question.

Name new worktrees `beniamin-malinski/ticket-name-if-any/feature-description`.

## UI foundations

Keep `@base-ui/react` as the default UI foundation under `components/*`. Keep the form core and engine adapters independent of either UI library. Only targeted SDK additions (Rating, async loading, preferences) live under `registry/ui-sdk/protoform/components/*` and install to the configured UI alias under `sdk/`; they must not overwrite default Base UI controls or attach a second behavior owner to them. There is one canonical AutoForm and one Base UI control catalog. Do not restore SDK replacements or an alternate SDK AutoForm map. Async loading/preferences reuse native controls; only distinct additions may own SDK UI behavior.

Keep existing controls, presentation ownership, form contracts, and registry structure intact. Add SDK capabilities through small opt-in leaf items, not architectural rewrites. Share a helper only when there are genuine reusable consumers; do not relocate existing controls to create speculative sharing.

## UI SDK

Before changing UI SDK code, read `node_modules/@ui-sdk/react/docs/llms.txt` and the version-matched skill at `node_modules/@ui-sdk/core/skills/ui-sdk/SKILL.md`. Read only the relevant component pages. For new primitives, search `node_modules/@ui-sdk/core/docs/core.md` by heading and read `node_modules/@ui-sdk/react/docs/rendering.md`.

For the opt-in SDK controls, own React rendering adapters over public `@ui-sdk/core` component primitives, using `@ui-sdk/react/primitive` for rendering. Reuse upstream state and behavior compositions rather than rewriting them. Do not add SDK replacements for controls already owned by the canonical Base UI catalog. Do not import private or renderer-only core APIs. Retain SDK React adapters only for proven public-API gaps, with a runtime reproduction and an explicit documented boundary. Keep React rendering and semantic-token styling separate from the framework-independent primitive. Declare agent actions explicitly and validate their arguments.

Agent sessions are opt-in. Keep authorization and human confirmation application-owned; never automatically register WebMCP tools. Preserve secret/hidden/confirmation attributes through wrappers. Treat history as UI-value restoration, not a transaction or a way to undo network side effects.

New primitives need the SDK pattern, server, and direction checks plus browser coverage at their real consuming page. Agent changes need read-back assertions, cancellation, redaction, confirmation, history and disposal checks. Use the scripts in `package.json`; `bun run quality:gate` is the final local gate. See `docs/verification/host-registry.md` for installed-consumer verification.
