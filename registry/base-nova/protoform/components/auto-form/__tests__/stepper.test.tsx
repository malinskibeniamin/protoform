import { describe, expect, it, rs } from "@rstest/core";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AutoForm } from "..";
import { createMockProvider } from "./test-utils";

const steps = [
  { id: "basics", title: "Basics" },
  { id: "delivery", title: "Delivery" },
  { id: "review", title: "Review" },
];

describe("AutoForm stepper", () => {
  it("renders a vertical progress rail through the stepper config", () => {
    const schema = createMockProvider([
      { hints: { step: "basics" }, key: "name", required: true, type: "string" },
      { hints: { step: "delivery" }, key: "region", required: true, type: "string" },
      { hints: { step: "review" }, key: "approval", required: true, type: "string" },
    ]);

    render(<AutoForm schema={schema} stepper={{ orientation: "vertical", steps }} withSubmit />);

    const progress = screen.getByRole("navigation", { name: "Form progress" });
    expect(progress).toHaveAttribute("data-orientation", "vertical");
    expect(progress.parentElement).toHaveAttribute("data-layout", "stepper-vertical");
    expect(within(progress).getAllByTestId("step-connector")).toHaveLength(2);
    for (const connector of within(progress).getAllByTestId("step-connector")) {
      expect(connector).toHaveAttribute("data-orientation", "vertical");
    }
    expect(within(progress).getByText("Basics").closest("li")).toHaveAttribute("aria-current", "step");
  });

  it("keeps horizontal steps on one row and adapts labels to its container", () => {
    const schema = createMockProvider([{ key: "name", required: true, type: "string" }]);
    const fiveSteps = [
      { id: "identity", title: "Identity" },
      { id: "topology", title: "Topology" },
      { id: "policy", title: "Policy" },
      { id: "rollout", title: "Rollout" },
      { id: "review", title: "Review" },
    ];

    render(<AutoForm schema={schema} stepper={{ steps: fiveSteps }} withSubmit />);

    const progress = screen.getByRole("navigation", { name: "Form progress" });
    const stepList = progress.querySelector("ol");
    expect(progress).toHaveAttribute("data-orientation", "horizontal");
    expect(stepList).toHaveAttribute("data-layout", "adaptive-horizontal");
    expect(stepList).toHaveStyle({ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" });
    expect(within(progress).getByText("Identity").className).toContain("@min-[30rem]:block");
    expect(within(progress).getByText("Identity").className).toContain("@min-[64rem]:text-left");
  });

  it("renders one step at a time with semantic progress and linear navigation", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider([
      { hints: { step: "basics" }, key: "name", required: true, type: "string" },
      { hints: { step: "delivery" }, key: "region", required: true, type: "string" },
      { hints: { step: "review" }, key: "approval", required: true, type: "string" },
    ]);

    render(<AutoForm schema={schema} stepper={{ steps }} withSubmit />);

    const progress = screen.getByRole("navigation", { name: "Form progress" });
    expect(progress).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(within(progress).getByText("Basics, current step")).toHaveClass("sr-only");
    expect(within(progress).getByText("Basics").closest("li")).toHaveAttribute("aria-current", "step");
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/region/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Basics" }).closest("section")).toHaveAttribute("data-layout", "split");
    expect(within(progress).getByText("Basics").closest("li")).toHaveAttribute("data-state", "current");
    expect(within(progress).getByText("Delivery").closest("li")).toHaveAttribute("data-state", "upcoming");
    expect(within(progress).getAllByTestId("step-connector")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Continue" }).className).toContain("bg-primary");

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    expect(screen.getByLabelText(/region/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });

  it("shows the summary only on the final review step", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider(
      [
        { hints: { step: "basics" }, key: "name", required: true, type: "string" },
        { hints: { step: "delivery" }, key: "region", required: true, type: "string" },
        { hints: { step: "review" }, key: "approval", required: true, type: "string" },
      ],
      { approval: "OPS-42", name: "Ada", region: "eu-central" }
    );

    render(
      <AutoForm
        renderSummary={() => <div>Review summary</div>}
        schema={schema}
        showSummary
        stepper={{ steps }}
        withSubmit
      />
    );

    expect(screen.queryByText("Review summary")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.queryByText("Review summary")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("Review summary")).toBeVisible();
  });

  it("blocks Continue on current-step errors without exposing later-step errors", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider(
      [
        { hints: { step: "basics" }, key: "name", required: true, type: "string" },
        { hints: { step: "delivery" }, key: "region", required: true, type: "string" },
        { hints: { step: "review" }, key: "approval", required: true, type: "string" },
      ],
      {},
      (values) => ({
        errors: [
          ...(values["name"] ? [] : [{ message: "Enter a name.", path: ["name"] }]),
          ...(values["region"] ? [] : [{ message: "Choose a region.", path: ["region"] }]),
        ],
        success: false,
      })
    );

    render(<AutoForm schema={schema} stepper={{ steps }} withSubmit />);

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByText("Enter a name.")).toBeInTheDocument();
    expect(screen.queryByText("Choose a region.")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/name/i), "Ada");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
  });

  it("blocks Continue on resolver root errors", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider(
      [
        { hints: { step: "basics" }, key: "name", required: true, type: "string" },
        { hints: { step: "delivery" }, key: "region", required: true, type: "string" },
      ],
      { name: "Ada", region: "eu-central" }
    );

    render(
      <AutoForm
        resolver={async () => ({
          errors: { root: { message: "The request is not ready.", type: "validation" } },
          values: {},
        })}
        schema={schema}
        stepper={{ steps: steps.slice(0, 2) }}
        withSubmit
      />
    );

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("The request is not ready.")).toBeInTheDocument();
  });

  it("keeps the earlier step active when Back cancels pending validation", async () => {
    const user = userEvent.setup();
    let finishValidation: (() => void) | undefined;
    const schema = createMockProvider(
      [
        { hints: { step: "basics" }, key: "name", required: true, type: "string" },
        { hints: { step: "delivery" }, key: "region", required: true, type: "string" },
        { hints: { step: "review" }, key: "approval", required: true, type: "string" },
      ],
      { approval: "OPS-42", name: "Ada", region: "eu-central" }
    );

    render(
      <AutoForm
        resolver={async (values) => {
          await new Promise<void>((resolve) => {
            finishValidation = resolve;
          });
          return { errors: {}, values };
        }}
        schema={schema}
        stepper={{ defaultStep: "delivery", steps }}
        withSubmit
      />
    );

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("button", { name: "Checking…" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText("Step 1 of 3")).toBeVisible();

    act(() => {
      finishValidation?.();
    });
    await waitFor(() => expect(screen.getByText("Step 1 of 3")).toBeVisible());
  });

  it("submits only from the final step and prevents duplicate submissions", async () => {
    const user = userEvent.setup();
    let finishSubmit: (() => void) | undefined;
    const onSubmit = rs.fn(
      () =>
        new Promise<void>((resolve) => {
          finishSubmit = resolve;
        })
    );
    const schema = createMockProvider(
      [
        { hints: { step: "basics" }, key: "name", required: true, type: "string" },
        { hints: { step: "delivery" }, key: "region", required: true, type: "string" },
        { hints: { step: "review" }, key: "approval", required: true, type: "string" },
      ],
      { approval: "OPS-42", name: "Ada", region: "eu-central" }
    );

    render(<AutoForm onSubmit={onSubmit} schema={schema} stepper={{ steps }} withSubmit />);

    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    const submit = screen.getByRole("button", { name: "Submit" });
    await user.click(submit);
    await user.click(submit);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(submit).toBeDisabled();

    act(() => {
      finishSubmit?.();
    });
  });

  it("returns to the owning step when submission reports a field error", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider(
      [
        { hints: { step: "basics" }, key: "name", required: true, type: "string" },
        { hints: { step: "delivery" }, key: "region", required: true, type: "string" },
        { hints: { step: "review" }, key: "approval", required: true, type: "string" },
      ],
      { approval: "OPS-42", name: "Ada", region: "eu-central" }
    );

    render(
      <AutoForm
        onSubmit={async (_values, form) => {
          await Promise.resolve();
          form.setError("name", { message: "That name is already in use.", type: "server" });
        }}
        resolver={async (values) => ({ errors: {}, values })}
        schema={schema}
        stepper={{ steps }}
        withSubmit
      />
    );

    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByText("That name is already in use.")).toBeInTheDocument();
  });

  it("completes validation recovery and every step using only the keyboard", async () => {
    const user = userEvent.setup();
    const schema = createMockProvider(
      [
        { hints: { step: "basics" }, key: "name", required: true, type: "string" },
        { hints: { step: "delivery" }, key: "region", required: true, type: "string" },
        { hints: { step: "review" }, key: "approval", required: true, type: "string" },
      ],
      {},
      (values) => {
        if (values["name"] && values["region"] && values["approval"]) {
          return { data: values, success: true };
        }
        return {
          errors: [
            ...(values["name"] ? [] : [{ message: "Enter a name.", path: ["name"] }]),
            ...(values["region"] ? [] : [{ message: "Choose a region.", path: ["region"] }]),
            ...(values["approval"] ? [] : [{ message: "Enter approval.", path: ["approval"] }]),
          ],
          success: false,
        };
      }
    );

    render(<AutoForm schema={schema} stepper={{ steps }} withSubmit />);

    await user.tab();
    expect(screen.getByLabelText(/name/i)).toHaveFocus();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(screen.getByText("Enter a name.")).toBeVisible();
    expect(screen.getByLabelText(/name/i)).toHaveFocus();

    await user.keyboard("Ada");
    await user.tab();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByLabelText(/region/i)).toHaveFocus());
    await user.keyboard("eu-central");
    await user.tab();
    await user.tab();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByLabelText(/approval/i)).toHaveFocus());
    await user.keyboard("OPS-42");
    await user.tab();
    await user.tab();
    await user.keyboard("{Enter}");

    expect(screen.getByText("Step 3 of 3")).toBeVisible();
  });
});
