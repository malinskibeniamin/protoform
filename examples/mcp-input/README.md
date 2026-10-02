# Curated MCP input continuation

This is a **bounded host-integration example**, not a general MCP client, live server connection, or arbitrary JSON Schema adapter. It handles one reviewed `schedule_delivery` tool's form request. Unknown schemas and extra requests fail closed.

The [MCP 2026-07-28 tools specification](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) defines `input_required`, `inputRequests`, and continuation using `inputResponses` plus opaque `requestState`. Your authenticated SDK client owns transport, required metadata, fresh JSON-RPC IDs, and server identity. This example operates above that boundary.

## Flow

1. The host calls `schedule_delivery` for a known order.
2. The server asks for delivery details through a form-mode `elicitation/create` input request.
3. The host checks the request against the reviewed schema, renders `session.schema` with AutoForm, and waits for explicit human action.
4. Accept validates the values and resumes the original tool with the matching request key/state. Decline/cancel resume without content.
5. A returned result consumes this session. Another input-required round needs a new session.

```ts
const controller = createQuickJsController(); // Optional. Omit to show both fields.
const session = createDeliveryInputSession(
  inputRequiredResult,
  params => authenticatedClient.callTool(params),
  { orderId, controller },
);

// Await/update from the host's initial setup and every field change.
await session.update(currentValues);
// AutoForm: schema={session.schema}
// fieldConfig={quickJsFieldConfig(controller.getSnapshot().presentation, baseConfig)}
// React: useSyncExternalStore(controller.subscribe, controller.getSnapshot)

try {
  const toolResult = await session.accept(currentValidatedValues);
  // Handle success, tool errors, and another input-required round in the host.
} catch (error) {
  // Show a visible error. Never retry side-effecting tool calls automatically.
  showError(error);
}
// Explicit user alternatives: await session.decline() or await session.cancel().
// Owner cleanup: controller.dispose(). This does not undo a tool invocation.
```

Imports are from `delivery-session.ts` and Protoform's optional `lib/quickjs/controller` / `presentation` source. The authenticated client and error UI above belong to your application.

## Deliberate policy

- QuickJS uses an application-owned rule (`deliveryRule`), not code received from the server. It only hides/shows the address.
- Without a controller, validation and continuation still work; both fields remain available.
- A hidden address draft stays in local form values but is omitted for pickup. Delivery requires a nonblank address, maximum 500 characters. Unknown fields are rejected.
- The opaque server state and original tool arguments never enter QuickJS. Supply the original order ID from host context, not user-controlled form fields.
- Only one continuation is allowed at a time. A successful response closes the session. A network failure remains ambiguous: host decides whether manual retry is safe, using server idempotency policy.
- Disable controls during continuation; invalidate evaluation before deferred input changes. Guard the handler, not just the button.
- The input schema is intentionally pinned. Supporting a new field/schema means reviewing the provider and validator together—not ignoring constraints.

## Evidence and limits

```sh
bun run test:unit examples/mcp-input
bun run test:integration examples/mcp-input
bun run test:quickjs
```

The AutoForm integration test exercises human input and validates the exact continuation arguments against a simulated host callback. Playwright separately exercises the real QuickJS/WASM worker and controller. No live MCP server, OAuth flow, arbitrary schema renderer, A2A adapter, or production security audit is claimed.
