# QuickJS dynamic-form prototype

Question: can actual QuickJS-in-WASM evaluate arbitrary synchronous JavaScript against a form snapshot and return validated visibility/disabled state without granting host capabilities?

Verdict: PASS for this bounded executable model. Not a production security certification or AutoForm/browser integration.

## Run

From the repository root:

```sh
cd prototypes/quickjs-form && bun install --frozen-lockfile && bun run demo
```

Verification: `bun run test && bun run lint:fix && bun run type:check`.

## Contract

- Source is a complete function expression: `(form) => ({ fields: { companyName: { visible: true, disabled: false } } })`.
- Flat scalar values are the known-field catalog for this experiment. Production needs a separate schema catalog, including fields absent from values.
- Guest receives a frozen, serialized snapshot. No host functions or module loader are installed.
- Fresh QuickJS runtime/context each evaluation; always disposed after execution.
- 8 MiB QuickJS heap limit; 256 KiB stack setting; 50 ms cooperative interrupt deadline. These are not a hard process/WASM-memory or end-to-end latency guarantee.
- Source, serialized input, serialized output each capped at 16,384 UTF-16 code units. Output is serialized inside the guest; host rejects oversized strings after transfer.
- Only known field names and boolean visible/disabled properties accepted. All-or-nothing result validation. Omitted properties reset to visible=true/disabled=false for this prototype only; production must compose with immutable, authorization, and other host restrictions instead of overriding them.
- Stream fragments explicitly marked incomplete do not execute. The caller owns the completion signal; this is not an LLM streaming transport/parser.
- Controller retains last accepted presentation on failure, records a visible-to-consumer error, and blocks submission readiness. User edits invalidate pending results. Hidden values retained, never automatically erased.
- `canSubmit` means dynamic-logic readiness only. This model has no business/schema validation or submission endpoint.

## Evidence

18 Vitest tests against the real WASM engine (no mocked evaluator) pass. RED failures observed before the evaluator, controller recovery, and streaming/revision implementations. Additional boundary regression checks cover malformed output, invented fields, incomplete source, throws, loops, allocation exhaustion, promises, mutation attempts, unavailable network/DOM/filesystem APIs, and state isolation. Biome and tsgo pass in this isolated package.

`evidence-demo.txt` records the seven-step actual consumer walkthrough: personal → business → company entered → partial stream → hallucinated field → infinite loop → recovery. Loop interrupted at approximately 51 ms in the first run. Company value remains Acme across failure and hiding; no partial invalid proposal applies.

Root repository checks were attempted: lint could not resolve `ultracite/biome/core` (root dependencies absent); `type:check` is not a root script. Root checks do not validate this gitignored package; isolated checks above do. Production source and root dependency manifests remain unchanged.

## Not proven / next production decisions

- Browser worker isolation, hard watchdog termination, responsiveness, CSP, asset loading, cold-start size, and sustained memory behavior. This Bun prototype evaluates synchronously and can block its host while executing; browser integration should not copy that onto the UI thread.
- No React renderer, Protoform integration, WebMCP adapter, live AI, external data calls, value mutations, or nested/protobuf value codec.
- No claim that a sandbox detects logically wrong rules. Generated code still needs provenance, review/approval policy, semantic tests, and authoritative server validation.
- This is arbitrary JavaScript without browser/Node APIs, not arbitrary npm packages or platform scripts running unchanged.

## Sources

QuickJS API/lifecycle/limits: https://github.com/justjake/quickjs-emscripten (installed pinned version 0.32.0; see package.json and bun.lock).

Existing Protoform presentation seam: `registry/base-nova/protoform/components/auto-form/renderers/shared.ts`, `useFieldPresentation`; located through TraceDecay (~6.7k context tokens saved). Production code was not modified.

Retention: published for review on a draft feature-branch PR under `prototypes/quickjs-form`. Original local evidence remains in `.context/prototypes/quickjs-form`. Do not merge prototype-only files into main; use the findings to design a production implementation.
