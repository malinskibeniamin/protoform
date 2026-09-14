import { expect, test } from "@rstest/core";
import { createDeliveryInputSession, deliveryInputRequired } from "./delivery-session";

test("a reviewed input-required request resumes the original tool with its opaque state", async () => {
  const calls: unknown[] = [];
  const session = createDeliveryInputSession(
    deliveryInputRequired,
    (params) => {
      calls.push(params);
      return Promise.resolve({ content: [{ text: "Scheduled", type: "text" }], resultType: "complete" });
    },
    { orderId: "example-order" }
  );
  await expect(session.accept({ address: "", delivery: true })).rejects.toThrow("Address");
  expect(calls).toHaveLength(0);
  await session.accept({ address: "Retained draft address", delivery: false });
  expect(calls).toEqual([
    {
      arguments: { orderId: "example-order" },
      inputResponses: { delivery_details: { action: "accept", content: { delivery: false } } },
      name: "schedule_delivery",
      requestState: "opaque-server-state",
    },
  ]);
});

test.each([{ action: "decline" as const }, { action: "cancel" as const }])(
  "decline and cancel resume without content and prevent reuse",
  async ({ action }) => {
    const calls: unknown[] = [];
    const session = createDeliveryInputSession(
      deliveryInputRequired,
      (params) => {
        calls.push(params);
        return Promise.resolve(undefined);
      },
      { orderId: "example-order" }
    );
    await session[action]();
    expect(calls).toEqual([
      {
        arguments: { orderId: "example-order" },
        inputResponses: { delivery_details: { action } },
        name: "schedule_delivery",
        requestState: "opaque-server-state",
      },
    ]);
    await expect(session.accept({ delivery: false })).rejects.toThrow("closed");
    expect(calls).toHaveLength(1);
  }
);

test("unsupported server schemas are rejected rather than silently weakened", () => {
  const response = structuredClone(deliveryInputRequired);
  const incompatible = { ...response, inputRequests: { ...response.inputRequests, another_request: {} } };
  expect(() =>
    createDeliveryInputSession(incompatible, () => Promise.resolve(undefined), { orderId: "example-order" })
  ).toThrow();
});
