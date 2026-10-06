# Optional JavaScript presentation rules

`protoform-quickjs` is an opt-in source registry item for JavaScript form rules, complementing Protoform's existing CEL support. Neither basic Protoform nor future MCP/A2A input adapters require this item.

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

The host owns the `fields` allowlist. Derive it from your schema, not the generated script or current values: an unset field is still a valid field. Values accept strings, finite numbers, booleans, null, arrays, and plain objects. Undefined object members are omitted; undefined array entries, sparse arrays, dates, raw bytes, bigint, protobuf messages, accessors, cycles, and reserved properties are rejected. Unknown top-level inputs and output fields are rejected, never silently ignored.

The function expression runs inside QuickJS, not browser `eval`. Values and optional field metadata are recursively frozen in the guest. Return only `{ fields: { fieldName: { visible?: boolean, disabled?: boolean } } }`. Async functions, malformed source, value mutations, and unsupported output properties fail. Omitted fields/properties add no restrictions. Pass only a complete script; an open token stream is not executable input.

## Bind Protoform values

`createQuickJsFormRequest` derives presentation targets from a parsed Protoform schema, including unset fields. The required `valueFields` selection controls which top-level values reach the guest. This does not install a protobuf provider or change validation.

Given your existing provider and current form values:

```ts
import { createQuickJsFormRequest } from "@/lib/quickjs/bindings";
import { createQuickJsController } from "@/lib/quickjs/controller";

const controller = createQuickJsController();
const request = createQuickJsFormRequest({
  schema: provider.parseSchema(),
  values: currentFormValues,
  valueFields: ["accountType"], // Explicit exposure; never include credentials.
  rule: {
    id: "account-fields",
    version: "1",
    source: `(form, fields) => ({ fields: {
      companyName: {
        visible: form.accountType === "business",
        disabled: fields.companyName.type !== "string"
      }
    } })`,
  },
});
await controller.update(request);
```

The optional second guest argument is a field-name dictionary containing only `{ type: string, required: boolean }`. No labels, hints, custom data, descriptors, or host callbacks are exposed. Low-level requests can supply `fieldInfo`; existing one-argument scalar rules remain compatible. Metadata changes invalidate the controller's accepted snapshot just like rule/catalog changes.

Use **form values**, not protobuf JSON. For an existing protobuf message, use your installed provider's `protoToFormValues(schema, message)` first. The binding reuses that conversion rather than inventing a second encoding:

- Field keys follow Protoform's parsed schema, not protobuf JSON names.
- Enums remain numeric; 64-bit integers are decimal strings; bytes are base64 strings.
- Explicit `false`, `0`, empty strings, and null are retained. Unset object members are absent.
- Oneofs retain `{ case, value }`; an unset oneof becomes `{}`.
- Repeated fields remain arrays; maps retain Protoform's `[{ key, value }]` form shape; nested messages remain nested form objects.
- Well-known types retain the provider's form representation, including datetime-local timestamp strings. This is not a lossless wire or timestamp codec.

Selecting an object exposes its entire subtree. Project out nested secrets in the host before binding. Nested values are readable, but presentation targets remain top-level: no dotted/indexed field policies or value writes are supported. The binding does not validate the protobuf message or authorize submission.

## Safe controller for reviewed rules

Prefer `createQuickJsController` over manually coordinating worker promises. It is framework-independent and adds no React dependency:

```ts
import { createQuickJsController } from "@/lib/quickjs/controller";

const controller = createQuickJsController(); // One per mounted form/input request.
const rule = { id: "account-fields", version: "1", source: reviewedSource };
const request = { rule, fields: schemaFieldNames, values: scalarSnapshot };
await controller.update(request);
const state = controller.getSnapshot();
const fieldConfig = quickJsFieldConfig(state.presentation, originalBaseConfig);

// After current schema validation; pass CURRENT values, fields, and rule.
await controller.submit(currentRequest, validatedSnapshot => sendToHost(validatedSnapshot));
// When the form/request owner is destroyed:
controller.dispose();
```

The host selects `rule` from its reviewed, versioned catalog. An ID/version is identity metadata, **not proof of approval**. Do not construct it from unreviewed server or streamed model code. The low-level evaluator remains available, but this release does not certify arbitrary hostile-code execution.

- Call `update` synchronously from every input, rule, or schema-change handler, before awaiting anything. It immediately blocks submission and cancels old work. Never rely solely on a later React effect or debounce. If deferring evaluation, call `invalidate()` immediately first.
- Only the newest evaluation can become `ready`. Stale successes/failures are discarded even if an evaluator ignores cancellation.
- `getSnapshot()` is a stable, frozen external-store snapshot. React can subscribe using `useSyncExternalStore(controller.subscribe, controller.getSnapshot)`. The **host owns controller lifetime**: dispose it on unmount/request replacement; create a fresh controller when remounting. Do not reuse a disposed instance, including across Strict Mode effect setup/cleanup replays.
- `idle`, `pending`, `error`, and `disposed` block `submit`. `submit` also compares the current values, field catalog, source, and rule ID/version with the accepted snapshot, and rejects concurrent submissions. Pass the actual current snapshot, not a captured stale request.
- Catch submission/transport failures in your host UI. Evaluation failures set `state.error` to a safe message; render it with a retry action that calls `update(currentRequest)` again. No automatic retries of external side effects.
- While pending/failed, retain values and the last accepted presentation for the same rule/catalog. A changed rule/catalog clears old policies. Block submission and show pending/error UI; do not interpret cleared policies as authorization.
- `submit` passes a deep copy of the evaluated form snapshot. Validate and project the actual tool payload in the host. Do not add secrets to the sandbox snapshot just to use this guard.
- Disposal cancels evaluation, **not an already-issued tool/network call**. The host owns network cancellation, idempotency, and whether a failed call is safe to retry.

Always compose against the original base config, not the previously generated config. The helper preserves other field settings and combines restrictions: a script cannot unhide a host-hidden field or enable a host-disabled field. Existing CEL visibility, immutable, and deprecated-field handling still applies.

### Hidden values and validation

Hidden values are retained locally. The controller does not remove them from submission or change schema validation: hidden required fields can still invalidate a form. The host must define payload projection and branch clearing explicitly. Do not use visibility as authorization. Validate submissions on the server.

See the [curated MCP continuation example](../examples/mcp-input/README.md): it retains an address draft when switching to pickup, but omits that address from the accepted MCP response. Delivery requires an address through host validation, never through guest JavaScript.

## Execution and failure boundary

- Each evaluation has its own worker and QuickJS runtime, disposed/terminated after success, failure, abort, or timeout.
- No host functions or module loader are installed in the guest. It has no DOM, fetch, filesystem, or credentials. The worker itself loads bundled WASM; this is distinct from granting the guest network access.
- Guest execution has a 50 ms cooperative deadline, 8 MiB heap setting, and 256 KiB stack setting. These are not limits on total browser memory.
- A host timer terminates the worker after 5 seconds, including startup and WASM loading. `timeoutMs` accepts 1–10000 ms. Browser scheduling/background throttling can delay timers; this is not a real-time deadline.
- Source, combined serialized values/field metadata, and serialized output are limited to 16,384 UTF-16 code units; at most 200 explicit fields. Input traversal allows at most 16 levels below the value/metadata roots and 2,000 visited nodes in total. Output size is checked after guest serialization and before returning its result.
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

This registry implementation replaces the original standalone experiment. No general MCP, A2A, or WebMCP adapter ships in this item. The repository contains one separately owned, curated MCP continuation example.

Upstream runtime API: https://github.com/justjake/quickjs-emscripten
