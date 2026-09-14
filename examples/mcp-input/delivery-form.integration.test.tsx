import { expect, test } from "@rstest/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState, useSyncExternalStore } from "react";
import { AutoForm } from "@/registry/base-nova/protoform/components/auto-form";
import { Button } from "@/registry/base-nova/protoform/components/button";
import { createQuickJsController } from "@/registry/base-nova/protoform/lib/quickjs/controller";
import { quickJsFieldConfig } from "@/registry/base-nova/protoform/lib/quickjs/presentation";
import { createDeliveryInputSession, deliveryInputRequired } from "./delivery-session";

test("curated AutoForm collects input and resumes the MCP tool only after valid human submission", async () => {
  const calls: unknown[] = [];
  // DOM test transport seam; real WASM worker/controller execution is covered by Playwright.
  const controller = createQuickJsController({
    evaluate: ({ values }) => Promise.resolve({ address: { visible: values["delivery"] === true } }),
  });
  const session = createDeliveryInputSession(
    deliveryInputRequired,
    (params) => {
      calls.push(params);
      return Promise.resolve({ content: [{ text: "Scheduled", type: "text" }], resultType: "complete" });
    },
    { controller, orderId: "example-order" }
  );
  const draft: Record<string, unknown> = { address: "", delivery: false };
  await session.update(draft);
  const user = userEvent.setup();
  const view = render(<Form controller={controller} draft={draft} session={session} />);
  try {
    expect(screen.queryByRole("textbox", { name: "Address" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("switch", { name: "Deliver to an address" }));
    const address = await screen.findByRole("textbox", { name: "Address" });
    await user.click(screen.getByRole("button", { name: "Confirm delivery" }));
    expect(calls).toHaveLength(0);
    await user.type(address, "Example address");
    await waitFor(() => expect(screen.getByRole("button", { name: "Confirm delivery" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Confirm delivery" }));
    await screen.findByRole("status");
    expect(calls).toEqual([
      {
        arguments: { orderId: "example-order" },
        inputResponses: {
          delivery_details: { action: "accept", content: { address: "Example address", delivery: true } },
        },
        name: "schedule_delivery",
        requestState: "opaque-server-state",
      },
    ]);
  } finally {
    view.unmount();
    controller.dispose();
  }
});

function Form({
  controller,
  session,
  draft,
}: {
  controller: ReturnType<typeof createQuickJsController>;
  session: ReturnType<typeof createDeliveryInputSession>;
  draft: Record<string, unknown>;
}) {
  const draftRef = useRef({ ...draft });
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  return (
    <>
      {error ? <p role="alert">{error}</p> : null}
      {state.error ? <p role="alert">{state.error}</p> : null}
      {done ? <p role="status">Scheduled</p> : null}
      <AutoForm
        defaultValues={session.schema.getDefaultValues()}
        fieldConfig={quickJsFieldConfig(state.presentation)}
        onFieldChange={async (key, value) => {
          draftRef.current = { ...draftRef.current, [key]: value };
          try {
            await session.update(draftRef.current);
          } catch {
            setError("Could not update delivery details");
          }
        }}
        onSubmit={async (values) => {
          try {
            await session.accept(values);
            setDone(true);
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Could not continue");
          }
        }}
        schema={session.schema}
      >
        <Button disabled={state.status !== "ready" || state.submitting || done} type="submit">
          Confirm delivery
        </Button>
      </AutoForm>
    </>
  );
}
