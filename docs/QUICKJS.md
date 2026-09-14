# Optional JavaScript presentation rules

`protoform-quickjs` is an opt-in source registry item for applications that receive JavaScript form rules at runtime. Use existing CEL rules for ordinary conditional forms. Neither basic Protoform nor future MCP/A2A input adapters require this item.

Status: initial integration, verified with Chromium and Vite. This is not a security certification or universal bundler-support claim.

## Install

With the `@protoform` registry configured in `components.json`:

```sh
bunx shadcn@latest add @protoform/protoform-quickjs
```

This installs editable `lib/quickjs` source and `quickjs-emscripten@0.32.0`. It does not install React or AutoForm. Install your preferred AutoForm item separately. Existing items do not depend on QuickJS.

## Evaluate a complete rule

```ts
import { evaluateQuickJsInWorker } from "@/lib/quickjs/client";
import { quickJsFieldConfig } from "@/lib/quickjs/presentation";

const controller = new AbortController();
const presentation = await evaluateQuickJsInWorker(
  {
    fields: ["accountType", "companyName", "personalName"],
    values: { accountType: "business" },
    source: `form => ({ fields: {
      companyName: { visible: form.accountType === "business" },
      personalName: { visible: form.accountType === "personal" }
    } })`,
  },
  { signal: controller.signal },
);

const fieldConfig = quickJsFieldConfig(presentation, {
  companyName: { label: "Company name" },
  personalName: { label: "Personal name" },
});
// Supply fieldConfig to your existing <AutoForm fieldConfig={fieldConfig} ... />.
```

The host owns the `fields` allowlist. Derive it from your schema, not the generated script or current values: an unset field is still a valid field. Version one accepts flat field names and string, finite-number, boolean, or null values. Nested objects, arrays, dates, bytes, and protobuf messages must be explicitly projected by the host. Unknown inputs and output fields are rejected, never silently ignored.

The function expression runs inside QuickJS, not browser `eval`. Return only `{ fields: { fieldName: { visible?: boolean, disabled?: boolean } } }`. Async functions, malformed source, value mutations, and unsupported output properties fail. Omitted fields/properties add no restrictions. Pass only a complete script; an open token stream is not executable input.

## Integrate with AutoForm

On every relevant `onFieldChange`, or change in the controlled `values` prop:

1. Invalidate the previous evaluation revision and abort its controller.
2. Mark dynamic logic pending. Keep user values and the last accepted presentation.
3. Evaluate a scalar snapshot in a new worker.
4. If the response still belongs to the current values/script revision, apply the entire result with `quickJsFieldConfig(result, originalBaseConfig)`.
5. On failure, show an error and retry action. Keep values and prior presentation; do not treat failure as “show everything.”
6. Gate the actual submit handler while pending, failed, or stale. A disabled button alone is insufficient.

Always compose against the original base config, not the previously generated config. The helper preserves other field settings and combines restrictions: a script cannot unhide a host-hidden field or enable a host-disabled field. Existing CEL visibility, immutable, and deprecated-field handling still applies. Hidden values are retained; visibility is not conditional validation or authorization. Validate submissions on the server.

No automatic React hook or submit interception is installed. The existing form engine remains the owner of values and submission. Cancellation rejects with an error; catch it and ignore obsolete revisions rather than showing a cancelled old request as a current failure.

## Execution and failure boundary

- Each evaluation has its own worker and QuickJS runtime, disposed/terminated after success, failure, abort, or timeout.
- No host functions or module loader are installed in the guest. It has no DOM, fetch, filesystem, or credentials. The worker itself loads bundled WASM; this is distinct from granting the guest network access.
- Guest execution has a 50 ms cooperative deadline, 8 MiB heap setting, and 256 KiB stack setting. These are not limits on total browser memory.
- A host timer terminates the worker after 5 seconds, including startup and WASM loading. `timeoutMs` accepts 1–10000 ms. Browser scheduling/background throttling can delay timers; this is not a real-time deadline.
- Source, serialized values, and serialized output are limited to 16,384 UTF-16 code units; at most 200 explicit fields. Output size is checked after guest serialization and before returning its result.
- Invalid output is rejected as a whole. Guest exceptions are not returned with stack traces or input values.
- Schema-valid output can still be logically wrong. Review generated rules and do not send secrets into the snapshot.

## Bundlers and CSP

The default client uses `new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })`. Vite's development and production worker bundling are exercised by verification. Other frameworks may require a custom worker entry or asset setup; pass `createWorker` to override construction. Never fall back to evaluating on the UI thread.

Serve worker and WASM assets under your application's CSP. Test your deployment's `worker-src`, script/WASM compilation policy, asset base path, and cold-start latency. Restrict approved asset origins instead of broadly relaxing CSP.

## Verify

```sh
bun run test:unit registry/base-nova/protoform/lib/quickjs
bun run test:integration registry/base-nova/protoform/lib/quickjs/presentation.integration.test.tsx
bun run test:quickjs
bun run registry:build
bun run registry:smoke
bun run registry:consumer-smoke
```

This registry implementation replaces the original standalone experiment. No MCP, A2A, or WebMCP adapter ships in this item.

Upstream runtime API: https://github.com/justjake/quickjs-emscripten
