import { describe, expect, rs } from "@rstest/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AutoForm } from "..";
import type { SchemaProvider } from "../core-types";
import { createMockProvider } from "./test-utils";

const SUBMIT_BUTTON = /submit/iu;
const USERNAME_LABEL = /username/iu;

const usernameProvider = createMockProvider([{ key: "username", required: true, type: "string" }]);

describe("AutoForm – onSubmit error handling", () => {
  test("shows root error when onSubmit throws", async () => {
    const user = userEvent.setup();

    render(
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
      expect(screen.getByText(/api failed/iu)).toBeInTheDocument();
    });
  });

  test("shows root error when onSubmit rejects", async () => {
    const user = userEvent.setup();

    render(
      <AutoForm onSubmit={() => Promise.reject(new Error("Network error"))} schema={usernameProvider} withSubmit />
    );

    await user.type(screen.getByLabelText(USERNAME_LABEL), "bob");
    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON }));

    await waitFor(() => {
      expect(screen.getByText(/network error/iu)).toBeInTheDocument();
    });
  });

  test("aborts the previous submit context before a newer attempt", async () => {
    const user = userEvent.setup();
    const signals: AbortSignal[] = [];
    const onSubmit = rs.fn(async (_values, _form, context) => {
      signals.push(context.signal);
      await Promise.resolve();
    });

    render(<AutoForm onSubmit={onSubmit} schema={usernameProvider} withSubmit />);
    await user.type(screen.getByLabelText(USERNAME_LABEL), "alice");
    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));

    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
  });

  test("aborts active submission when the form unmounts", async () => {
    const user = userEvent.setup();
    let signal: AbortSignal | undefined;
    let finish: (() => void) | undefined;
    const onSubmit = rs.fn(
      (_values, _form, context) =>
        new Promise<void>((resolve) => {
          ({ signal } = context);
          finish = resolve;
        })
    );
    const view = render(<AutoForm onSubmit={onSubmit} schema={usernameProvider} withSubmit />);

    await user.type(screen.getByLabelText(USERNAME_LABEL), "alice");
    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    view.unmount();

    expect(signal?.aborted).toBe(true);
    finish?.();
  });

  test("aborts active provider validation when the form unmounts", async () => {
    const user = userEvent.setup();
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
    const view = render(
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
    view.unmount();

    expect(validationSignal?.aborted).toBe(true);
    finishValidation?.();
  });
});
