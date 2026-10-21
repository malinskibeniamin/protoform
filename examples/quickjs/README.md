# Experimental order review policy

This importable example demonstrates a reviewed procedural JavaScript rule, not a live inventory service or a new demo screen. Ordinary scalar conditions should continue to use Protoform's default CEL rules.

An order can contain the same SKU on multiple lines. Checking each line independently misses shortages: two lines of two books require four books, not two. [`order-review.ts`](order-review.ts) accumulates quantities per SKU with a `Map`, compares them with inventory, shows a backorder note, and disables the dispatch reference on shortage. Inconsistent inventory, unknown SKUs, invalid quantities, and integer overflow fail evaluation. Stock uses Protoform's map form shape: `[{ key: "BOOK-1", value: 3 }]`.

Given a provider with `lines`, `stock`, `backorderNote`, and `dispatchReference` fields:

```ts
import { createQuickJsFormRequest } from "@/lib/quickjs/bindings";
import { createQuickJsController } from "@/lib/quickjs/controller";
import { quickJsFieldConfig } from "@/lib/quickjs/presentation";
import { orderReviewRule } from "./order-review";

const controller = createQuickJsController(); // One per mounted form.
const request = createQuickJsFormRequest({
  schema: provider.parseSchema(),
  rule: orderReviewRule,
  values: currentFormValues,
  valueFields: ["lines", "stock"],
});
await controller.update(request); // Call immediately on each input/schema/rule change.
const state = controller.getSnapshot();
const fieldConfig = quickJsFieldConfig(state.presentation, originalBaseConfig);
// Apply fieldConfig to AutoForm. Render state.error and pending states visibly.
// Dispose the controller when the host form is destroyed.
```

Copy the example's rule into the host's reviewed catalog; it is not installed by the registry item. Use the existing provider's `protoToFormValues` before binding protobuf messages. Only line items and stock enter the rule: note drafts, payment tokens, provider descriptors, and network capabilities stay in the host. Presentation targets still come from the whole schema, including unset fields.

CEL can implement equivalent policy. This example's case for JavaScript is the explicit accumulation algorithm, not a claim of greater expressiveness or existing customer adoption. Rules are synchronous function expressions; host imports, closures, and arbitrary JavaScript packages are not automatically available in the guest.

This is presentation only. Revalidate quantities and stock server-side, reserve inventory transactionally, and project the actual submission payload in the host. Hiding a note does not clear it; disabling a reference does not authorize dispatch. Read the [controller lifecycle and resource limitations](../../docs/QUICKJS.md) before integration.

## Verify

```sh
bun run test:quickjs
```

The real Chromium/WASM-worker integration covers duplicate lines exceeding stock, exactly covered demand, unknown-SKU failure/recovery, and exclusion of host-only values from the accepted snapshot. AutoForm's adapter integration is separately covered by `presentation.integration.test.tsx`.
