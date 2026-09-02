import { afterEach, describe, expect } from "@rstest/core";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "@/components/ui/button";

import { Toaster, toast } from ".";

afterEach(() => {
  act(() => toast.close());
});

describe("Toaster", () => {
  test("renders and dismisses a toast added through the shared manager", async () => {
    const user = userEvent.setup();

    render(
      <Toaster>
        <Button
          onClick={() =>
            toast.add({
              description: "The JSON data was copied to your clipboard.",
              title: "JSON copied",
              type: "success",
            })
          }
        >
          Copy JSON
        </Button>
      </Toaster>
    );

    await user.click(screen.getByRole("button", { name: "Copy JSON" }));

    expect(await screen.findByText("JSON copied")).toBeVisible();
    expect(screen.getByText("The JSON data was copied to your clipboard.")).toBeVisible();

    await user.keyboard("{F6}");
    await user.click(screen.getByRole("button", { name: "Close toast" }));

    await waitFor(() => expect(screen.queryByText("JSON copied")).toBeNull());
  });
});
