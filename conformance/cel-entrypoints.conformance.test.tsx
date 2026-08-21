import { create } from "@bufbuild/protobuf";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AutoForm } from "../registry/base-nova/protoform/components/auto-form/index.js";
import { useProtoForm } from "../registry/base-nova/protoform/hooks/use-proto-form/index.js";
import { InvalidCelRuntimeSchema } from "./gen/protoform/conformance/v1/expected_failures_pb.js";
import { TransitiveCelConsumerSchema } from "./gen/protoform/conformance/v1/transitive_cel_pb.js";

const SUBMIT_BUTTON = /submit/i;

describe("descriptor-aware CEL entrypoints", () => {
  it("resolves transitive imported and nested enum symbols through useProtoForm", async () => {
    const valid = renderHook(() =>
      useProtoForm(TransitiveCelConsumerSchema, {
        defaultValues: create(TransitiveCelConsumerSchema, {
          deployment: { environment: 20, releaseTrack: 7 },
        }),
      })
    );
    const invalid = renderHook(() =>
      useProtoForm(TransitiveCelConsumerSchema, {
        defaultValues: create(TransitiveCelConsumerSchema, {
          deployment: { environment: 10, releaseTrack: 9 },
        }),
      })
    );
    let validResult = false;
    let invalidResult = true;

    await act(async () => {
      validResult = await valid.result.current.trigger();
      invalidResult = await invalid.result.current.trigger();
    });

    expect(validResult).toBe(true);
    expect(invalidResult).toBe(false);
    await waitFor(() => {
      expect(invalid.result.current.formState.errors.deployment?.message).toBe(
        "Production deployments require the stable release track."
      );
    });
  });

  it("does not expose CEL runtime failures through useProtoForm", async () => {
    const form = renderHook(() =>
      useProtoForm(InvalidCelRuntimeSchema, {
        defaultValues: create(InvalidCelRuntimeSchema, { value: 0 }),
      })
    );
    let result = false;

    await act(async () => {
      result = await form.result.current.trigger();
    });

    expect(result).toBe(true);
    expect(form.result.current.formState.errors).toEqual({});
  });

  it("submits descriptor-aware valid values through AutoForm", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <AutoForm
        defaultValues={{
          deployment: { environment: 20, releaseTrack: 7 },
        }}
        onSubmit={onSubmit}
        schema={TransitiveCelConsumerSchema}
        withSubmit
      />
    );

    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it("renders the declared CEL message at its form path through AutoForm", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <AutoForm
        defaultValues={{
          deployment: { environment: 10, releaseTrack: 9 },
        }}
        onSubmit={onSubmit}
        schema={TransitiveCelConsumerSchema}
        testId="transitive-cel"
        withSubmit
      />
    );

    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON }));

    expect(await screen.findByTestId("transitive-cel-field-deployment-error")).toHaveTextContent(
      "Production deployments require the stable release track."
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not render CEL runtime failures through AutoForm", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <AutoForm
        defaultValues={{ value: 0 }}
        onSubmit={onSubmit}
        schema={InvalidCelRuntimeSchema}
        testId="runtime-cel"
        withSubmit
      />
    );

    await user.click(screen.getByRole("button", { name: SUBMIT_BUTTON }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("int divide by zero")).not.toBeInTheDocument();
  });
});
