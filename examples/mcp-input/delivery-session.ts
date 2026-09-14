/** Curated MCP 2026-07-28 input_required example, not a general MCP/schema adapter. */
import { z } from "zod";
import type { SchemaProvider, SchemaValidation } from "@/registry/base-nova/protoform/lib/core/field-model";
import type {
  createQuickJsController,
  ReviewedQuickJsRequest,
} from "@/registry/base-nova/protoform/lib/quickjs/controller";

const requestedSchema = {
  additionalProperties: false,
  properties: { address: { maxLength: 500, type: "string" }, delivery: { type: "boolean" } },
  required: ["delivery"],
  type: "object",
} as const;

/** Fixture response from the host's initial schedule_delivery call. */
export const deliveryInputRequired = {
  inputRequests: {
    delivery_details: {
      method: "elicitation/create",
      params: { message: "Choose delivery or pickup", mode: "form", requestedSchema },
    },
  },
  requestState: "opaque-server-state",
  resultType: "input_required",
};

// Pin the supported schema: fail closed on additions or incompatible constraints.
const inputRequiredSchema = z.strictObject({
  inputRequests: z.strictObject({
    delivery_details: z.strictObject({
      method: z.literal("elicitation/create"),
      params: z.strictObject({
        message: z.string(),
        mode: z.literal("form"),
        requestedSchema: z.strictObject({
          additionalProperties: z.literal(false),
          properties: z.strictObject({
            address: z.strictObject({ maxLength: z.literal(500), type: z.literal("string") }),
            delivery: z.strictObject({ type: z.literal("boolean") }),
          }),
          required: z.tuple([z.literal("delivery")]),
          type: z.literal("object"),
        }),
      }),
    }),
  }),
  requestState: z.string().min(1),
  resultType: z.literal("input_required"),
});
const valuesSchema = z.strictObject({ address: z.string().max(500).optional(), delivery: z.boolean() });

/** Application-owned reviewed rule; never source code supplied by the MCP server. */
export const deliveryRule: ReviewedQuickJsRequest["rule"] = Object.freeze({
  id: "delivery-address",
  source: "form => ({ fields: { address: { visible: form.delivery === true } } })",
  version: "1",
});

export interface DeliveryContinuation {
  arguments: { orderId: string };
  inputResponses: {
    delivery_details: { action: "accept" | "decline" | "cancel"; content?: { delivery: boolean; address?: string } };
  };
  name: "schedule_delivery";
  requestState: string;
}

/** Supply a host-authenticated SDK callTool closure; it owns protocol metadata and fresh RPC IDs. */
export function createDeliveryInputSession(
  response: unknown,
  callTool: (params: DeliveryContinuation) => Promise<unknown>,
  options: { orderId: string; controller?: ReturnType<typeof createQuickJsController> }
) {
  const input = inputRequiredSchema.parse(response);
  const originalArguments = { orderId: options.orderId };
  const { controller } = options;
  let pending = false;
  let closed = false;

  function request(values: Record<string, unknown>): ReviewedQuickJsRequest {
    const parsed = valuesSchema.parse(values);
    return {
      fields: ["delivery", "address"],
      rule: deliveryRule,
      values: { address: parsed.address ?? "", delivery: parsed.delivery },
    };
  }

  function validate(values: Record<string, unknown>): SchemaValidation {
    const result = valuesSchema.safeParse(values);
    if (!result.success) {
      return {
        errors: result.error.issues.map((issue) => ({ message: issue.message, path: issue.path.map(String) })),
        success: false,
      };
    }
    if (result.data.delivery && !result.data.address?.trim()) {
      return { errors: [{ message: "Address is required for delivery", path: ["address"] }], success: false };
    }
    return { data: values, success: true };
  }

  const schema: SchemaProvider = {
    getDefaultValues: () => ({ address: "", delivery: false }),
    parseSchema: () => ({
      fields: [
        { fieldConfig: { label: "Deliver to an address" }, key: "delivery", required: true, type: "boolean" },
        {
          fieldConfig: { inputProps: { maxLength: 500 }, label: "Address" },
          key: "address",
          required: false,
          type: "string",
        },
      ],
    }),
    validateSchema: validate,
  };

  async function resume(answer: DeliveryContinuation["inputResponses"]["delivery_details"]) {
    if (pending || closed) {
      throw new Error("This input request is already submitting or closed");
    }
    pending = true;
    try {
      const result = await callTool({
        arguments: { ...originalArguments },
        inputResponses: { delivery_details: answer },
        name: "schedule_delivery",
        requestState: input.requestState,
      });
      closed = true;
      controller?.invalidate();
      return result;
    } finally {
      pending = false;
    }
  }

  return {
    async accept(values: Record<string, unknown>) {
      const validation = validate(values);
      if (!validation.success) {
        throw new Error(validation.errors.map((error) => error.message).join("; "));
      }
      const snapshot = request(values);
      const action = () => {
        const delivery = snapshot.values["delivery"] === true;
        // Hidden drafts stay local: projection is host policy, never guest output.
        const address = snapshot.values["address"];
        return resume({
          action: "accept",
          content: delivery && typeof address === "string" ? { address, delivery } : { delivery },
        });
      };
      return await (controller ? controller.submit(snapshot, action) : action());
    },
    cancel: () => resume({ action: "cancel" }),
    decline: () => resume({ action: "decline" }),
    schema,
    async update(values: Record<string, unknown>) {
      if (closed || pending) {
        throw new Error("This input request is already submitting or closed");
      }
      controller?.invalidate();
      const snapshot = request(values);
      await controller?.update(snapshot);
    },
  };
}
