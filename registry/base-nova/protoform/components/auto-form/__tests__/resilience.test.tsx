import { describe, expect, rs } from "@rstest/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutoForm } from "..";
import type { SchemaProvider } from "../core-types";
import { createMockProvider } from "./test-utils";

const SUBMIT_BUTTON = /submit/iu;
const USERNAME_LABEL = /username/iu;

const usernameProvider = createMockProvider([{ key: "username", required: true, type: "string" }]);

describe("AutoForm – onSubmit error handling", () => {
  test("shows a root error when onSubmit throws or rejects", async () => {
    const user = userEvent.setup();

    const view = render(
      <AutoForm
        onSubmit={() => {
          throw new Error("API failed");
        }}
        schema={usernameProvider}
        withSubmit
      />
    );

    await user.type(screen.getByLabelText(USERNAME_LABEL), "alice");
    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON }));
    await waitFor(() => {
      expect(screen.getByText(/api failed/iu)).toBeVisible();
    });

    view.unmount();
    render(
      <AutoForm onSubmit={() => Promise.reject(new Error("Network error"))} schema={usernameProvider} withSubmit />
    );

    await user.type(screen.getByLabelText(USERNAME_LABEL), "bob");
    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON }));
    await waitFor(() => {
      expect(screen.getByText(/network error/iu)).toBeVisible();
    });
  });

  test("aborts superseded and unmounted submit contexts and active provider validation", async () => {
    const user = userEvent.setup();
    const signals: AbortSignal[] = [];
    let finish: (() => void) | undefined;
    const onSubmit = rs.fn(
      (_values, _form, context) =>
        new Promise<void>((resolve) => {
          signals.push(context.signal);
          finish = resolve;
        })
    );

    const view = render(<AutoForm onSubmit={onSubmit} schema={usernameProvider} withSubmit />);
    await user.type(screen.getByLabelText(USERNAME_LABEL), "alice");
    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    finish?.();
    await waitFor(() => expect(screen.getByRole("button", { name: SUBMIT_BUTTON })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));

    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);

    view.unmount();

    expect(signals[1]?.aborted).toBe(true);
    finish?.();

    cleanup();
    let validationSignal: AbortSignal | undefined;
    let finishValidation: (() => void) | undefined;
    const provider: SchemaProvider = {
      getDefaultValues: () => ({ username: "alice" }),
      parseSchema: () => ({ fields: [{ key: "username", required: true, type: "string" }] }),
      validateSchema: (_values, context) =>
        new Promise((resolve) => {
          validationSignal = context?.signal;
          finishValidation = () => resolve({ data: { username: "alice" }, success: true });
        }),
    };
    const viewValidation = render(
      <AutoForm
        schema={provider}
        stepper={{
          steps: [
            { id: "identity", title: "Identity" },
            { id: "review", title: "Review" },
          ],
        }}
        withSubmit
      />
    );

    await user.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() => expect(validationSignal).toBeDefined());
    viewValidation.unmount();

    expect(validationSignal?.aborted).toBe(true);
    finishValidation?.();
  });
});
