import { describe, expect, it, rs } from "@rstest/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { DataProviderRequest } from "../data-providers";
import { AutoForm } from "../index";
import { createMockProvider } from "./test-utils";

describe("AutoForm data providers v2", () => {
  it("supplies search, cursor, dependencies, selected values, cancellation, and stale-selection policy", async () => {
    const user = userEvent.setup();
    const requests: DataProviderRequest[] = [];
    const schema = createMockProvider(
      [
        { key: "project", required: true, type: "string" },
        {
          fieldConfig: { customData: { dataProvider: "regions" } },
          key: "region",
          required: true,
          type: "string",
        },
      ],
      { project: "project-a", region: "retired-region" }
    );

    const view = render(
      <AutoForm
        dataProviders={{
          regions: {
            dependencies: ["project"],
            staleSelection: "error",
            useProvider: (request) => {
              requests.push(request);
              if (request.cursor) {
                return {
                  options: [{ label: "Eurasia", value: "eurasia" }],
                };
              }
              return {
                nextCursor: "page-2",
                options: [{ label: "Europe", value: "eu" }],
              };
            },
          },
        }}
        formatMessage={(code, _params, fallback) =>
          code === "auto_form.select.stale" ? "Selection unavailable" : fallback
        }
        schema={schema}
      />
    );

    expect(requests.at(-1)).toMatchObject({
      cursor: undefined,
      dependencyValues: { project: "project-a" },
      fieldPath: "region",
      query: "",
      selectedValues: ["retired-region"],
    });
    const initialSignal = requests.at(-1)?.signal;
    expect(screen.getByRole("alert")).toHaveTextContent("Selection unavailable");

    await user.clear(screen.getByRole("textbox", { name: /Project/ }));
    await user.paste("project-b");
    await waitFor(() => expect(requests.at(-1)?.dependencyValues).toEqual({ project: "project-b" }));
    expect(initialSignal?.aborted).toBe(true);

    await user.clear(screen.getByRole("combobox", { name: /Region/ }));
    await user.paste("eur");
    expect(requests.at(-1)).toMatchObject({ query: "eur" });

    await user.click(screen.getByRole("button", { name: "Load more" }));
    expect(requests.at(-1)).toMatchObject({ cursor: "page-2", query: "eur" });
    await user.click(screen.getByRole("combobox", { name: /Region/ }));
    expect(screen.getByText("Europe")).toBeVisible();
    expect(screen.getByText("Eurasia")).toBeVisible();

    const activeSignal = requests.at(-1)?.signal;
    expect(activeSignal?.aborted).toBe(false);
    view.unmount();
    expect(activeSignal?.aborted).toBe(true);
  });

  it("keeps a selected value that is present in the first provider page", async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    const schema = createMockProvider(
      [
        {
          fieldConfig: { customData: { dataProvider: "regions" } },
          key: "region",
          required: true,
          type: "string",
        },
      ],
      { region: "eu" }
    );

    render(
      <AutoForm
        dataProviders={{
          regions: {
            staleSelection: "clear",
            useProvider: () => ({ options: [{ label: "Europe", value: "eu" }] }),
          },
        }}
        onSubmit={onSubmit}
        schema={schema}
        withSubmit
      />
    );

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ region: "eu" });
  });

  it("clears optional numeric provider values without coercing them to zero", async () => {
    const user = userEvent.setup();
    const onSubmit = rs.fn();
    const schema = createMockProvider(
      [
        {
          fieldConfig: { customData: { dataProvider: "regions" } },
          key: "regionId",
          required: false,
          type: "number",
        },
      ],
      { regionId: 7 }
    );

    render(
      <AutoForm
        dataProviders={{ regions: () => ({ options: [{ label: "Europe", value: "7" }] }) }}
        onSubmit={onSubmit}
        schema={schema}
        withSubmit
      />
    );

    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ regionId: undefined });
  });

  it("aborts a repeated-field provider when a dependency changes", async () => {
    const user = userEvent.setup();
    const requests: DataProviderRequest[] = [];
    const schema = createMockProvider(
      [
        { key: "project", required: true, type: "string" },
        {
          key: "methods",
          required: false,
          schema: [
            {
              fieldConfig: { customData: { dataProvider: "methods" } },
              key: "value",
              required: true,
              type: "string",
            },
          ],
          type: "array",
        },
      ],
      { methods: ["get"], project: "project-a" }
    );

    render(
      <AutoForm
        dataProviders={{
          methods: {
            dependencies: ["project"],
            useProvider: (request) => {
              requests.push(request);
              return { options: [{ label: "GET", value: "get" }] };
            },
          },
        }}
        schema={schema}
      />
    );

    const initialSignal = requests.at(-1)?.signal;
    await user.clear(screen.getByRole("textbox", { name: /Project/ }));
    await user.paste("project-b");
    await waitFor(() => expect(requests.at(-1)?.dependencyValues).toEqual({ project: "project-b" }));
    expect(initialSignal?.aborted).toBe(true);
  });
});
