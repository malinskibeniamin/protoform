import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { getReadinessSummary, readinessRequirements } from "../../readiness/profile.js";
import { ReadinessDashboard } from "./readiness-dashboard.js";

describe("ReadinessDashboard", () => {
  it("paginates the capability ledger 25 checks at a time", async () => {
    const user = userEvent.setup();
    render(<ReadinessDashboard />);

    const ledger = screen.getByRole("region", { name: "Capability ledger" });
    const rangeLabel = within(ledger).getByText(
      `Showing 1–25 of 175 matching checks. ${readinessRequirements.length} profile checks total.`
    );
    expect(rangeLabel).toBeVisible();
    expect(rangeLabel.childNodes).toHaveLength(1);
    expect(within(ledger).getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(within(ledger).getByRole("button", { name: "Next page" })).toBeEnabled();
    expect(within(ledger).getByText("String fields")).toBeVisible();
    expect(within(ledger).queryByText("Any")).not.toBeInTheDocument();

    await user.click(within(ledger).getByRole("button", { name: "Next page" }));

    const pageLabel = within(ledger).getByText("Page 2 of 7");
    expect(pageLabel).toBeVisible();
    expect(pageLabel.childNodes).toHaveLength(1);
    expect(within(ledger).queryByText("String fields")).not.toBeInTheDocument();
    expect(within(ledger).getByText("Any")).toBeVisible();
    expect(within(ledger).getByRole("button", { name: "Previous page" })).toBeEnabled();
  });

  it("resets pagination when search or status filters change", async () => {
    const user = userEvent.setup();
    render(<ReadinessDashboard />);

    const ledger = screen.getByRole("region", { name: "Capability ledger" });
    const nextPage = within(ledger).getByRole("button", {
      name: "Next page",
    });
    await user.click(nextPage);

    const search = within(ledger).getByRole("searchbox", {
      name: "Search readiness checks",
    });
    await user.type(search, "AIP-127");

    expect(within(ledger).getByText("Page 1 of 1")).toBeVisible();
    expect(
      within(ledger).getByRole("link", {
        name: "AIP-127 HTTP and gRPC transcoding",
      })
    ).toBeVisible();

    await user.clear(search);
    await user.click(nextPage);
    await user.click(within(ledger).getByRole("button", { name: "External" }));

    expect(within(ledger).getByText("Page 1 of 1")).toBeVisible();
    expect(within(ledger).getByText("Binary wire compatibility")).toBeVisible();
  });

  it("keeps verified optional and out-of-target checks distinct", async () => {
    const user = userEvent.setup();
    render(<ReadinessDashboard />);

    await user.click(screen.getByRole("button", { name: "Optional" }));
    expect(screen.getByText("Protobuf-ES v1 proto2/proto3 migration bridge")).toBeVisible();
    expect(screen.getByText("Verified optional")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Out of target" }));
    expect(screen.getByText("Proto2 groups and extensions")).toBeVisible();
    expect(screen.getAllByText("Out of target")).toHaveLength(2);
  });

  it("shows the score and filters the capability ledger by status", async () => {
    const user = userEvent.setup();
    const summary = getReadinessSummary(readinessRequirements);
    render(<ReadinessDashboard />);

    expect(screen.getByRole("progressbar", { name: "Overall readiness" })).toHaveAttribute(
      "aria-valuenow",
      String(summary.percentage)
    );
    expect(
      screen.getByText(`${summary.excluded} excluded checks stay visible`, {
        exact: false,
      })
    ).toBeVisible();
    expect(screen.getAllByRole("heading", { name: "Protobuf" })[0]).toBeVisible();
    expect(screen.getByRole("button", { name: "Verified" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Gaps" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("String fields")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "All" }));

    expect(screen.getByText("String fields")).toBeVisible();
    const search = screen.getByRole("searchbox", {
      name: "Search readiness checks",
    });
    await user.type(search, "AIP-127");
    expect(screen.getByRole("link", { name: "AIP-127 HTTP and gRPC transcoding" })).toHaveAttribute(
      "href",
      "https://google.aip.dev/127"
    );
    await user.clear(search);

    await user.click(screen.getByRole("button", { name: "Gaps" }));

    expect(screen.queryByText("String fields")).not.toBeInTheDocument();
    expect(screen.queryByText("Service and RPC descriptors")).not.toBeInTheDocument();
    expect(screen.getByText("No readiness checks match these filters.")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "External" }));
    expect(screen.getByText("Binary wire compatibility")).toBeVisible();
  });

  it("explains verified checks from the status map", async () => {
    const user = userEvent.setup();
    render(<ReadinessDashboard />);

    const verifiedCheck = screen.getByRole("button", {
      name: "String fields: Verified",
    });
    await user.hover(verifiedCheck);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("maps $key into the stable field model");

    await user.unhover(verifiedCheck);
    const serviceCheck = screen.getByRole("button", {
      name: "Service and RPC descriptors: Verified",
    });
    await user.hover(serviceCheck);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Generated service methods now expose request descriptors"
    );
  });
});
